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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStatsResponseDto = exports.CategoryStatsDto = exports.RecentActivityDto = exports.FinancialStatsDto = exports.PaymentStatsDto = exports.OrderStatsDto = exports.ServiceStatsDto = exports.VendorStatsDto = exports.UserStatsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserStatsDto {
}
exports.UserStatsDto = UserStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "clients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "vendors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8 }),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "lawyersNotaries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], UserStatsDto.prototype, "admins", void 0);
class VendorStatsDto {
}
exports.VendorStatsDto = VendorStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], VendorStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], VendorStatsDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], VendorStatsDto.prototype, "approved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], VendorStatsDto.prototype, "rejected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], VendorStatsDto.prototype, "suspended", void 0);
class ServiceStatsDto {
}
exports.ServiceStatsDto = ServiceStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85 }),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75 }),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "inactive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "pendingReview", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], ServiceStatsDto.prototype, "deleted", void 0);
class OrderStatsDto {
}
exports.OrderStatsDto = OrderStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 240 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "confirmed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "inProgress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 130 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "completed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "cancelled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], OrderStatsDto.prototype, "refunded", void 0);
class PaymentStatsDto {
}
exports.PaymentStatsDto = PaymentStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 240 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "processing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 220 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "completed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], PaymentStatsDto.prototype, "refunded", void 0);
class FinancialStatsDto {
}
exports.FinancialStatsDto = FinancialStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 125000.0, description: 'Total revenue in EUR' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "totalRevenue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6250.0, description: 'Platform fees earned (5%)' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "platformFees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3750.0, description: 'Stripe fees paid' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "stripeFees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 115000.0, description: 'Vendor payouts' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "vendorPayouts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2500.0, description: 'Refunded amount' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "refundedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 520.83, description: 'Average order value' }),
    __metadata("design:type", Number)
], FinancialStatsDto.prototype, "averageOrderValue", void 0);
class RecentActivityDto {
}
exports.RecentActivityDto = RecentActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12, description: 'New users in last 7 days' }),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "newUsersLast7Days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45, description: 'New orders in last 7 days' }),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "newOrdersLast7Days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 23500.0, description: 'Revenue in last 7 days' }),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "revenueLast7Days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, description: 'Pending vendor approvals' }),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "pendingVendorApprovals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Pending service reviews' }),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "pendingServiceReviews", void 0);
class CategoryStatsDto {
}
exports.CategoryStatsDto = CategoryStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'funeral-flowers' }),
    __metadata("design:type", String)
], CategoryStatsDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Funeral Flowers' }),
    __metadata("design:type", String)
], CategoryStatsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 35 }),
    __metadata("design:type", Number)
], CategoryStatsDto.prototype, "servicesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], CategoryStatsDto.prototype, "ordersCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 18500.0 }),
    __metadata("design:type", Number)
], CategoryStatsDto.prototype, "revenue", void 0);
class AdminStatsResponseDto {
}
exports.AdminStatsResponseDto = AdminStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserStatsDto }),
    __metadata("design:type", UserStatsDto)
], AdminStatsResponseDto.prototype, "users", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: VendorStatsDto }),
    __metadata("design:type", VendorStatsDto)
], AdminStatsResponseDto.prototype, "vendors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ServiceStatsDto }),
    __metadata("design:type", ServiceStatsDto)
], AdminStatsResponseDto.prototype, "services", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: OrderStatsDto }),
    __metadata("design:type", OrderStatsDto)
], AdminStatsResponseDto.prototype, "orders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentStatsDto }),
    __metadata("design:type", PaymentStatsDto)
], AdminStatsResponseDto.prototype, "payments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FinancialStatsDto }),
    __metadata("design:type", FinancialStatsDto)
], AdminStatsResponseDto.prototype, "financial", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RecentActivityDto }),
    __metadata("design:type", RecentActivityDto)
], AdminStatsResponseDto.prototype, "recentActivity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CategoryStatsDto], description: 'Top 5 categories by revenue' }),
    __metadata("design:type", Array)
], AdminStatsResponseDto.prototype, "topCategories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T15:30:00.000Z' }),
    __metadata("design:type", Date)
], AdminStatsResponseDto.prototype, "generatedAt", void 0);
//# sourceMappingURL=stats-response.dto.js.map