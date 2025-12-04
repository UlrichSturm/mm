"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const PLATFORM_FEE_RATE = 0.05;
const STRIPE_FEE_RATE = 0.029;
const STRIPE_FIXED_FEE = 0.25;
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, stripeService, emailService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPaymentIntent(userId, dto) {
        this.logger.log(`Creating payment intent for order ${dto.orderId}`);
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: {
                client: true,
                payment: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${dto.orderId} not found`);
        }
        if (order.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this order');
        }
        if (order.status !== client_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot create payment for order with status ${order.status}`);
        }
        if (order.payment && order.payment.status === client_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Order is already paid');
        }
        const amountInCents = Math.round(Number(order.totalPrice) * 100);
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
        const totalAmount = Number(order.totalPrice);
        const platformFee = totalAmount * PLATFORM_FEE_RATE;
        const stripeFee = totalAmount * STRIPE_FEE_RATE + STRIPE_FIXED_FEE;
        const vendorPayout = totalAmount - platformFee - stripeFee;
        try {
            if (order.payment) {
                await this.prisma.payment.update({
                    where: { id: order.payment.id },
                    data: {
                        stripePaymentIntentId: paymentIntent.id,
                        amount: new library_1.Decimal(totalAmount),
                        platformFee: new library_1.Decimal(platformFee),
                        stripeFee: new library_1.Decimal(stripeFee),
                        vendorPayout: new library_1.Decimal(vendorPayout),
                        status: client_1.PaymentStatus.PROCESSING,
                    },
                });
            }
            else {
                await this.prisma.payment.create({
                    data: {
                        orderId: order.id,
                        stripePaymentIntentId: paymentIntent.id,
                        amount: new library_1.Decimal(totalAmount),
                        platformFee: new library_1.Decimal(platformFee),
                        stripeFee: new library_1.Decimal(stripeFee),
                        vendorPayout: new library_1.Decimal(vendorPayout),
                        status: client_1.PaymentStatus.PROCESSING,
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to save payment record: ${error.message}`);
            try {
                await this.stripeService.cancelPaymentIntent(paymentIntent.id);
            }
            catch (cancelError) {
                this.logger.error(`Failed to cancel PaymentIntent after error: ${cancelError.message}`);
            }
            throw new common_1.BadRequestException('Failed to create payment record. Please try again.');
        }
        return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: amountInCents,
            currency: 'eur',
        };
    }
    async confirmPayment(paymentIntentId) {
        this.logger.log(`Confirming payment for PaymentIntent ${paymentIntentId}`);
        const payment = await this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: {
                order: true,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with PaymentIntent ${paymentIntentId} not found`);
        }
        if (payment.status === client_1.PaymentStatus.COMPLETED) {
            this.logger.log(`Payment ${payment.id} already confirmed, returning existing payment`);
            return this.formatPaymentResponse(payment);
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                paidAt: new Date(),
            },
            include: {
                order: true,
            },
        });
        if (payment.order.status !== client_1.OrderStatus.CONFIRMED) {
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: client_1.OrderStatus.CONFIRMED,
                },
            });
        }
        this.logger.log(`Payment ${payment.id} confirmed, order ${payment.order.orderNumber} status updated to CONFIRMED`);
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
        }
        catch (error) {
            this.logger.error(`Failed to send payment confirmation email: ${error.message}`);
        }
        return this.formatPaymentResponse(updatedPayment);
    }
    async handlePaymentFailed(paymentIntentId) {
        this.logger.log(`Handling failed payment for PaymentIntent ${paymentIntentId}`);
        const payment = await this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (!payment) {
            this.logger.warn(`Payment with PaymentIntent ${paymentIntentId} not found`);
            return;
        }
        if (payment.status === client_1.PaymentStatus.FAILED) {
            this.logger.log(`Payment ${payment.id} already marked as FAILED`);
            return;
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.FAILED,
            },
        });
        this.logger.log(`Payment ${payment.id} marked as FAILED`);
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: payment.orderId },
                include: {
                    client: true,
                },
            });
            if (order && order.client.email && order.client.firstName) {
                await this.emailService.sendOrderStatusUpdate(order.client.email, order.client.firstName, order.orderNumber, 'PAYMENT_FAILED', 'Your payment could not be processed. Please try again or contact support.');
            }
        }
        catch (error) {
            this.logger.error(`Failed to send payment failed email: ${error.message}`);
        }
    }
    async handleWebhook(event) {
        this.logger.log(`Processing webhook event: ${event.type} (id: ${event.id})`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const paymentIntent = event.data.object;
                    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
                    await this.confirmPayment(paymentIntent.id);
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const paymentIntent = event.data.object;
                    this.logger.warn(`Payment intent failed: ${paymentIntent.id}`);
                    await this.handlePaymentFailed(paymentIntent.id);
                    break;
                }
                case 'payment_intent.canceled': {
                    const paymentIntent = event.data.object;
                    this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);
                    await this.handlePaymentFailed(paymentIntent.id);
                    break;
                }
                case 'charge.refunded': {
                    const charge = event.data.object;
                    if (charge.payment_intent) {
                        this.logger.log(`Charge refunded: ${charge.id} for PaymentIntent: ${charge.payment_intent}`);
                        await this.handleRefund(charge.payment_intent);
                    }
                    break;
                }
                default:
                    this.logger.log(`Unhandled event type: ${event.type} (id: ${event.id})`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing webhook event ${event.type} (id: ${event.id}): ${error.message}`);
        }
    }
    async handleRefund(paymentIntentId) {
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
        if (payment.status === client_1.PaymentStatus.REFUNDED) {
            this.logger.log(`Payment ${payment.id} already refunded`);
            return;
        }
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.REFUNDED,
                refundedAt: new Date(),
            },
        });
        if (payment.order.status !== client_1.OrderStatus.REFUNDED) {
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: client_1.OrderStatus.REFUNDED,
                },
            });
        }
        this.logger.log(`Payment ${payment.id} refunded, order ${payment.order.orderNumber} status updated to REFUNDED`);
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
                await this.emailService.sendOrderStatusUpdate(order.client.email, order.client.firstName, order.orderNumber, 'REFUNDED', 'Your payment has been refunded. The refund will be processed to your original payment method.');
            }
        }
        catch (error) {
            this.logger.error(`Failed to send refund email: ${error.message}`);
        }
    }
    async createRefund(paymentId, userId, userRole) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: true,
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment ${paymentId} not found`);
        }
        if (userRole !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can process refunds');
        }
        if (payment.status !== client_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only refund completed payments');
        }
        if (!payment.stripePaymentIntentId) {
            throw new common_1.BadRequestException('No Stripe payment intent found');
        }
        await this.stripeService.createRefund(payment.stripePaymentIntentId);
        return { message: 'Refund initiated' };
    }
    async findOne(id, userId, userRole) {
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
            throw new common_1.NotFoundException(`Payment ${id} not found`);
        }
        if (userRole !== client_1.Role.ADMIN && payment.order.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this payment');
        }
        return this.formatPaymentResponse(payment);
    }
    async findAll(filters) {
        const { status, clientId, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
    async getMyPayments(clientId, filters) {
        return this.findAll({ ...filters, clientId });
    }
    async findPaymentByIntentId(paymentIntentId) {
        return this.prisma.payment.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
            include: {
                order: true,
            },
        });
    }
    formatPaymentResponse(payment) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService,
        email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map