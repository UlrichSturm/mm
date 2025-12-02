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
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const vendors_service_1 = require("./vendors.service");
const role_enum_1 = require("../common/enums/role.enum");
let VendorsController = class VendorsController {
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    async create(data) {
        return this.vendorsService.create(data.userId, data);
    }
    async findAll(status) {
        return this.vendorsService.findAll(status);
    }
    async getMyProfile(req) {
        const profile = await this.vendorsService.findByUserId(req.user.sub);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    async findOne(id) {
        return this.vendorsService.findOne(id);
    }
    async updateMyProfile(req, data) {
        const profile = await this.vendorsService.findByUserId(req.user.sub);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.vendorsService.updateProfile(profile.id, req.user.sub, userRole, data);
    }
    async updateProfile(id, data) {
        const profile = await this.vendorsService.findOne(id);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return this.vendorsService.updateProfile(id, profile.userId, role_enum_1.Role.ADMIN, data);
    }
    async updateStatus(id, status) {
        return this.vendorsService.updateStatus(id, status);
    }
    async delete(id) {
        await this.vendorsService.delete(id);
        return { message: 'Vendor deleted successfully' };
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
exports.VendorsController = VendorsController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create vendor profile (admin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List all vendors (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: vendors_service_1.VendorStatus, required: false }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor', 'admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my vendor profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get vendor by ID (public)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor', 'admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my vendor profile' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update vendor profile (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update vendor status (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Vendor ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete vendor (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorsController.prototype, "delete", null);
exports.VendorsController = VendorsController = __decorate([
    (0, swagger_1.ApiTags)('vendors'),
    (0, common_1.Controller)('vendors'),
    (0, nest_keycloak_connect_1.Resource)('vendors'),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map