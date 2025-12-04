import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, VendorStatus, ServiceStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive platform statistics
   */
  async getStats() {
    this.logger.log('Generating admin statistics');

    const [
      userStats,
      vendorStats,
      serviceStats,
      orderStats,
      paymentStats,
      financialStats,
      recentActivity,
      topCategories,
    ] = await Promise.all([
      this.getUserStats(),
      this.getVendorStats(),
      this.getServiceStats(),
      this.getOrderStats(),
      this.getPaymentStats(),
      this.getFinancialStats(),
      this.getRecentActivity(),
      this.getTopCategories(),
    ]);

    return {
      users: userStats,
      vendors: vendorStats,
      services: serviceStats,
      orders: orderStats,
      payments: paymentStats,
      financial: financialStats,
      recentActivity,
      topCategories,
      generatedAt: new Date(),
    };
  }

  /**
   * User statistics by role
   */
  private async getUserStats() {
    const [total, clientsCount, vendorsCount, lawyersNotariesCount, adminsCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.CLIENT } }),
        this.prisma.user.count({ where: { role: Role.VENDOR } }),
        this.prisma.user.count({ where: { role: Role.LAWYER_NOTARY } }),
        this.prisma.user.count({ where: { role: Role.ADMIN } }),
      ]);

    return {
      total,
      clients: clientsCount,
      vendors: vendorsCount,
      lawyersNotaries: lawyersNotariesCount,
      admins: adminsCount,
    };
  }

  /**
   * Vendor statistics by status
   */
  private async getVendorStats() {
    const [total, pending, approved, rejected, suspended] = await Promise.all([
      this.prisma.vendorProfile.count(),
      this.prisma.vendorProfile.count({ where: { status: VendorStatus.PENDING } }),
      this.prisma.vendorProfile.count({ where: { status: VendorStatus.APPROVED } }),
      this.prisma.vendorProfile.count({ where: { status: VendorStatus.REJECTED } }),
      this.prisma.vendorProfile.count({ where: { status: VendorStatus.SUSPENDED } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      suspended,
    };
  }

  /**
   * Service statistics by status
   */
  private async getServiceStats() {
    const [total, active, inactive, pendingReview, deleted] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.count({ where: { status: ServiceStatus.ACTIVE } }),
      this.prisma.service.count({ where: { status: ServiceStatus.INACTIVE } }),
      this.prisma.service.count({ where: { status: ServiceStatus.PENDING_REVIEW } }),
      this.prisma.service.count({ where: { status: ServiceStatus.DELETED } }),
    ]);

    return {
      total,
      active,
      inactive,
      pendingReview,
      deleted,
    };
  }

  /**
   * Order statistics by status
   */
  private async getOrderStats() {
    const [total, pending, confirmed, inProgress, completed, cancelled, refunded] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
        this.prisma.order.count({ where: { status: OrderStatus.IN_PROGRESS } }),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        this.prisma.order.count({ where: { status: OrderStatus.REFUNDED } }),
      ]);

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      refunded,
    };
  }

  /**
   * Payment statistics by status
   */
  private async getPaymentStats() {
    const [total, pending, processing, completed, failed, refunded] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PROCESSING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.REFUNDED } }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      refunded,
    };
  }

  /**
   * Financial statistics
   */
  private async getFinancialStats() {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: {
          in: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED],
        },
      },
      select: {
        amount: true,
        platformFee: true,
        stripeFee: true,
        vendorPayout: true,
        status: true,
      },
    });

    const completedPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED);
    const refundedPayments = payments.filter(p => p.status === PaymentStatus.REFUNDED);

    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const platformFees = completedPayments.reduce((sum, p) => sum + Number(p.platformFee), 0);
    const stripeFees = completedPayments.reduce((sum, p) => sum + Number(p.stripeFee), 0);
    const vendorPayouts = completedPayments.reduce((sum, p) => sum + Number(p.vendorPayout), 0);
    const refundedAmount = refundedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const orderCount = await this.prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS],
        },
      },
    });

    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      platformFees: Math.round(platformFees * 100) / 100,
      stripeFees: Math.round(stripeFees * 100) / 100,
      vendorPayouts: Math.round(vendorPayouts * 100) / 100,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  /**
   * Recent activity (last 7 days)
   */
  private async getRecentActivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      newUsersLast7Days,
      newOrdersLast7Days,
      paymentsLast7Days,
      pendingVendorApprovals,
      pendingServiceReviews,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          amount: true,
        },
      }),
      this.prisma.vendorProfile.count({
        where: {
          status: VendorStatus.PENDING,
        },
      }),
      this.prisma.service.count({
        where: {
          status: ServiceStatus.PENDING_REVIEW,
        },
      }),
    ]);

    const revenueLast7Days = paymentsLast7Days.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      newUsersLast7Days,
      newOrdersLast7Days,
      revenueLast7Days: Math.round(revenueLast7Days * 100) / 100,
      pendingVendorApprovals,
      pendingServiceReviews,
    };
  }

  /**
   * Top categories by revenue
   */
  private async getTopCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        services: {
          include: {
            orderItems: {
              include: {
                order: {
                  include: {
                    payment: {
                      where: {
                        status: PaymentStatus.COMPLETED,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const categoryStats = categories.map(category => {
      const servicesCount = category.services.length;
      let ordersCount = 0;
      let revenue = 0;

      category.services.forEach(service => {
        service.orderItems.forEach(item => {
          if (item.order.payment) {
            ordersCount++;
            revenue += Number(item.totalPrice);
          }
        });
      });

      return {
        slug: category.slug,
        name: category.name,
        servicesCount,
        ordersCount,
        revenue: Math.round(revenue * 100) / 100,
      };
    });

    // Sort by revenue and take top 5
    return categoryStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }

  /**
   * Get services for moderation
   */
  async getServicesForModeration(status?: ServiceStatus, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              contactEmail: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: Number(service.price),
        status: service.status,
        vendor: service.vendor,
        category: service.category,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(role?: Role, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${id} updated by admin`);

    return updated;
  }

  /**
   * Get application logs
   * Note: In production, logs should be stored in a log aggregation service
   * For MVP, we return a placeholder response
   */
  async getLogs(level?: string, module?: string, page: number = 1, limit: number = 50) {
    // In a real implementation, logs would be retrieved from:
    // - File system (winston file transport)
    // - Log aggregation service (ELK, Datadog, etc.)
    // - Database (if logs are stored in DB)

    // For MVP, return a placeholder response
    this.logger.warn(
      'Logs endpoint called - logs should be retrieved from log aggregation service in production',
    );

    return {
      data: [
        {
          timestamp: new Date(),
          level: level || 'log',
          module: module || 'admin',
          message: 'Logs endpoint - implement log aggregation service for production',
        },
      ],
      meta: {
        page,
        limit,
        total: 1,
        totalPages: 1,
        note: 'Logs should be retrieved from log aggregation service (ELK, Datadog, etc.) in production',
      },
    };
  }
}
