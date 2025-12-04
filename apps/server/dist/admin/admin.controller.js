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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const admin_service_1 = require("./admin.service");
const stats_response_dto_1 = require("./dto/stats-response.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const vendors_service_1 = require("../vendors/vendors.service");
const services_service_1 = require("../services/services.service");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    constructor(adminService, vendorsService, servicesService) {
        this.adminService = adminService;
        this.vendorsService = vendorsService;
        this.servicesService = servicesService;
    }
    async getStats() {
        return this.adminService.getStats();
    }
    async getVendorsForModeration(status) {
        return this.vendorsService.findAll(status);
    }
    async updateVendorStatus(id, status) {
        return this.vendorsService.updateStatus(id, status);
    }
    async getServicesForModeration(status, page, limit) {
        return this.adminService.getServicesForModeration(status, page ? Number(page) : 1, limit ? Number(limit) : 10);
    }
    async updateServiceStatus(id, status) {
        return this.servicesService.updateStatus(id, status);
    }
    async getUsers(role, page, limit) {
        return this.adminService.getUsers(role, page ? Number(page) : 1, limit ? Number(limit) : 10);
    }
    async updateUser(id, dto) {
        return this.adminService.updateUser(id, dto);
    }
    async toggleUserBlock(id, isBlocked) {
        return this.adminService.updateUser(id, { isBlocked });
    }
    async getLogs(level, module, page, limit) {
        return this.adminService.getLogs(level, module, page ? Number(page) : 1, limit ? Number(limit) : 50);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get platform statistics (admin only)',
        description: `
Returns comprehensive platform statistics including:
- User counts by role
- Vendor and service statistics by status
- Order and payment statistics
- Financial metrics (revenue, fees, payouts)
- Recent activity (last 7 days)
- Top performing categories
    `,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Platform statistics',
        type: stats_response_dto_1.AdminStatsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Not authenticated',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Not authorized (admin only)',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('vendors'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendors for moderation (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: vendors_service_1.VendorStatus, required: false }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of vendors for moderation',
    }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVendorsForModeration", null);
__decorate([
    (0, common_1.Patch)('vendors/:id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update vendor status (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Vendor ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Vendor status updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Vendor not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateVendorStatus", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get services for moderation (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.ServiceStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of services for moderation',
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServicesForModeration", null);
__decorate([
    (0, common_1.Patch)('services/:id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update service status (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service status updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Service not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateServiceStatus", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', enum: ['CLIENT', 'VENDOR', 'LAWYER_NOTARY', 'ADMIN'], required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of users',
    }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User updated',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/block'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Block or unblock user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User block status updated',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('isBlocked')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleUserBlock", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get application logs (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'level', required: false, description: 'Log level: error, warn, log, debug' }),
    (0, swagger_1.ApiQuery)({ name: 'module', required: false, description: 'Module name' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 50 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Application logs',
    }),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('module')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getLogs", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('admin'),
    (0, nest_keycloak_connect_1.Resource)('admin'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        vendors_service_1.VendorsService,
        services_service_1.ServicesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map