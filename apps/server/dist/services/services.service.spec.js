"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const services_service_1 = require("./services.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
describe('ServicesService', () => {
    let service;
    let prismaService;
    const mockPrismaService = {
        vendorProfile: {
            findUnique: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
        },
        service: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                services_service_1.ServicesService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();
        service = module.get(services_service_1.ServicesService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        it('should create service successfully', async () => {
            const userId = 'vendor-user-id';
            const dto = {
                name: 'Test Service',
                description: 'Test description',
                price: 100,
                categoryId: 'category-id',
                duration: 60,
            };
            const mockVendorProfile = {
                id: 'vendor-id',
                userId,
                status: client_1.VendorStatus.APPROVED,
            };
            const mockCategory = {
                id: 'category-id',
                name: 'Test Category',
            };
            const mockService = {
                id: 'service-id',
                vendorId: 'vendor-id',
                name: dto.name,
                description: dto.description,
                price: new library_1.Decimal(dto.price),
                categoryId: dto.categoryId,
                duration: dto.duration,
                status: client_1.ServiceStatus.ACTIVE,
                vendor: mockVendorProfile,
                category: mockCategory,
            };
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);
            mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
            mockPrismaService.service.create.mockResolvedValue(mockService);
            const result = await service.create(userId, dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.vendorProfile.findUnique).toHaveBeenCalledWith({
                where: { userId },
            });
            expect(mockPrismaService.service.create).toHaveBeenCalled();
        });
        it('should throw ForbiddenException when user is not a vendor', async () => {
            const userId = 'non-vendor-user-id';
            const dto = {
                name: 'Test Service',
                description: 'Test description',
                price: 100,
            };
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(null);
            await expect(service.create(userId, dto)).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw ForbiddenException when vendor is not approved', async () => {
            const userId = 'vendor-user-id';
            const dto = {
                name: 'Test Service',
                description: 'Test description',
                price: 100,
            };
            const mockVendorProfile = {
                id: 'vendor-id',
                userId,
                status: client_1.VendorStatus.PENDING,
            };
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);
            await expect(service.create(userId, dto)).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw BadRequestException when category not found', async () => {
            const userId = 'vendor-user-id';
            const dto = {
                name: 'Test Service',
                description: 'Test description',
                price: 100,
                categoryId: 'non-existent-category',
            };
            const mockVendorProfile = {
                id: 'vendor-id',
                userId,
                status: client_1.VendorStatus.APPROVED,
            };
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);
            mockPrismaService.category.findUnique.mockResolvedValue(null);
            await expect(service.create(userId, dto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('findAll', () => {
        it('should return paginated services list', async () => {
            const filters = {
                page: 1,
                limit: 10,
            };
            const mockServices = [
                {
                    id: 'service-1',
                    name: 'Service 1',
                    status: client_1.ServiceStatus.ACTIVE,
                    price: new library_1.Decimal(100),
                    vendor: {
                        id: 'vendor-id',
                        status: client_1.VendorStatus.APPROVED,
                    },
                    category: {
                        id: 'category-id',
                        name: 'Category 1',
                    },
                },
            ];
            mockPrismaService.service.findMany.mockResolvedValue(mockServices);
            mockPrismaService.service.count.mockResolvedValue(1);
            const result = await service.findAll(filters);
            expect(result).toBeDefined();
            expect(result.data).toBeDefined();
            expect(mockPrismaService.service.findMany).toHaveBeenCalled();
            expect(mockPrismaService.service.count).toHaveBeenCalled();
        });
        it('should filter services by category', async () => {
            const filters = {
                categoryId: 'category-id',
                page: 1,
                limit: 10,
            };
            mockPrismaService.service.findMany.mockResolvedValue([]);
            mockPrismaService.service.count.mockResolvedValue(0);
            await service.findAll(filters);
            expect(mockPrismaService.service.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    categoryId: 'category-id',
                }),
            }));
        });
        it('should filter services by search term', async () => {
            const filters = {
                search: 'test',
                page: 1,
                limit: 10,
            };
            mockPrismaService.service.findMany.mockResolvedValue([]);
            mockPrismaService.service.count.mockResolvedValue(0);
            await service.findAll(filters);
            expect(mockPrismaService.service.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
                        expect.objectContaining({ description: { contains: 'test', mode: 'insensitive' } }),
                    ]),
                }),
            }));
        });
    });
    describe('findOne', () => {
        it('should return service by id', async () => {
            const serviceId = 'service-id';
            const mockService = {
                id: serviceId,
                name: 'Test Service',
                status: client_1.ServiceStatus.ACTIVE,
                price: new library_1.Decimal(100),
                vendor: {
                    id: 'vendor-id',
                    status: client_1.VendorStatus.APPROVED,
                },
                category: {
                    id: 'category-id',
                    name: 'Category',
                },
            };
            mockPrismaService.service.findUnique.mockResolvedValue(mockService);
            const result = await service.findOne(serviceId);
            expect(result).toBeDefined();
            expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
                where: { id: serviceId },
                include: expect.any(Object),
            });
        });
        it('should throw NotFoundException when service not found', async () => {
            const serviceId = 'non-existent-service';
            mockPrismaService.service.findUnique.mockResolvedValue(null);
            await expect(service.findOne(serviceId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('should update service successfully', async () => {
            const serviceId = 'service-id';
            const userId = 'vendor-user-id';
            const dto = {
                name: 'Updated Service',
                description: 'Updated description',
            };
            const existingService = {
                id: serviceId,
                vendorId: 'vendor-id',
                vendor: {
                    userId,
                },
            };
            const updatedService = {
                ...existingService,
                ...dto,
                price: new library_1.Decimal(100),
                vendor: {
                    id: 'vendor-id',
                    status: client_1.VendorStatus.APPROVED,
                },
                category: {
                    id: 'category-id',
                    name: 'Category',
                },
            };
            mockPrismaService.service.findUnique.mockResolvedValue(existingService);
            mockPrismaService.service.update.mockResolvedValue(updatedService);
            const result = await service.update(serviceId, userId, client_1.Role.VENDOR, dto);
            expect(result).toBeDefined();
            expect(mockPrismaService.service.update).toHaveBeenCalledWith({
                where: { id: serviceId },
                data: dto,
                include: expect.any(Object),
            });
        });
        it('should throw NotFoundException when service not found', async () => {
            const serviceId = 'non-existent-service';
            const userId = 'vendor-user-id';
            const dto = {
                name: 'Updated Service',
            };
            mockPrismaService.service.findUnique.mockResolvedValue(null);
            await expect(service.update(serviceId, userId, client_1.Role.VENDOR, dto)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw ForbiddenException when user is not the service owner', async () => {
            const serviceId = 'service-id';
            const userId = 'other-vendor-user-id';
            const dto = {
                name: 'Updated Service',
            };
            const existingService = {
                id: serviceId,
                vendorId: 'vendor-id',
                vendor: {
                    userId: 'different-vendor-user-id',
                },
            };
            mockPrismaService.service.findUnique.mockResolvedValue(existingService);
            await expect(service.update(serviceId, userId, client_1.Role.VENDOR, dto)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=services.service.spec.js.map