import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role, ServiceStatus, VendorStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

export interface ServiceFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: ServiceStatus;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

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

    // Validate category exists and is active (categoryId is now required)
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`Category ${dto.categoryId} not found`);
    }
    if (!category.isActive) {
      throw new BadRequestException(`Category ${dto.categoryId} is not active`);
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
      sortBy = 'createdAt_desc',
    } = filters;

    // Validate search query (minimum 2 characters)
    if (search && search.trim().length > 0) {
      if (search.trim().length < 2) {
        throw new BadRequestException('Search query must be at least 2 characters');
      }
    }

    // Limit maximum page size to 10
    const maxLimit = 10;
    const actualLimit = Math.min(limit, maxLimit);
    const skip = (page - 1) * actualLimit;

    const where: any = {
      // Only show active services from approved vendors (public)
      status: status || ServiceStatus.ACTIVE,
      vendor: {
        status: VendorStatus.APPROVED,
      },
    };

    // Apply search filter (ignore empty strings)
    if (search && search.trim().length >= 2) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
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

    // Parse sortBy parameter
    const orderBy = this.parseSortBy(sortBy);

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: actualLimit,
        orderBy,
        include: {
          vendor: true,
          category: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services.map(service => this.formatServiceResponse(service, false)),
      meta: {
        page,
        limit: actualLimit,
        total,
        totalPages: Math.ceil(total / actualLimit),
        searchQuery: search && search.trim().length >= 2 ? search.trim() : null,
      },
    };
  }

  /**
   * Get service by ID (public endpoint)
   * For public access: only ACTIVE services from APPROVED vendors
   * For owner: can see any status
   */
  async findOne(id: string, userId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: true,
          },
        },
        category: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    // Check if user is the owner
    const isOwner = userId && service.vendor.userId === userId;

    // For public access, check status and vendor approval
    if (!isOwner) {
      if (service.status !== ServiceStatus.ACTIVE) {
        throw new NotFoundException(`Service ${id} not found`);
      }
      if (service.vendor.status !== VendorStatus.APPROVED) {
        throw new NotFoundException(`Service ${id} not found`);
      }
    }

    return this.formatServiceResponse(service, isOwner);
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
      data: services.map(service => this.formatServiceResponse(service, true)), // Owner sees full info
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
      if (!category.isActive) {
        throw new BadRequestException(`Category ${dto.categoryId} is not active`);
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
   * Admin can delete with cascade (removes active orders)
   * Vendor cannot delete if there are active orders
   */
  async delete(id: string, userId: string, userRole: Role) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        vendor: true,
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    // Check ownership (vendor) or admin
    if (userRole !== Role.ADMIN && service.vendor.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this service');
    }

    // Active order statuses: PENDING, CONFIRMED, IN_PROGRESS, REFUNDED
    // Note: IN_DELIVERY and NEED_PAY are not in OrderStatus enum yet
    const activeOrderStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PROGRESS,
      OrderStatus.REFUNDED,
    ];

    // Check for active orders
    const activeOrders = service.orderItems.filter(item =>
      activeOrderStatuses.includes(item.order.status as OrderStatus),
    );

    // Vendor cannot delete if there are active orders
    if (userRole !== Role.ADMIN && activeOrders.length > 0) {
      throw new BadRequestException('Cannot delete service with active orders');
    }

    // Admin can delete with cascade (soft delete orders)
    if (userRole === Role.ADMIN && activeOrders.length > 0) {
      // Soft delete active orders
      const orderIds = [...new Set(activeOrders.map(item => item.orderId))];
      await this.prisma.order.updateMany({
        where: {
          id: { in: orderIds },
          status: { in: activeOrderStatuses },
        },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });
      this.logger.warn(
        `Admin deleted service ${id} with ${activeOrders.length} active orders (cascade delete)`,
      );
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
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    const updated = await this.prisma.service.update({
      where: { id },
      data: { status },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
              },
            },
          },
        },
        category: true,
      },
    });

    this.logger.log(`Service ${id} status changed to ${status}`);

    // Send email notification to vendor about service moderation
    if (updated.vendor.user.email && updated.vendor.user.firstName) {
      try {
        const statusMessages: Record<ServiceStatus, string> = {
          [ServiceStatus.ACTIVE]: 'Your service has been approved and is now active.',
          [ServiceStatus.INACTIVE]: 'Your service has been deactivated.',
          [ServiceStatus.PENDING_REVIEW]: 'Your service is pending review.',
          [ServiceStatus.DELETED]: 'Your service has been deleted.',
        };

        await this.emailService.sendEmail({
          to: updated.vendor.user.email,
          subject: `Service ${updated.name} - Status Update`,
          template: 'order-status', // Reuse order-status template for service status
          context: {
            firstName: updated.vendor.user.firstName,
            orderNumber: updated.name,
            status: status,
            message: statusMessages[status] || 'Your service status has been updated.',
          },
        });
      } catch (error) {
        this.logger.error(`Failed to send service status email: ${(error as Error).message}`);
      }
    }

    return this.formatServiceResponse(updated);
  }

  /**
   * Format service for API response
   * @param service - Service object from Prisma
   * @param isOwner - Whether the requester is the owner (shows more vendor info)
   */
  private formatServiceResponse(service: any, isOwner = false) {
    const vendorInfo: any = {
      id: service.vendor.id,
      businessName: service.vendor.businessName,
      rating: service.vendor.rating,
      reviewCount: service.vendor.reviewCount,
    };

    // Add additional vendor fields for public access or owner
    if (isOwner || !isOwner) {
      // For public access: show contact info
      vendorInfo.contactPhone = service.vendor.contactPhone;
      vendorInfo.address = service.vendor.address;
      vendorInfo.description = service.vendor.description;
      vendorInfo.contactEmail = service.vendor.contactEmail;
    }

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: Number(service.price),
      currency: service.currency,
      duration: service.duration,
      images: service.images,
      status: service.status,
      vendor: service.vendor ? vendorInfo : null,
      category: service.category
        ? {
            id: service.category.id,
            name: service.category.name,
            slug: service.category.slug,
            description: service.category.description,
          }
        : null,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  /**
   * Parse sortBy parameter and return Prisma orderBy object
   */
  private parseSortBy(sortBy: string): Prisma.ServiceOrderByWithRelationInput {
    const [field, direction] = sortBy.split('_');
    const order = direction === 'asc' ? 'asc' : 'desc';

    switch (field) {
      case 'price':
        return { price: order };
      case 'name':
        return { name: order };
      case 'rating':
        return { vendor: { rating: order } };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }
}
