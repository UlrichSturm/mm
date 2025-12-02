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
exports.OrderListResponseDto = exports.OrderResponseDto = exports.OrderPaymentDto = exports.OrderVendorDto = exports.OrderClientDto = exports.OrderItemResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class OrderItemResponseDto {
}
exports.OrderItemResponseDto = OrderItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "serviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Funeral Flower Arrangement' }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.0 }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "servicePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.0 }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300.0 }),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "totalPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'White roses preferred' }),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "notes", void 0);
class OrderClientDto {
}
exports.OrderClientDto = OrderClientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    __metadata("design:type", String)
], OrderClientDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'client@example.com' }),
    __metadata("design:type", String)
], OrderClientDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hans' }),
    __metadata("design:type", String)
], OrderClientDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mueller' }),
    __metadata("design:type", String)
], OrderClientDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+49 123 456 7890' }),
    __metadata("design:type", String)
], OrderClientDto.prototype, "phone", void 0);
class OrderVendorDto {
}
exports.OrderVendorDto = OrderVendorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440003' }),
    __metadata("design:type", String)
], OrderVendorDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bestattungen Becker GmbH' }),
    __metadata("design:type", String)
], OrderVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'vendor@example.com' }),
    __metadata("design:type", String)
], OrderVendorDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+49 987 654 3210' }),
    __metadata("design:type", String)
], OrderVendorDto.prototype, "contactPhone", void 0);
class OrderPaymentDto {
}
exports.OrderPaymentDto = OrderPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440004' }),
    __metadata("design:type", String)
], OrderPaymentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentStatus, example: client_1.PaymentStatus.COMPLETED }),
    __metadata("design:type", String)
], OrderPaymentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300.0 }),
    __metadata("design:type", Number)
], OrderPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUR' }),
    __metadata("design:type", String)
], OrderPaymentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-10T14:30:00.000Z' }),
    __metadata("design:type", Date)
], OrderPaymentDto.prototype, "paidAt", void 0);
class OrderResponseDto {
}
exports.OrderResponseDto = OrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440005' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORD-2025-001234' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "orderNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: OrderClientDto }),
    __metadata("design:type", OrderClientDto)
], OrderResponseDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderItemResponseDto] }),
    __metadata("design:type", Array)
], OrderResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 300.0 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 57.0 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 357.0 }),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUR' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Delivery to the back entrance' }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-15T10:00:00.000Z' }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.OrderStatus, example: client_1.OrderStatus.PENDING }),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: OrderPaymentDto }),
    __metadata("design:type", OrderPaymentDto)
], OrderResponseDto.prototype, "payment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T10:00:00.000Z' }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T10:00:00.000Z' }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-15T12:00:00.000Z' }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: null }),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "cancelledAt", void 0);
class OrderListResponseDto {
}
exports.OrderListResponseDto = OrderListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrderResponseDto] }),
    __metadata("design:type", Array)
], OrderListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { page: 1, limit: 10, total: 100, totalPages: 10 },
    }),
    __metadata("design:type", Object)
], OrderListResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=order-response.dto.js.map