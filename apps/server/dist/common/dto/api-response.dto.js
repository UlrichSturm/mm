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
exports.IdResponseDto = exports.MessageResponseDto = exports.ApiErrorResponse = exports.ApiErrorInfo = exports.ValidationErrorDetail = exports.ApiSuccessResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiSuccessResponse {
}
exports.ApiSuccessResponse = ApiSuccessResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request success status', example: true }),
    __metadata("design:type", Boolean)
], ApiSuccessResponse.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response data' }),
    __metadata("design:type", Object)
], ApiSuccessResponse.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional message',
        example: 'Operation completed successfully',
    }),
    __metadata("design:type", String)
], ApiSuccessResponse.prototype, "message", void 0);
class ValidationErrorDetail {
}
exports.ValidationErrorDetail = ValidationErrorDetail;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name', example: 'email' }),
    __metadata("design:type", String)
], ValidationErrorDetail.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message', example: 'Invalid email format' }),
    __metadata("design:type", String)
], ValidationErrorDetail.prototype, "message", void 0);
class ApiErrorInfo {
}
exports.ApiErrorInfo = ApiErrorInfo;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error code', example: 'VALIDATION_ERROR' }),
    __metadata("design:type", String)
], ApiErrorInfo.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Human-readable error message', example: 'Validation failed' }),
    __metadata("design:type", String)
], ApiErrorInfo.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed error information',
        type: [ValidationErrorDetail],
        example: [{ field: 'email', message: 'Invalid email format' }],
    }),
    __metadata("design:type", Array)
], ApiErrorInfo.prototype, "details", void 0);
class ApiErrorResponse {
}
exports.ApiErrorResponse = ApiErrorResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request success status', example: false }),
    __metadata("design:type", Boolean)
], ApiErrorResponse.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error information', type: ApiErrorInfo }),
    __metadata("design:type", ApiErrorInfo)
], ApiErrorResponse.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the error', example: '2025-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], ApiErrorResponse.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request path', example: '/api/users' }),
    __metadata("design:type", String)
], ApiErrorResponse.prototype, "path", void 0);
class MessageResponseDto {
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status', example: true }),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message', example: 'Operation completed successfully' }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "message", void 0);
class IdResponseDto {
}
exports.IdResponseDto = IdResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Success status', example: true }),
    __metadata("design:type", Boolean)
], IdResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created resource ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], IdResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Response message',
        example: 'Resource created successfully',
    }),
    __metadata("design:type", String)
], IdResponseDto.prototype, "message", void 0);
//# sourceMappingURL=api-response.dto.js.map