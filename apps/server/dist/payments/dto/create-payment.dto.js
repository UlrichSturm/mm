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
exports.ConfirmPaymentDto = exports.CreatePaymentIntentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Order ID to create payment for',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Return URL after successful payment',
        example: 'https://mementomori.de/payments/success',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "returnUrl", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Stripe Payment Intent ID',
        example: 'pi_1234567890abcdef',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentIntentId", void 0);
//# sourceMappingURL=create-payment.dto.js.map