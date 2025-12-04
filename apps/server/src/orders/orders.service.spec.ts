import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, ServiceStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    service: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create order successfully', async () => {
      // Arrange
      const clientId = 'client-id';
      const dto: CreateOrderDto = {
        items: [
          {
            serviceId: 'service-1',
            quantity: 2,
            notes: 'Test notes',
          },
        ],
        notes: 'Order notes',
      };

      const mockService = {
        id: 'service-1',
        name: 'Test Service',
        price: new Decimal(100),
        status: ServiceStatus.ACTIVE,
        vendor: {
          id: 'vendor-id',
          businessName: 'Test Vendor',
        },
      };

      const mockOrder = {
        id: 'order-id',
        orderNumber: 'ORD-2025-000001',
        clientId,
        subtotal: new Decimal(200),
        tax: new Decimal(38),
        totalPrice: new Decimal(238),
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'item-id',
            serviceId: 'service-1',
            quantity: 2,
            unitPrice: new Decimal(100),
            totalPrice: new Decimal(200),
          },
        ],
        client: {
          id: clientId,
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        payment: null,
      };

      mockPrismaService.service.findMany.mockResolvedValue([mockService]);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      // Act
      const result = await service.create(clientId, dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['service-1'] },
          status: ServiceStatus.ACTIVE,
        },
        include: { vendor: true },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when service not found', async () => {
      // Arrange
      const clientId = 'client-id';
      const dto: CreateOrderDto = {
        items: [
          {
            serviceId: 'non-existent-service',
            quantity: 1,
          },
        ],
      };

      mockPrismaService.service.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(service.create(clientId, dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.service.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException when service is inactive', async () => {
      // Arrange
      const clientId = 'client-id';
      const dto: CreateOrderDto = {
        items: [
          {
            serviceId: 'service-1',
            quantity: 1,
          },
        ],
      };

      const inactiveService = {
        id: 'service-1',
        status: ServiceStatus.INACTIVE,
      };

      mockPrismaService.service.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(service.create(clientId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders list', async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
      };

      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-2025-000001',
          status: OrderStatus.PENDING,
          clientId: 'client-id',
          items: [
            {
              id: 'item-1',
              serviceId: 'service-id',
              serviceName: 'Test Service',
              quantity: 1,
              unitPrice: new Decimal(100),
              totalPrice: new Decimal(100),
              service: {
                id: 'service-id',
                vendor: {
                  id: 'vendor-id',
                  businessName: 'Test Vendor',
                  contactEmail: 'vendor@example.com',
                },
              },
            },
          ],
          client: {
            id: 'client-id',
            email: 'client@example.com',
          },
          payment: null,
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(mockPrismaService.order.findMany).toHaveBeenCalled();
      expect(mockPrismaService.order.count).toHaveBeenCalled();
    });

    it('should filter orders by status', async () => {
      // Arrange
      const filters = {
        status: OrderStatus.CONFIRMED,
        page: 1,
        limit: 10,
      };

      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      // Act
      await service.findAll(filters);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OrderStatus.CONFIRMED,
          }),
        }),
      );
    });

    it('should filter orders by clientId', async () => {
      // Arrange
      const filters = {
        clientId: 'client-id',
        page: 1,
        limit: 10,
      };

      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      // Act
      await service.findAll(filters);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clientId: 'client-id',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      // Arrange
      const orderId = 'order-id';
      const userId = 'user-id';
      const userRole = Role.ADMIN;
      const mockOrder = {
        id: orderId,
        orderNumber: 'ORD-2025-000001',
        status: OrderStatus.PENDING,
        clientId: 'client-id',
        items: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Act
      const result = await service.findOne(orderId, userId, userRole);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-order';
      const userId = 'user-id';
      const userRole = Role.ADMIN;
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(orderId, userId, userRole)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const orderId = 'order-id';
      const userId = 'user-id';
      const userRole = Role.ADMIN;
      const dto: UpdateOrderStatusDto = {
        status: OrderStatus.CONFIRMED,
      };

      const existingOrder = {
        id: orderId,
        orderNumber: 'ORD-2025-000001',
        status: OrderStatus.PENDING,
        clientId: 'client-id',
        subtotal: new Decimal(100),
        tax: new Decimal(19),
        totalPrice: new Decimal(119),
        items: [
          {
            id: 'item-id',
            serviceId: 'service-id',
            serviceName: 'Test Service',
            quantity: 1,
            unitPrice: new Decimal(100),
            totalPrice: new Decimal(100),
            service: {
              id: 'service-id',
              vendor: {
                id: 'vendor-id',
                userId: 'vendor-user-id',
              },
            },
          },
        ],
        client: {
          id: 'client-id',
          email: 'client@example.com',
        },
        payment: null,
      };

      const updatedOrder = {
        ...existingOrder,
        status: OrderStatus.CONFIRMED,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
      mockPrismaService.order.update.mockResolvedValue(updatedOrder);

      // Act
      const result = await service.updateStatus(orderId, userId, userRole, dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
        },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      // Arrange
      const orderId = 'order-id';
      const userId = 'user-id';
      const userRole = Role.ADMIN;
      const dto: UpdateOrderStatusDto = {
        status: OrderStatus.COMPLETED, // Invalid transition from PENDING
      };

      const existingOrder = {
        id: orderId,
        status: OrderStatus.PENDING,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      // Act & Assert
      await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      // Arrange
      const orderId = 'non-existent-order';
      const userId = 'user-id';
      const userRole = Role.ADMIN;
      const dto: UpdateOrderStatusDto = {
        status: OrderStatus.CONFIRMED,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when client tries to confirm order (only cancel allowed)', async () => {
      // Arrange
      const orderId = 'order-id';
      const userId = 'client-id';
      const userRole = Role.CLIENT;
      const dto: UpdateOrderStatusDto = {
        status: OrderStatus.CONFIRMED, // Client cannot confirm orders, only cancel
      };

      const existingOrder = {
        id: orderId,
        orderNumber: 'ORD-2025-000001',
        status: OrderStatus.PENDING,
        clientId: userId, // Same as userId
        items: [
          {
            id: 'item-id',
            serviceId: 'service-id',
            serviceName: 'Test Service',
            quantity: 1,
            unitPrice: new Decimal(100),
            totalPrice: new Decimal(100),
            service: {
              id: 'service-id',
              vendor: {
                id: 'vendor-id',
                userId: 'vendor-user-id',
              },
            },
          },
        ],
        client: {
          id: userId,
          email: 'client@example.com',
        },
        payment: null,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      // Act & Assert
      // Client can only cancel orders, not confirm them
      await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order number', () => {
      // Arrange & Act
      const orderNumber1 = (service as any).generateOrderNumber();
      const orderNumber2 = (service as any).generateOrderNumber();

      // Assert
      expect(orderNumber1).toMatch(/^ORD-\d{4}-\d{6}$/);
      expect(orderNumber2).toMatch(/^ORD-\d{4}-\d{6}$/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });
  });
});

