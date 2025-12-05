"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
describe('PaymentsService', () => {
    let service;
    let prismaService;
    let stripeService;
    const mockPrismaService = {
        order: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        payment: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    const mockStripeService = {
        createPaymentIntent: jest.fn(),
        createRefund: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                payments_service_1.PaymentsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: stripe_service_1.StripeService,
                    useValue: mockStripeService,
                },
            ],
        }).compile();
        service = module.get(payments_service_1.PaymentsService);
        prismaService = module.get(prisma_service_1.PrismaService);
        stripeService = module.get(stripe_service_1.StripeService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createPaymentIntent', () => {
        it('should create payment intent successfully', async () => {
            const userId = 'client-id';
            const dto = {
                orderId: 'order-id',
            };
            const mockOrder = {
                id: 'order-id',
                orderNumber: 'ORD-2025-000001',
                totalPrice: new library_1.Decimal(238),
                status: client_1.OrderStatus.PENDING,
                clientId: userId,
                client: {
                    id: userId,
                },
                payment: null,
            };
            const mockStripePaymentIntent = {
                id: 'pi_test_123',
                client_secret: 'pi_test_123_secret',
                amount: 23800,
                currency: 'eur',
                status: 'requires_confirmation',
            };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            mockStripeService.createPaymentIntent.mockResolvedValue(mockStripePaymentIntent);
            mockPrismaService.payment.create.mockResolvedValue({
                id: 'payment-id',
                orderId: 'order-id',
                stripePaymentIntentId: 'pi_test_123',
                amount: new library_1.Decimal(238),
                status: client_1.PaymentStatus.PROCESSING,
            });
            const result = await service.createPaymentIntent(userId, dto);
            expect(result).toBeDefined();
            expect(result.clientSecret).toBe('pi_test_123_secret');
            expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
                where: { id: dto.orderId },
                include: { client: true, payment: true },
            });
            expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(expect.objectContaining({
                amount: 23800,
                currency: 'eur',
                metadata: expect.objectContaining({
                    orderId: 'order-id',
                }),
            }));
            expect(mockPrismaService.payment.create).toHaveBeenCalled();
        });
        it('should throw NotFoundException when order not found', async () => {
            const userId = 'client-id';
            const dto = {
                orderId: 'non-existent-order',
            };
            mockPrismaService.order.findUnique.mockResolvedValue(null);
            await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw BadRequestException when order already has completed payment', async () => {
            const userId = 'client-id';
            const dto = {
                orderId: 'order-id',
            };
            const mockOrder = {
                id: 'order-id',
                orderNumber: 'ORD-2025-000001',
                totalPrice: new library_1.Decimal(238),
                status: client_1.OrderStatus.PENDING,
                clientId: userId,
                client: {
                    id: userId,
                },
                payment: {
                    id: 'existing-payment-id',
                    status: client_1.PaymentStatus.COMPLETED,
                },
            };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException when order is not in PENDING status', async () => {
            const userId = 'client-id';
            const dto = {
                orderId: 'order-id',
            };
            const mockOrder = {
                id: 'order-id',
                orderNumber: 'ORD-2025-000001',
                totalPrice: new library_1.Decimal(238),
                status: client_1.OrderStatus.CONFIRMED,
                clientId: userId,
                client: {
                    id: userId,
                },
                payment: null,
            };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('confirmPayment', () => {
        it('should confirm payment successfully', async () => {
            const paymentIntentId = 'pi_test_123';
            const mockPayment = {
                id: 'payment-id',
                orderId: 'order-id',
                stripePaymentIntentId: paymentIntentId,
                amount: new library_1.Decimal(238),
                status: client_1.PaymentStatus.PENDING,
                order: {
                    id: 'order-id',
                    status: client_1.OrderStatus.PENDING,
                },
            };
            const mockStripePaymentIntent = {
                id: paymentIntentId,
                status: 'succeeded',
                amount: 23800,
            };
            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: client_1.PaymentStatus.COMPLETED,
            });
            mockPrismaService.order.update.mockResolvedValue({
                ...mockPayment.order,
                status: client_1.OrderStatus.CONFIRMED,
            });
            const result = await service.confirmPayment(paymentIntentId);
            expect(result).toBeDefined();
            expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
                where: { stripePaymentIntentId: paymentIntentId },
                include: { order: true },
            });
            expect(mockPrismaService.payment.update).toHaveBeenCalled();
            expect(mockPrismaService.order.update).toHaveBeenCalled();
        });
        it('should throw NotFoundException when payment not found', async () => {
            const paymentIntentId = 'non-existent-pi';
            mockPrismaService.payment.findUnique.mockResolvedValue(null);
            await expect(service.confirmPayment(paymentIntentId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('handleWebhook', () => {
        it('should handle payment_intent.succeeded event', async () => {
            const mockEvent = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_test_123',
                        status: 'succeeded',
                    },
                },
            };
            const mockPayment = {
                id: 'payment-id',
                orderId: 'order-id',
                stripePaymentIntentId: 'pi_test_123',
                status: client_1.PaymentStatus.PENDING,
                order: {
                    id: 'order-id',
                    status: client_1.OrderStatus.PENDING,
                },
            };
            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: client_1.PaymentStatus.COMPLETED,
            });
            mockPrismaService.order.update.mockResolvedValue({
                ...mockPayment.order,
                status: client_1.OrderStatus.CONFIRMED,
            });
            await service.handleWebhook(mockEvent);
            expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
                where: { stripePaymentIntentId: 'pi_test_123' },
                data: { status: client_1.PaymentStatus.COMPLETED },
            });
            expect(mockPrismaService.order.update).toHaveBeenCalledWith({
                where: { id: 'order-id' },
                data: { status: client_1.OrderStatus.CONFIRMED },
            });
        });
        it('should handle payment_intent.payment_failed event', async () => {
            const mockEvent = {
                type: 'payment_intent.payment_failed',
                data: {
                    object: {
                        id: 'pi_test_123',
                        status: 'payment_failed',
                    },
                },
            };
            const mockPayment = {
                id: 'payment-id',
                orderId: 'order-id',
                stripePaymentIntentId: 'pi_test_123',
                status: client_1.PaymentStatus.PENDING,
            };
            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: client_1.PaymentStatus.FAILED,
            });
            await service.handleWebhook(mockEvent);
            expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
                where: { stripePaymentIntentId: 'pi_test_123' },
                data: { status: client_1.PaymentStatus.FAILED },
            });
        });
    });
});
//# sourceMappingURL=payments.service.spec.js.map