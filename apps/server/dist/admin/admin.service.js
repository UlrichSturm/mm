"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = AdminService_1 = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async getStats() {
        this.logger.log('Generating admin statistics');
        const [userStats, vendorStats, serviceStats, orderStats, paymentStats, financialStats, recentActivity, topCategories,] = await Promise.all([
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
    async getUserStats() {
        const [total, clientsCount, vendorsCount, lawyersNotariesCount, adminsCount] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: client_1.Role.CLIENT } }),
            this.prisma.user.count({ where: { role: client_1.Role.VENDOR } }),
            this.prisma.user.count({ where: { role: client_1.Role.LAWYER_NOTARY } }),
            this.prisma.user.count({ where: { role: client_1.Role.ADMIN } }),
        ]);
        return {
            total,
            clients: clientsCount,
            vendors: vendorsCount,
            lawyersNotaries: lawyersNotariesCount,
            admins: adminsCount,
        };
    }
    async getVendorStats() {
        const [total, pending, approved, rejected, suspended] = await Promise.all([
            this.prisma.vendorProfile.count(),
            this.prisma.vendorProfile.count({ where: { status: client_1.VendorStatus.PENDING } }),
            this.prisma.vendorProfile.count({ where: { status: client_1.VendorStatus.APPROVED } }),
            this.prisma.vendorProfile.count({ where: { status: client_1.VendorStatus.REJECTED } }),
            this.prisma.vendorProfile.count({ where: { status: client_1.VendorStatus.SUSPENDED } }),
        ]);
        return {
            total,
            pending,
            approved,
            rejected,
            suspended,
        };
    }
    async getServiceStats() {
        const [total, active, inactive, pendingReview, deleted] = await Promise.all([
            this.prisma.service.count(),
            this.prisma.service.count({ where: { status: client_1.ServiceStatus.ACTIVE } }),
            this.prisma.service.count({ where: { status: client_1.ServiceStatus.INACTIVE } }),
            this.prisma.service.count({ where: { status: client_1.ServiceStatus.PENDING_REVIEW } }),
            this.prisma.service.count({ where: { status: client_1.ServiceStatus.DELETED } }),
        ]);
        return {
            total,
            active,
            inactive,
            pendingReview,
            deleted,
        };
    }
    async getOrderStats() {
        const [total, pending, confirmed, inProgress, completed, cancelled, refunded] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CONFIRMED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.IN_PROGRESS } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.COMPLETED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.CANCELLED } }),
            this.prisma.order.count({ where: { status: client_1.OrderStatus.REFUNDED } }),
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
    async getPaymentStats() {
        const [total, pending, processing, completed, failed, refunded] = await Promise.all([
            this.prisma.payment.count(),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PENDING } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PROCESSING } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.COMPLETED } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.FAILED } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.REFUNDED } }),
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
    async getFinancialStats() {
        const payments = await this.prisma.payment.findMany({
            where: {
                status: {
                    in: [client_1.PaymentStatus.COMPLETED, client_1.PaymentStatus.REFUNDED],
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
        const completedPayments = payments.filter(p => p.status === client_1.PaymentStatus.COMPLETED);
        const refundedPayments = payments.filter(p => p.status === client_1.PaymentStatus.REFUNDED);
        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const platformFees = completedPayments.reduce((sum, p) => sum + Number(p.platformFee), 0);
        const stripeFees = completedPayments.reduce((sum, p) => sum + Number(p.stripeFee), 0);
        const vendorPayouts = completedPayments.reduce((sum, p) => sum + Number(p.vendorPayout), 0);
        const refundedAmount = refundedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const orderCount = await this.prisma.order.count({
            where: {
                status: {
                    in: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.IN_PROGRESS],
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
    async getRecentActivity() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [newUsersLast7Days, newOrdersLast7Days, paymentsLast7Days, pendingVendorApprovals, pendingServiceReviews,] = await Promise.all([
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
                    status: client_1.PaymentStatus.COMPLETED,
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
                    status: client_1.VendorStatus.PENDING,
                },
            }),
            this.prisma.service.count({
                where: {
                    status: client_1.ServiceStatus.PENDING_REVIEW,
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
    async getTopCategories() {
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
                                                status: client_1.PaymentStatus.COMPLETED,
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
        return categoryStats.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map