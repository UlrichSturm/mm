import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, VendorStatus, ServiceStatus, OrderStatus, PaymentStatus } from '@prisma/client';

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
}
