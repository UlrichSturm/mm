"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
describe('OrdersService', () => {
    let service;
    let prismaService;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                orders_service_1.OrdersService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(orders_service_1.OrdersService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('should create order successfully', async () => {
            const clientId = 'client-id';
            const dto = {
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
                price: new library_1.Decimal(100),
                status: client_1.ServiceStatus.ACTIVE,
                vendor: {
                    id: 'vendor-id',
                    businessName: 'Test Vendor',
                },
            };
            const mockOrder = {
                id: 'order-id',
                orderNumber: 'ORD-2025-000001',
                clientId,
                subtotal: new library_1.Decimal(200),
                tax: new library_1.Decimal(38),
                totalPrice: new library_1.Decimal(238),
                status: client_1.OrderStatus.PENDING,
                items: [
                    {
                        id: 'item-id',
                        serviceId: 'service-1',
                        quantity: 2,
                        unitPrice: new library_1.Decimal(100),
                        totalPrice: new library_1.Decimal(200),
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
            const result = await service.create(clientId, dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.service.findMany).toHaveBeenCalledWith({
                where: {
                    id: { in: ['service-1'] },
                    status: client_1.ServiceStatus.ACTIVE,
                },
                include: { vendor: true },
            });
            expect(mockPrismaService.order.create).toHaveBeenCalled();
        });
        it('should throw BadRequestException when service not found', async () => {
            const clientId = 'client-id';
            const dto = {
                items: [
                    {
                        serviceId: 'non-existent-service',
                        quantity: 1,
                    },
                ],
            };
            mockPrismaService.service.findMany.mockResolvedValue([]);
            await expect(service.create(clientId, dto)).rejects.toThrow(common_1.BadRequestException);
            expect(mockPrismaService.service.findMany).toHaveBeenCalled();
        });
        it('should throw BadRequestException when service is inactive', async () => {
            const clientId = 'client-id';
            const dto = {
                items: [
                    {
                        serviceId: 'service-1',
                        quantity: 1,
                    },
                ],
            };
            const inactiveService = {
                id: 'service-1',
                status: client_1.ServiceStatus.INACTIVE,
            };
            mockPrismaService.service.findMany.mockResolvedValue([]);
            await expect(service.create(clientId, dto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('findAll', () => {
        it('should return paginated orders list', async () => {
            const filters = {
                page: 1,
                limit: 10,
            };
            const mockOrders = [
                {
                    id: 'order-1',
                    orderNumber: 'ORD-2025-000001',
                    status: client_1.OrderStatus.PENDING,
                    clientId: 'client-id',
                    items: [
                        {
                            id: 'item-1',
                            serviceId: 'service-id',
                            serviceName: 'Test Service',
                            quantity: 1,
                            unitPrice: new library_1.Decimal(100),
                            totalPrice: new library_1.Decimal(100),
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
            const result = await service.findAll(filters);
            expect(result).toBeDefined();
            expect(result.data).toBeDefined();
            expect(mockPrismaService.order.findMany).toHaveBeenCalled();
            expect(mockPrismaService.order.count).toHaveBeenCalled();
        });
        it('should filter orders by status', async () => {
            const filters = {
                status: client_1.OrderStatus.CONFIRMED,
                page: 1,
                limit: 10,
            };
            mockPrismaService.order.findMany.mockResolvedValue([]);
            mockPrismaService.order.count.mockResolvedValue(0);
            await service.findAll(filters);
            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: client_1.OrderStatus.CONFIRMED,
                }),
            }));
        });
        it('should filter orders by clientId', async () => {
            const filters = {
                clientId: 'client-id',
                page: 1,
                limit: 10,
            };
            mockPrismaService.order.findMany.mockResolvedValue([]);
            mockPrismaService.order.count.mockResolvedValue(0);
            await service.findAll(filters);
            expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    clientId: 'client-id',
                }),
            }));
        });
    });
    describe('findOne', () => {
        it('should return order by id', async () => {
            const orderId = 'order-id';
            const userId = 'user-id';
            const userRole = client_1.Role.ADMIN;
            const mockOrder = {
                id: orderId,
                orderNumber: 'ORD-2025-000001',
                status: client_1.OrderStatus.PENDING,
                clientId: 'client-id',
                items: [],
            };
            mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
            const result = await service.findOne(orderId, userId, userRole);
            expect(result).toBeDefined();
            expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
                where: { id: orderId },
                include: expect.any(Object),
            });
        });
        it('should throw NotFoundException when order not found', async () => {
            const orderId = 'non-existent-order';
            const userId = 'user-id';
            const userRole = client_1.Role.ADMIN;
            mockPrismaService.order.findUnique.mockResolvedValue(null);
            await expect(service.findOne(orderId, userId, userRole)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('updateStatus', () => {
        it('should update order status successfully', async () => {
            const orderId = 'order-id';
            const userId = 'user-id';
            const userRole = client_1.Role.ADMIN;
            const dto = {
                status: client_1.OrderStatus.CONFIRMED,
            };
            const existingOrder = {
                id: orderId,
                orderNumber: 'ORD-2025-000001',
                status: client_1.OrderStatus.PENDING,
                clientId: 'client-id',
                subtotal: new library_1.Decimal(100),
                tax: new library_1.Decimal(19),
                totalPrice: new library_1.Decimal(119),
                items: [
                    {
                        id: 'item-id',
                        serviceId: 'service-id',
                        serviceName: 'Test Service',
                        quantity: 1,
                        unitPrice: new library_1.Decimal(100),
                        totalPrice: new library_1.Decimal(100),
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
                status: client_1.OrderStatus.CONFIRMED,
            };
            mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
            mockPrismaService.order.update.mockResolvedValue(updatedOrder);
            const result = await service.updateStatus(orderId, userId, userRole, dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.order.update).toHaveBeenCalledWith({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.CONFIRMED,
                },
                include: expect.any(Object),
            });
        });
        it('should throw BadRequestException for invalid status transition', async () => {
            const orderId = 'order-id';
            const userId = 'user-id';
            const userRole = client_1.Role.ADMIN;
            const dto = {
                status: client_1.OrderStatus.COMPLETED,
            };
            const existingOrder = {
                id: orderId,
                status: client_1.OrderStatus.PENDING,
            };
            mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);
            await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw NotFoundException when order not found', async () => {
            const orderId = 'non-existent-order';
            const userId = 'user-id';
            const userRole = client_1.Role.ADMIN;
            const dto = {
                status: client_1.OrderStatus.CONFIRMED,
            };
            mockPrismaService.order.findUnique.mockResolvedValue(null);
            await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw ForbiddenException when client tries to confirm order (only cancel allowed)', async () => {
            const orderId = 'order-id';
            const userId = 'client-id';
            const userRole = client_1.Role.CLIENT;
            const dto = {
                status: client_1.OrderStatus.CONFIRMED,
            };
            const existingOrder = {
                id: orderId,
                orderNumber: 'ORD-2025-000001',
                status: client_1.OrderStatus.PENDING,
                clientId: userId,
                items: [
                    {
                        id: 'item-id',
                        serviceId: 'service-id',
                        serviceName: 'Test Service',
                        quantity: 1,
                        unitPrice: new library_1.Decimal(100),
                        totalPrice: new library_1.Decimal(100),
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
            await expect(service.updateStatus(orderId, userId, userRole, dto)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    describe('generateOrderNumber', () => {
        it('should generate unique order number', () => {
            const orderNumber1 = service.generateOrderNumber();
            const orderNumber2 = service.generateOrderNumber();
            expect(orderNumber1).toMatch(/^ORD-\d{4}-\d{6}$/);
            expect(orderNumber2).toMatch(/^ORD-\d{4}-\d{6}$/);
            expect(orderNumber1).not.toBe(orderNumber2);
        });
    });
});
//# sourceMappingURL=orders.service.spec.js.map