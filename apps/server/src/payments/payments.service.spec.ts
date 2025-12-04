import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: PrismaService;
  let stripeService: StripeService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      // Arrange
      const userId = 'client-id';
      const dto: CreatePaymentIntentDto = {
        orderId: 'order-id',
      };

      const mockOrder = {
        id: 'order-id',
        orderNumber: 'ORD-2025-000001',
        totalPrice: new Decimal(238),
        status: OrderStatus.PENDING,
        clientId: userId,
        client: {
          id: userId,
        },
        payment: null,
      };

      const mockStripePaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 23800, // in cents
        currency: 'eur',
        status: 'requires_confirmation',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockStripeService.createPaymentIntent.mockResolvedValue(mockStripePaymentIntent);
      mockPrismaService.payment.create.mockResolvedValue({
        id: 'payment-id',
        orderId: 'order-id',
        stripePaymentIntentId: 'pi_test_123',
        amount: new Decimal(238),
        status: PaymentStatus.PROCESSING,
      });

      // Act
      const result = await service.createPaymentIntent(userId, dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.clientSecret).toBe('pi_test_123_secret');
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: dto.orderId },
        include: { client: true, payment: true },
      });
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 23800,
          currency: 'eur',
          metadata: expect.objectContaining({
            orderId: 'order-id',
          }),
        }),
      );
      expect(mockPrismaService.payment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      const userId = 'client-id';
      const dto: CreatePaymentIntentDto = {
        orderId: 'non-existent-order',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order already has completed payment', async () => {
      // Arrange
      const userId = 'client-id';
      const dto: CreatePaymentIntentDto = {
        orderId: 'order-id',
      };

      const mockOrder = {
        id: 'order-id',
        orderNumber: 'ORD-2025-000001',
        totalPrice: new Decimal(238),
        status: OrderStatus.PENDING,
        clientId: userId,
        client: {
          id: userId,
        },
        payment: {
          id: 'existing-payment-id',
          status: PaymentStatus.COMPLETED,
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order is not in PENDING status', async () => {
      // Arrange
      const userId = 'client-id';
      const dto: CreatePaymentIntentDto = {
        orderId: 'order-id',
      };

      const mockOrder = {
        id: 'order-id',
        orderNumber: 'ORD-2025-000001',
        totalPrice: new Decimal(238),
        status: OrderStatus.CONFIRMED,
        clientId: userId,
        client: {
          id: userId,
        },
        payment: null,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act & Assert
      await expect(service.createPaymentIntent(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      // Arrange
      const paymentIntentId = 'pi_test_123';

      const mockPayment = {
        id: 'payment-id',
        orderId: 'order-id',
        stripePaymentIntentId: paymentIntentId,
        amount: new Decimal(238),
        status: PaymentStatus.PENDING,
        order: {
          id: 'order-id',
          status: OrderStatus.PENDING,
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
        status: PaymentStatus.COMPLETED,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockPayment.order,
        status: OrderStatus.CONFIRMED,
      });

      // Act
      const result = await service.confirmPayment(paymentIntentId);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { order: true },
      });
      expect(mockPrismaService.payment.update).toHaveBeenCalled();
      expect(mockPrismaService.order.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when payment not found', async () => {
      // Arrange
      const paymentIntentId = 'non-existent-pi';
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.confirmPayment(paymentIntentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded event', async () => {
      // Arrange
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'succeeded',
          },
        },
      } as any;

      const mockPayment = {
        id: 'payment-id',
        orderId: 'order-id',
        stripePaymentIntentId: 'pi_test_123',
        status: PaymentStatus.PENDING,
        order: {
          id: 'order-id',
          status: OrderStatus.PENDING,
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.COMPLETED,
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockPayment.order,
        status: OrderStatus.CONFIRMED,
      });

      // Act
      await service.handleWebhook(mockEvent);

      // Assert
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_123' },
        data: { status: PaymentStatus.COMPLETED },
      });
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-id' },
        data: { status: OrderStatus.CONFIRMED },
      });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      // Arrange
      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            status: 'payment_failed',
          },
        },
      } as any;

      const mockPayment = {
        id: 'payment-id',
        orderId: 'order-id',
        stripePaymentIntentId: 'pi_test_123',
        status: PaymentStatus.PENDING,
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.FAILED,
      });

      // Act
      await service.handleWebhook(mockEvent);

      // Assert
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_123' },
        data: { status: PaymentStatus.FAILED },
      });
    });
  });

});

