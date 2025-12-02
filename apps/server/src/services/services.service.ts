import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceStatus, VendorStatus, Role } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Decimal } from '@prisma/client/runtime/library';

export interface ServiceFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: ServiceStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new service (vendor only)
   */
  async create(userId: string, dto: CreateServiceDto) {
    this.logger.log(`Creating service for user ${userId}`);

    // Get vendor profile
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Only vendors can create services');
    }

    // Check vendor is approved
    if (vendorProfile.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException('Your vendor account must be approved before creating services');
    }

    // Validate category exists if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category ${dto.categoryId} not found`);
      }
    }

    const service = await this.prisma.service.create({
      data: {
        vendorId: vendorProfile.id,
        name: dto.name,
        description: dto.description,
        price: new Decimal(dto.price),
        categoryId: dto.categoryId,
        duration: dto.duration,
        images: dto.images || [],
        status: ServiceStatus.ACTIVE,
      },
      include: {
        vendor: true,
        category: true,
      },
    });

    this.logger.log(`Service ${service.id} created successfully`);
    return this.formatServiceResponse(service);
  }

  /**
   * Get all services with filters (public endpoint)
   */
  async findAll(filters: ServiceFilters) {
    const {
      search,
      categoryId,
      vendorId,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      // Only show active services from approved vendors (public)
      status: status || ServiceStatus.ACTIVE,
      vendor: {
        status: VendorStatus.APPROVED,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: true,
          category: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services.map(service => this.formatServiceResponse(service)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get service by ID (public endpoint)
   */
  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    return this.formatServiceResponse(service);
  }

  /**
   * Get vendor's own services
   */
  async getMyServices(userId: string, filters: Omit<ServiceFilters, 'vendorId'>) {
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      throw new NotFoundException('Vendor profile not found');
    }

    // For own services, show all statuses
    const { page = 1, limit = 10, ...restFilters } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      vendorId: vendorProfile.id,
    };

    if (restFilters.status) {
      where.status = restFilters.status;
    }

    if (restFilters.categoryId) {
      where.categoryId = restFilters.categoryId;
    }

    if (restFilters.search) {
      where.OR = [
        { name: { contains: restFilters.search, mode: 'insensitive' } },
        { description: { contains: restFilters.search, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: true,
          category: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services.map(service => this.formatServiceResponse(service)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update service (vendor owner only)
   */
  async update(id: string, userId: string, userRole: Role, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    // Check ownership (vendor) or admin
    if (userRole !== Role.ADMIN && service.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this service');
    }

    // Validate category if changing
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`Category ${dto.categoryId} not found`);
      }
    }

    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price !== undefined ? new Decimal(dto.price) : undefined,
        categoryId: dto.categoryId,
        duration: dto.duration,
        images: dto.images,
        status: dto.status,
      },
      include: {
        vendor: true,
        category: true,
      },
    });

    this.logger.log(`Service ${id} updated`);
    return this.formatServiceResponse(updated);
  }

  /**
   * Delete service (vendor owner or admin)
   */
  async delete(id: string, userId: string, userRole: Role) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    // Check ownership (vendor) or admin
    if (userRole !== Role.ADMIN && service.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this service');
    }

    // Soft delete - mark as DELETED
    await this.prisma.service.update({
      where: { id },
      data: {
        status: ServiceStatus.DELETED,
      },
    });

    this.logger.log(`Service ${id} deleted (soft)`);
    return { message: 'Service deleted successfully' };
  }

  /**
   * Update service status (admin only)
   */
  async updateStatus(id: string, status: ServiceStatus) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    const updated = await this.prisma.service.update({
      where: { id },
      data: { status },
      include: {
        vendor: true,
        category: true,
      },
    });

    this.logger.log(`Service ${id} status changed to ${status}`);
    return this.formatServiceResponse(updated);
  }

  /**
   * Format service for API response
   */
  private formatServiceResponse(service: any) {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: Number(service.price),
      currency: service.currency,
      duration: service.duration,
      images: service.images,
      status: service.status,
      vendor: service.vendor
        ? {
            id: service.vendor.id,
            businessName: service.vendor.businessName,
            rating: service.vendor.rating,
            reviewCount: service.vendor.reviewCount,
          }
        : null,
      category: service.category
        ? {
            id: service.category.id,
            name: service.category.name,
            slug: service.category.slug,
          }
        : null,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
