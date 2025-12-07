import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceStatus, VendorStatus, Role } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

describe('ServicesService', () => {
  let service: ServicesService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create service successfully', async () => {
      // Arrange
      const userId = 'vendor-user-id';
      const dto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test description',
        price: 100,
        categoryId: 'category-id',
        duration: 60,
      };

      const mockVendorProfile = {
        id: 'vendor-id',
        userId,
        status: VendorStatus.APPROVED,
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
        price: new Decimal(dto.price),
        categoryId: dto.categoryId,
        duration: dto.duration,
        status: ServiceStatus.ACTIVE,
        vendor: mockVendorProfile,
        category: mockCategory,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.service.create.mockResolvedValue(mockService);

      // Act
      const result = await service.create(userId, dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.vendorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.service.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not a vendor', async () => {
      // Arrange
      const userId = 'non-vendor-user-id';
      const dto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test description',
        price: 100,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when vendor is not approved', async () => {
      // Arrange
      const userId = 'vendor-user-id';
      const dto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test description',
        price: 100,
      };

      const mockVendorProfile = {
        id: 'vendor-id',
        userId,
        status: VendorStatus.PENDING,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);

      // Act & Assert
      await expect(service.create(userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when category not found', async () => {
      // Arrange
      const userId = 'vendor-user-id';
      const dto: CreateServiceDto = {
        name: 'Test Service',
        description: 'Test description',
        price: 100,
        categoryId: 'non-existent-category',
      };

      const mockVendorProfile = {
        id: 'vendor-id',
        userId,
        status: VendorStatus.APPROVED,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendorProfile);
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated services list', async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
      };

      const mockServices = [
        {
          id: 'service-1',
          name: 'Service 1',
          status: ServiceStatus.ACTIVE,
          price: new Decimal(100),
          vendor: {
            id: 'vendor-id',
            status: VendorStatus.APPROVED,
          },
          category: {
            id: 'category-id',
            name: 'Category 1',
          },
        },
      ];

      mockPrismaService.service.findMany.mockResolvedValue(mockServices);
      mockPrismaService.service.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(mockPrismaService.service.findMany).toHaveBeenCalled();
      expect(mockPrismaService.service.count).toHaveBeenCalled();
    });

    it('should filter services by category', async () => {
      // Arrange
      const filters = {
        categoryId: 'category-id',
        page: 1,
        limit: 10,
      };

      mockPrismaService.service.findMany.mockResolvedValue([]);
      mockPrismaService.service.count.mockResolvedValue(0);

      // Act
      await service.findAll(filters);

      // Assert
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-id',
          }),
        }),
      );
    });

    it('should filter services by search term', async () => {
      // Arrange
      const filters = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      mockPrismaService.service.findMany.mockResolvedValue([]);
      mockPrismaService.service.count.mockResolvedValue(0);

      // Act
      await service.findAll(filters);

      // Assert
      expect(mockPrismaService.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'test', mode: 'insensitive' } }),
              expect.objectContaining({ description: { contains: 'test', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return service by id', async () => {
      // Arrange
      const serviceId = 'service-id';
      const mockService = {
        id: serviceId,
        name: 'Test Service',
        status: ServiceStatus.ACTIVE,
        price: new Decimal(100),
        vendor: {
          id: 'vendor-id',
          status: VendorStatus.APPROVED,
        },
        category: {
          id: 'category-id',
          name: 'Category',
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(mockService);

      // Act
      const result = await service.findOne(serviceId);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: serviceId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      // Arrange
      const serviceId = 'non-existent-service';
      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(serviceId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update service successfully', async () => {
      // Arrange
      const serviceId = 'service-id';
      const userId = 'vendor-user-id';
      const dto: UpdateServiceDto = {
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
        price: new Decimal(100),
        vendor: {
          id: 'vendor-id',
          status: VendorStatus.APPROVED,
        },
        category: {
          id: 'category-id',
          name: 'Category',
        },
      };

      mockPrismaService.service.findUnique.mockResolvedValue(existingService);
      mockPrismaService.service.update.mockResolvedValue(updatedService);

      // Act
      const result = await service.update(serviceId, userId, Role.VENDOR, dto);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.service.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: dto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when service not found', async () => {
      // Arrange
      const serviceId = 'non-existent-service';
      const userId = 'vendor-user-id';
      const dto: UpdateServiceDto = {
        name: 'Updated Service',
      };

      mockPrismaService.service.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(serviceId, userId, Role.VENDOR, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the service owner', async () => {
      // Arrange
      const serviceId = 'service-id';
      const userId = 'other-vendor-user-id';
      const dto: UpdateServiceDto = {
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

      // Act & Assert
      await expect(service.update(serviceId, userId, Role.VENDOR, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
