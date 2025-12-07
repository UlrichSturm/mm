import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentStatus, OrderStatus, Role } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { Decimal } from '@prisma/client/runtime/library';
import Stripe from 'stripe';

// Platform fee percentage (5%)
const PLATFORM_FEE_RATE = 0.05;
// Stripe fee (2.9% + €0.25)
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FIXED_FEE = 0.25;

export interface PaymentFilters {
  status?: PaymentStatus;
  clientId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    this.logger.log(`Creating payment intent for order ${dto.orderId}`);

    // Get order
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        client: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    // Verify ownership
    if (order.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Check order status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Cannot create payment for order with status ${order.status}`);
    }

    // Check if payment already exists
    if (order.payment && order.payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Order is already paid');
    }

    // Calculate amount in cents
    const amountInCents = Math.round(Number(order.totalPrice) * 100);

    // Create Stripe payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientId: order.clientId,
      },
      description: `Order ${order.orderNumber}`,
    });

    // Calculate fees
    const totalAmount = Number(order.totalPrice);
    const platformFee = totalAmount * PLATFORM_FEE_RATE;
    const stripeFee = totalAmount * STRIPE_FEE_RATE + STRIPE_FIXED_FEE;
    const vendorPayout = totalAmount - platformFee - stripeFee;

    // Create or update payment record
    if (order.payment) {
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          stripePaymentId: paymentIntent.id,
          amount: new Decimal(totalAmount),
          platformFee: new Decimal(platformFee),
          stripeFee: new Decimal(stripeFee),
          vendorPayout: new Decimal(vendorPayout),
          status: PaymentStatus.PROCESSING,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          stripePaymentId: paymentIntent.id,
          amount: new Decimal(totalAmount),
          platformFee: new Decimal(platformFee),
          stripeFee: new Decimal(stripeFee),
          vendorPayout: new Decimal(vendorPayout),
          status: PaymentStatus.PROCESSING,
        },
      });
    }

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents,
      currency: 'eur',
    };
  }

  /**
   * Handle successful payment (called after Stripe confirms)
   */
  async confirmPayment(paymentIntentId: string) {
    this.logger.log(`Confirming payment for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with PaymentIntent ${paymentIntentId} not found`);
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      } as any, // Type assertion needed due to Prisma type generation
      include: {
        order: true,
      },
    });

    // Update order status to CONFIRMED
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.CONFIRMED,
      },
    });

    this.logger.log(
      `Payment ${payment.id} confirmed, order ${payment.order.orderNumber} status updated to CONFIRMED`,
    );

    // TODO: Send email notification about successful payment

    return this.formatPaymentResponse(updatedPayment);
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(paymentIntentId: string) {
    this.logger.log(`Handling failed payment for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!payment) {
      this.logger.warn(`Payment with PaymentIntent ${paymentIntentId} not found`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    this.logger.log(`Payment ${payment.id} marked as FAILED`);

    // TODO: Send email notification about failed payment
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await this.handleRefund(charge.payment_intent as string);
        }
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle refund
   */
  async handleRefund(paymentIntentId: string) {
    this.logger.log(`Handling refund for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntentId },
    });

    if (!payment) {
      this.logger.warn(`Payment with PaymentIntent ${paymentIntentId} not found`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.REFUNDED,
      },
    });

    this.logger.log(`Payment ${payment.id} refunded`);

    // TODO: Send email notification about refund
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId: string, userId: string, userRole: Role) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // Only admin can initiate refunds
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can process refunds');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (!payment.stripePaymentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    // Create refund in Stripe
    await this.stripeService.createRefund(payment.stripePaymentId);

    // Status will be updated via webhook
    return { message: 'Refund initiated' };
  }

  /**
   * Get payment by ID
   */
  async findOne(id: string, userId: string, userRole: Role) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    // Check access
    if (userRole !== Role.ADMIN && payment.order.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    return this.formatPaymentResponse(payment);
  }

  /**
   * Get all payments (admin) or client payments
   */
  async findAll(filters: PaymentFilters) {
    const { status, clientId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.order = {
        clientId,
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              client: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map(payment => this.formatPaymentResponse(payment)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client's payments
   */
  async getMyPayments(clientId: string, filters: Omit<PaymentFilters, 'clientId'>) {
    return this.findAll({ ...filters, clientId });
  }

  /**
   * Format payment for API response
   */
  private formatPaymentResponse(payment: any) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order?.orderNumber,
      stripePaymentId: payment.stripePaymentId,
      amount: Number(payment.amount),
      currency: payment.currency,
      platformFee: Number(payment.platformFee),
      stripeFee: Number(payment.stripeFee),
      vendorPayout: Number(payment.vendorPayout),
      status: payment.status,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
