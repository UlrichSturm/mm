import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: {
            total: number;
            clients: number;
            vendors: number;
            lawyersNotaries: number;
            admins: number;
        };
        vendors: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            suspended: number;
        };
        services: {
            total: number;
            active: number;
            inactive: number;
            pendingReview: number;
            deleted: number;
        };
        orders: {
            total: number;
            pending: number;
            confirmed: number;
            inProgress: number;
            completed: number;
            cancelled: number;
            refunded: number;
        };
        payments: {
            total: number;
            pending: number;
            processing: number;
            completed: number;
            failed: number;
            refunded: number;
        };
        financial: {
            totalRevenue: number;
            platformFees: number;
            stripeFees: number;
            vendorPayouts: number;
            refundedAmount: number;
            averageOrderValue: number;
        };
        recentActivity: {
            newUsersLast7Days: number;
            newOrdersLast7Days: number;
            revenueLast7Days: number;
            pendingVendorApprovals: number;
            pendingServiceReviews: number;
        };
        topCategories: {
            slug: string;
            name: string;
            servicesCount: number;
            ordersCount: number;
            revenue: number;
        }[];
        generatedAt: Date;
    }>;
    private getUserStats;
    private getVendorStats;
    private getServiceStats;
    private getOrderStats;
    private getPaymentStats;
    private getFinancialStats;
    private getRecentActivity;
    private getTopCategories;
}
