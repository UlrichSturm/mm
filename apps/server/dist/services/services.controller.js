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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const services_service_1 = require("./services.service");
const role_enum_1 = require("../common/enums/role.enum");
const create_service_dto_1 = require("./dto/create-service.dto");
const update_service_dto_1 = require("./dto/update-service.dto");
const service_response_dto_1 = require("./dto/service-response.dto");
let ServicesController = class ServicesController {
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    async findAll(search, categoryId, vendorId, minPrice, maxPrice, page, limit) {
        const filters = {
            search,
            categoryId,
            vendorId,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        };
        return this.servicesService.findAll(filters);
    }
    async findOne(id) {
        return this.servicesService.findOne(id);
    }
    async create(req, createServiceDto) {
        return this.servicesService.create(req.user.sub, createServiceDto);
    }
    async getMyServices(req, search, categoryId, status, page, limit) {
        return this.servicesService.getMyServices(req.user.sub, {
            search,
            categoryId,
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    async update(req, id, updateServiceDto) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.servicesService.update(id, req.user.sub, userRole, updateServiceDto);
    }
    async delete(req, id) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.servicesService.delete(id, req.user.sub, userRole);
    }
    async updateStatus(id, status) {
        return this.servicesService.updateStatus(id, status);
    }
    getRoleFromKeycloakRoles(roles) {
        if (roles?.includes('admin')) {
            return role_enum_1.Role.ADMIN;
        }
        if (roles?.includes('vendor')) {
            return role_enum_1.Role.VENDOR;
        }
        if (roles?.includes('lawyer_notary')) {
            return role_enum_1.Role.LAWYER_NOTARY;
        }
        return role_enum_1.Role.CLIENT;
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all services (public)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by name or description' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false, description: 'Filter by category' }),
    (0, swagger_1.ApiQuery)({ name: 'vendorId', required: false, description: 'Filter by vendor' }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of services',
        type: service_response_dto_1.ServiceListResponseDto,
    }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('vendorId')),
    __param(3, (0, common_1.Query)('minPrice')),
    __param(4, (0, common_1.Query)('maxPrice')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get service by ID (public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service details',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new service (vendor only)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Service created successfully',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized or not approved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_service_dto_1.CreateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vendor/my'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my services (vendor only)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.ServiceStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of vendor services',
        type: service_response_dto_1.ServiceListResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "getMyServices", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update service (owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service updated successfully',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Service not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_service_dto_1.UpdateServiceDto]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete service (owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Service not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update service status (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Service ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Service status updated',
        type: service_response_dto_1.ServiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Service not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ServicesController.prototype, "updateStatus", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)('services'),
    (0, common_1.Controller)('services'),
    (0, nest_keycloak_connect_1.Resource)('services'),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map