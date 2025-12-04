import { PrismaService } from '../prisma/prisma.service';
import { Role, ServiceStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
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
    getServicesForModeration(status?: ServiceStatus, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            status: import(".prisma/client").$Enums.ServiceStatus;
            vendor: {
                id: string;
                businessName: string;
                contactEmail: string;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUsers(role?: Role, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            isBlocked: boolean;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    getLogs(level?: string, module?: string, page?: number, limit?: number): Promise<{
        data: {
            timestamp: Date;
            level: string;
            module: string;
            message: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            note: string;
        };
    }>;
}
