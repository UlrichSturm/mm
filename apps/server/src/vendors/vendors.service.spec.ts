import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { VendorsService, VendorStatus } from './vendors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VendorsService', () => {
  let service: VendorsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    vendorProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all vendors when no status filter', async () => {
      // Arrange
      const mockVendors = [
        {
          id: 'vendor-1',
          userId: 'user-1',
          businessName: 'Vendor 1',
          contactEmail: 'vendor1@example.com',
          status: VendorStatus.APPROVED,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-1',
            email: 'vendor1@example.com',
          },
        },
      ];

      mockPrismaService.vendorProfile.findMany.mockResolvedValue(mockVendors);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(mockPrismaService.vendorProfile.findMany).toHaveBeenCalledWith({
        where: {},
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter vendors by status', async () => {
      // Arrange
      const status = VendorStatus.PENDING;
      mockPrismaService.vendorProfile.findMany.mockResolvedValue([]);

      // Act
      await service.findAll(status);

      // Assert
      expect(mockPrismaService.vendorProfile.findMany).toHaveBeenCalledWith({
        where: { status },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return vendor by id', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      const mockVendor = {
        id: vendorId,
        userId: 'user-id',
        businessName: 'Test Vendor',
        contactEmail: 'vendor@example.com',
        status: VendorStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
          email: 'vendor@example.com',
        },
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendor);

      // Act
      const result = await service.findOne(vendorId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(vendorId);
      expect(mockPrismaService.vendorProfile.findUnique).toHaveBeenCalledWith({
        where: { id: vendorId },
        include: { user: true },
      });
    });

    it('should return null when vendor not found', async () => {
      // Arrange
      const vendorId = 'non-existent-vendor';
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findOne(vendorId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return vendor by user id', async () => {
      // Arrange
      const userId = 'user-id';
      const mockVendor = {
        id: 'vendor-id',
        userId,
        businessName: 'Test Vendor',
        contactEmail: 'vendor@example.com',
        status: VendorStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
          email: 'vendor@example.com',
        },
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockVendor);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.userId).toBe(userId);
      expect(mockPrismaService.vendorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: { user: true },
      });
    });
  });

  describe('create', () => {
    it('should create vendor successfully', async () => {
      // Arrange
      const userId = 'user-id';
      const vendorData = {
        businessName: 'New Vendor',
        email: 'newvendor@example.com',
        phone: '+49123456789',
        address: 'Test Address',
        postalCode: '12345',
      };

      const mockVendor = {
        id: 'vendor-id',
        userId,
        businessName: vendorData.businessName,
        contactEmail: vendorData.email,
        contactPhone: vendorData.phone,
        address: vendorData.address,
        postalCode: vendorData.postalCode,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
          email: 'user@example.com',
        },
      };

      mockPrismaService.vendorProfile.create.mockResolvedValue(mockVendor);

      // Act
      const result = await service.create(userId, vendorData);

      // Assert
      expect(result).toBeDefined();
      expect(result.businessName).toBe(vendorData.businessName);
      expect(mockPrismaService.vendorProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          businessName: vendorData.businessName,
          contactEmail: vendorData.email,
          contactPhone: vendorData.phone,
          address: vendorData.address,
          postalCode: vendorData.postalCode,
          status: 'PENDING',
        },
        include: { user: true },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update vendor profile successfully', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      const userId = 'user-id';
      const userRole = 'VENDOR';
      const updateData = {
        businessName: 'Updated Business Name',
        email: 'updated@example.com',
      };

      const existingVendor = {
        id: vendorId,
        userId,
        businessName: 'Old Business Name',
        contactEmail: 'old@example.com',
        status: VendorStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: userId,
        },
      };

      const updatedVendor = {
        ...existingVendor,
        ...updateData,
        contactEmail: updateData.email,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(existingVendor);
      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedVendor);

      // Act
      const result = await service.updateProfile(vendorId, userId, userRole, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.businessName).toBe(updateData.businessName);
      expect(mockPrismaService.vendorProfile.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when vendor not found', async () => {
      // Arrange
      const vendorId = 'non-existent-vendor';
      const userId = 'user-id';
      const userRole = 'VENDOR';
      const updateData = {
        businessName: 'Updated Name',
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProfile(vendorId, userId, userRole, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not owner or admin', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      const userId = 'other-user-id';
      const userRole = 'VENDOR';
      const updateData = {
        businessName: 'Updated Name',
      };

      const existingVendor = {
        id: vendorId,
        userId: 'different-user-id',
        businessName: 'Old Name',
        status: VendorStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'different-user-id',
        },
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(existingVendor);

      // Act & Assert
      await expect(service.updateProfile(vendorId, userId, userRole, updateData)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to update any vendor profile', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      const userId = 'admin-user-id';
      const userRole = 'ADMIN';
      const updateData = {
        businessName: 'Updated Name',
      };

      const existingVendor = {
        id: vendorId,
        userId: 'different-user-id',
        businessName: 'Old Name',
        status: VendorStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'different-user-id',
        },
      };

      const updatedVendor = {
        ...existingVendor,
        ...updateData,
      };

      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(existingVendor);
      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedVendor);

      // Act
      const result = await service.updateProfile(vendorId, userId, userRole, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.vendorProfile.update).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update vendor status successfully', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      const newStatus = VendorStatus.APPROVED;

      const existingVendor = {
        id: vendorId,
        userId: 'user-id',
        businessName: 'Test Vendor',
        status: VendorStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
        },
      };

      const updatedVendor = {
        ...existingVendor,
        status: newStatus,
      };

      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedVendor);

      // Act
      const result = await service.updateStatus(vendorId, newStatus);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(mockPrismaService.vendorProfile.update).toHaveBeenCalledWith({
        where: { id: vendorId },
        data: { status: newStatus },
        include: { user: true },
      });
    });
  });

  describe('delete', () => {
    it('should delete vendor successfully', async () => {
      // Arrange
      const vendorId = 'vendor-id';
      mockPrismaService.vendorProfile.delete.mockResolvedValue({ id: vendorId });

      // Act
      await service.delete(vendorId);

      // Assert
      expect(mockPrismaService.vendorProfile.delete).toHaveBeenCalledWith({
        where: { id: vendorId },
      });
    });
  });
});

