import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 120 })
  clients: number;

  @ApiProperty({ example: 20 })
  vendors: number;

  @ApiProperty({ example: 8 })
  lawyersNotaries: number;

  @ApiProperty({ example: 2 })
  admins: number;
}

export class VendorStatsDto {
  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ example: 5 })
  pending: number;

  @ApiProperty({ example: 12 })
  approved: number;

  @ApiProperty({ example: 2 })
  rejected: number;

  @ApiProperty({ example: 1 })
  suspended: number;
}

export class ServiceStatsDto {
  @ApiProperty({ example: 85 })
  total: number;

  @ApiProperty({ example: 75 })
  active: number;

  @ApiProperty({ example: 5 })
  inactive: number;

  @ApiProperty({ example: 3 })
  pendingReview: number;

  @ApiProperty({ example: 2 })
  deleted: number;
}

export class OrderStatsDto {
  @ApiProperty({ example: 240 })
  total: number;

  @ApiProperty({ example: 15 })
  pending: number;

  @ApiProperty({ example: 50 })
  confirmed: number;

  @ApiProperty({ example: 30 })
  inProgress: number;

  @ApiProperty({ example: 130 })
  completed: number;

  @ApiProperty({ example: 10 })
  cancelled: number;

  @ApiProperty({ example: 5 })
  refunded: number;
}

export class PaymentStatsDto {
  @ApiProperty({ example: 240 })
  total: number;

  @ApiProperty({ example: 5 })
  pending: number;

  @ApiProperty({ example: 3 })
  processing: number;

  @ApiProperty({ example: 220 })
  completed: number;

  @ApiProperty({ example: 7 })
  failed: number;

  @ApiProperty({ example: 5 })
  refunded: number;
}

export class FinancialStatsDto {
  @ApiProperty({ example: 125000.0, description: 'Total revenue in EUR' })
  totalRevenue: number;

  @ApiProperty({ example: 6250.0, description: 'Platform fees earned (5%)' })
  platformFees: number;

  @ApiProperty({ example: 3750.0, description: 'Stripe fees paid' })
  stripeFees: number;

  @ApiProperty({ example: 115000.0, description: 'Vendor payouts' })
  vendorPayouts: number;

  @ApiProperty({ example: 2500.0, description: 'Refunded amount' })
  refundedAmount: number;

  @ApiProperty({ example: 520.83, description: 'Average order value' })
  averageOrderValue: number;
}

export class RecentActivityDto {
  @ApiProperty({ example: 12, description: 'New users in last 7 days' })
  newUsersLast7Days: number;

  @ApiProperty({ example: 45, description: 'New orders in last 7 days' })
  newOrdersLast7Days: number;

  @ApiProperty({ example: 23500.0, description: 'Revenue in last 7 days' })
  revenueLast7Days: number;

  @ApiProperty({ example: 3, description: 'Pending vendor approvals' })
  pendingVendorApprovals: number;

  @ApiProperty({ example: 2, description: 'Pending service reviews' })
  pendingServiceReviews: number;
}

export class CategoryStatsDto {
  @ApiProperty({ example: 'funeral-flowers' })
  slug: string;

  @ApiProperty({ example: 'Funeral Flowers' })
  name: string;

  @ApiProperty({ example: 35 })
  servicesCount: number;

  @ApiProperty({ example: 120 })
  ordersCount: number;

  @ApiProperty({ example: 18500.0 })
  revenue: number;
}

export class AdminStatsResponseDto {
  @ApiProperty({ type: UserStatsDto })
  users: UserStatsDto;

  @ApiProperty({ type: VendorStatsDto })
  vendors: VendorStatsDto;

  @ApiProperty({ type: ServiceStatsDto })
  services: ServiceStatsDto;

  @ApiProperty({ type: OrderStatsDto })
  orders: OrderStatsDto;

  @ApiProperty({ type: PaymentStatsDto })
  payments: PaymentStatsDto;

  @ApiProperty({ type: FinancialStatsDto })
  financial: FinancialStatsDto;

  @ApiProperty({ type: RecentActivityDto })
  recentActivity: RecentActivityDto;

  @ApiProperty({ type: [CategoryStatsDto], description: 'Top 5 categories by revenue' })
  topCategories: CategoryStatsDto[];

  @ApiProperty({ example: '2025-12-10T15:30:00.000Z' })
  generatedAt: Date;
}
