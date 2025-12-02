export declare class UserStatsDto {
    total: number;
    clients: number;
    vendors: number;
    lawyersNotaries: number;
    admins: number;
}
export declare class VendorStatsDto {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
}
export declare class ServiceStatsDto {
    total: number;
    active: number;
    inactive: number;
    pendingReview: number;
    deleted: number;
}
export declare class OrderStatsDto {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    refunded: number;
}
export declare class PaymentStatsDto {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    refunded: number;
}
export declare class FinancialStatsDto {
    totalRevenue: number;
    platformFees: number;
    stripeFees: number;
    vendorPayouts: number;
    refundedAmount: number;
    averageOrderValue: number;
}
export declare class RecentActivityDto {
    newUsersLast7Days: number;
    newOrdersLast7Days: number;
    revenueLast7Days: number;
    pendingVendorApprovals: number;
    pendingServiceReviews: number;
}
export declare class CategoryStatsDto {
    slug: string;
    name: string;
    servicesCount: number;
    ordersCount: number;
    revenue: number;
}
export declare class AdminStatsResponseDto {
    users: UserStatsDto;
    vendors: VendorStatsDto;
    services: ServiceStatsDto;
    orders: OrderStatsDto;
    payments: PaymentStatsDto;
    financial: FinancialStatsDto;
    recentActivity: RecentActivityDto;
    topCategories: CategoryStatsDto[];
    generatedAt: Date;
}
