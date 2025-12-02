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
exports.ServiceListResponseDto = exports.ServiceResponseDto = exports.ServiceCategoryDto = exports.ServiceVendorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class ServiceVendorDto {
}
exports.ServiceVendorDto = ServiceVendorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000' }),
    __metadata("design:type", String)
], ServiceVendorDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bestattungen Becker GmbH' }),
    __metadata("design:type", String)
], ServiceVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.5 }),
    __metadata("design:type", Number)
], ServiceVendorDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 23 }),
    __metadata("design:type", Number)
], ServiceVendorDto.prototype, "reviewCount", void 0);
class ServiceCategoryDto {
}
exports.ServiceCategoryDto = ServiceCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440001' }),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Flowers' }),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'flowers' }),
    __metadata("design:type", String)
], ServiceCategoryDto.prototype, "slug", void 0);
class ServiceResponseDto {
}
exports.ServiceResponseDto = ServiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440002' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Funeral Flower Arrangement' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Beautiful floral arrangement for funeral ceremonies...' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.0 }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EUR' }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60 }),
    __metadata("design:type", Number)
], ServiceResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://example.com/image1.jpg'],
        type: [String],
    }),
    __metadata("design:type", Array)
], ServiceResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ServiceStatus, example: client_1.ServiceStatus.ACTIVE }),
    __metadata("design:type", String)
], ServiceResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ServiceVendorDto }),
    __metadata("design:type", ServiceVendorDto)
], ServiceResponseDto.prototype, "vendor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ServiceCategoryDto }),
    __metadata("design:type", ServiceCategoryDto)
], ServiceResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T10:00:00.000Z' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-12-10T10:00:00.000Z' }),
    __metadata("design:type", Date)
], ServiceResponseDto.prototype, "updatedAt", void 0);
class ServiceListResponseDto {
}
exports.ServiceListResponseDto = ServiceListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ServiceResponseDto] }),
    __metadata("design:type", Array)
], ServiceListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { page: 1, limit: 10, total: 100, totalPages: 10 },
    }),
    __metadata("design:type", Object)
], ServiceListResponseDto.prototype, "meta", void 0);
//# sourceMappingURL=service-response.dto.js.map