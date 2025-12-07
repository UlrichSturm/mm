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
exports.PaymentListResponseDto = exports.PaymentResponseDto = exports.PaymentIntentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class PaymentIntentResponseDto {
}
exports.PaymentIntentResponseDto = PaymentIntentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stripe Payment Intent ID',
        example: 'pi_1234567890abcdef',
    }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client secret for Stripe Elements',
        example: 'pi_1234567890abcdef_secret_xyz',
    }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "clientSecret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount in cents',
        example: 35700,
    }),
    __metadata("design:type", Number)
], PaymentIntentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency',
        example: 'eur',
    }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "currency", void 0);
class PaymentResponseDto {
}
exports.PaymentResponseDto = PaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-2025-001234' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "orderNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pi_1234567890abcdef' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 357.0 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUR' }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 17.85 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "platformFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.71 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "stripeFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 328.44 }),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "vendorPayout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentStatus, example: client_1.PaymentStatus.COMPLETED }),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-10T14:30:00.000Z' }),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T10:00:00.000Z' }),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T14:30:00.000Z' }),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "updatedAt", void 0);
class PaymentListResponseDto {
}
exports.PaymentListResponseDto = PaymentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentResponseDto] }),
    __metadata("design:type", Array)
], PaymentListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { page: 1, limit: 10, total: 100, totalPages: 10 },
    }),
    __metadata("design:type", Object)
], PaymentListResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=payment-response.dto.js.map