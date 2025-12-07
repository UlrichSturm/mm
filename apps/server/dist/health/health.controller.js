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
var HealthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthController = HealthController_1 = class HealthController {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(HealthController_1.name);
    }
    getHealth() {
        return {
            status: 'ok',
            version: this.configService.get('APP_VERSION', '1.0.0'),
            env: this.configService.get('NODE_ENV', 'development'),
        };
    }
    async getReadiness() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return { database: 'Connected' };
        }
        catch (error) {
            this.logger.error('Database connection failed', error.stack);
            throw new Error('Database connection failed');
        }
    }
    getLiveness() {
        return { status: 'ok' };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Basic health check' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Service is up and running' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe: checks database connection' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Service is ready' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.SERVICE_UNAVAILABLE, description: 'Service is not ready' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getReadiness", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe: checks if the application is alive' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Service is alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "getLiveness", null);
exports.HealthController = HealthController = HealthController_1 = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map