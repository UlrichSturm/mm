import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
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
    private readonly emailService: EmailService,
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
    try {
      if (order.payment) {
        await this.prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
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
            stripePaymentIntentId: paymentIntent.id,
            amount: new Decimal(totalAmount),
            platformFee: new Decimal(platformFee),
            stripeFee: new Decimal(stripeFee),
            vendorPayout: new Decimal(vendorPayout),
            status: PaymentStatus.PROCESSING,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to save payment record: ${(error as Error).message}`);
      // Try to cancel the payment intent if payment record creation fails
      try {
        await this.stripeService.cancelPaymentIntent(paymentIntent.id);
      } catch (cancelError) {
        this.logger.error(`Failed to cancel PaymentIntent after error: ${(cancelError as Error).message}`);
      }
      throw new BadRequestException('Failed to create payment record. Please try again.');
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
   * Idempotent: can be called multiple times safely
   */
  async confirmPayment(paymentIntentId: string) {
    this.logger.log(`Confirming payment for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with PaymentIntent ${paymentIntentId} not found`);
    }

    // Idempotency check: if already completed, return existing payment
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.log(`Payment ${payment.id} already confirmed, returning existing payment`);
      return this.formatPaymentResponse(payment);
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
      include: {
        order: true,
      },
    });

    // Update order status to CONFIRMED (only if not already confirmed)
    if (payment.order.status !== OrderStatus.CONFIRMED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.CONFIRMED,
        },
      });
    }

    this.logger.log(
      `Payment ${payment.id} confirmed, order ${payment.order.orderNumber} status updated to CONFIRMED`,
    );

    // Send email notification about successful payment
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              firstName: true,
            },
          },
          items: {
            include: {
              service: true,
            },
          },
        },
      });

      if (order && order.client.email && order.client.firstName) {
        await this.emailService.sendOrderConfirmation(order.client.email, {
          firstName: order.client.firstName,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: order.items.map(item => ({
            name: item.serviceName,
            quantity: item.quantity,
            price: `€${Number(item.totalPrice).toFixed(2)}`,
          })),
          totalPrice: `€${Number(order.totalPrice).toFixed(2)}`,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation email: ${(error as Error).message}`);
    }

    return this.formatPaymentResponse(updatedPayment);
  }

  /**
   * Handle failed payment
   * Idempotent: can be called multiple times safely
   */
  async handlePaymentFailed(paymentIntentId: string) {
    this.logger.log(`Handling failed payment for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      this.logger.warn(`Payment with PaymentIntent ${paymentIntentId} not found`);
      return;
    }

    // Idempotency check: if already failed, skip update
    if (payment.status === PaymentStatus.FAILED) {
      this.logger.log(`Payment ${payment.id} already marked as FAILED`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    this.logger.log(`Payment ${payment.id} marked as FAILED`);

    // Send email notification about failed payment
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        include: {
          client: true,
        },
      });

      if (order && order.client.email && order.client.firstName) {
        await this.emailService.sendOrderStatusUpdate(
          order.client.email,
          order.client.firstName,
          order.orderNumber,
          'PAYMENT_FAILED',
          'Your payment could not be processed. Please try again or contact support.',
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send payment failed email: ${(error as Error).message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   * Idempotent: duplicate events are handled safely
   */
  async handleWebhook(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type} (id: ${event.id})`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
          await this.confirmPayment(paymentIntent.id);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.warn(`Payment intent failed: ${paymentIntent.id}`);
          await this.handlePaymentFailed(paymentIntent.id);
          break;
        }

        case 'payment_intent.canceled': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);
          await this.handlePaymentFailed(paymentIntent.id);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          if (charge.payment_intent) {
            this.logger.log(`Charge refunded: ${charge.id} for PaymentIntent: ${charge.payment_intent}`);
            await this.handleRefund(charge.payment_intent as string);
          }
          break;
        }

        default:
          this.logger.log(`Unhandled event type: ${event.type} (id: ${event.id})`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type} (id: ${event.id}): ${(error as Error).message}`,
      );
      // Don't throw - webhook should return 200 even on errors to prevent retries
      // Stripe will retry on 5xx errors, but we want to handle errors gracefully
    }
  }

  /**
   * Handle refund
   * Idempotent: can be called multiple times safely
   */
  async handleRefund(paymentIntentId: string) {
    this.logger.log(`Handling refund for PaymentIntent ${paymentIntentId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      this.logger.warn(`Payment with PaymentIntent ${paymentIntentId} not found`);
      return;
    }

    // Idempotency check: if already refunded, skip update
    if (payment.status === PaymentStatus.REFUNDED) {
      this.logger.log(`Payment ${payment.id} already refunded`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    // Update order status (only if not already refunded)
    if (payment.order.status !== OrderStatus.REFUNDED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.REFUNDED,
        },
      });
    }

    this.logger.log(`Payment ${payment.id} refunded, order ${payment.order.orderNumber} status updated to REFUNDED`);

    // Send email notification about refund
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              firstName: true,
            },
          },
        },
      });

      if (order && order.client.email && order.client.firstName) {
        await this.emailService.sendOrderStatusUpdate(
          order.client.email,
          order.client.firstName,
          order.orderNumber,
          'REFUNDED',
          'Your payment has been refunded. The refund will be processed to your original payment method.',
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send refund email: ${(error as Error).message}`);
    }
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

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('No Stripe payment intent found');
    }

    // Create refund in Stripe
    await this.stripeService.createRefund(payment.stripePaymentIntentId);

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
   * Find payment by Stripe Payment Intent ID
   */
  async findPaymentByIntentId(paymentIntentId: string) {
    return this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        order: true,
      },
    });
  }

  /**
   * Format payment for API response
   */
  private formatPaymentResponse(payment: any) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order?.orderNumber,
      stripePaymentIntentId: payment.stripePaymentIntentId,
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
