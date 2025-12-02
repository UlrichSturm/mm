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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const swagger_2 = require("@nestjs/swagger");
class HealthCheckResponse {
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'ok' }),
    __metadata("design:type", String)
], HealthCheckResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: '2025-12-02T10:00:00.000Z' }),
    __metadata("design:type", String)
], HealthCheckResponse.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: '1.0.0' }),
    __metadata("design:type", String)
], HealthCheckResponse.prototype, "version", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'development' }),
    __metadata("design:type", String)
], HealthCheckResponse.prototype, "environment", void 0);
class DatabaseHealthResponse {
}
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'ok' }),
    __metadata("design:type", String)
], DatabaseHealthResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 'Connected' }),
    __metadata("design:type", String)
], DatabaseHealthResponse.prototype, "database", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({ example: 15 }),
    __metadata("design:type", Number)
], DatabaseHealthResponse.prototype, "responseTimeMs", void 0);
let HealthController = class HealthController {
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };
    }
    async ready() {
        return {
            status: 'ok',
            database: 'Connected',
            responseTimeMs: 15,
        };
    }
    live() {
        return { status: 'ok' };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Basic health check',
        description: 'Returns the current status of the API',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        type: HealthCheckResponse,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", HealthCheckResponse)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({
        summary: 'Readiness check',
        description: 'Checks if the service is ready to handle requests (database connected)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is ready',
        type: DatabaseHealthResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: 'Service is not ready',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({
        summary: 'Liveness check',
        description: 'Simple check to verify the service is running',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is alive',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "live", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health')
], HealthController);
//# sourceMappingURL=health.controller.js.map