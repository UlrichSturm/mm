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
exports.LawyerNotaryController = void 0;
const common_1 = require("@nestjs/common");
const lawyer_notary_service_1 = require("./lawyer-notary.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
let LawyerNotaryController = class LawyerNotaryController {
    constructor(lawyerNotaryService) {
        this.lawyerNotaryService = lawyerNotaryService;
    }
    async create(data) {
        return this.lawyerNotaryService.create(data.userId, data);
    }
    async findAll(status) {
        return this.lawyerNotaryService.findAll(status);
    }
    async getAvailableLawyers(postalCode) {
        return this.lawyerNotaryService.getAvailableLawyers(postalCode || '');
    }
    async getMyProfile(req) {
        const profile = await this.lawyerNotaryService.findByUserId(req.user.id);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    async findOne(id) {
        return this.lawyerNotaryService.findOne(id);
    }
    async updateMyProfile(req, data) {
        const profile = await this.lawyerNotaryService.findByUserId(req.user.id);
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return this.lawyerNotaryService.updateProfile(profile.id, req.user.id, req.user.role, data);
    }
    async updateProfile(id, data) {
        const profile = await this.lawyerNotaryService.findOne(id);
        return this.lawyerNotaryService.updateProfile(id, profile.userId, role_enum_1.Role.ADMIN, data);
    }
    async updateStatus(id, status) {
        return this.lawyerNotaryService.updateStatus(id, status);
    }
    async delete(id) {
        await this.lawyerNotaryService.delete(id);
        return { message: 'Profile deleted successfully' };
    }
};
exports.LawyerNotaryController = LawyerNotaryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('postalCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "getAvailableLawyers", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.LAWYER_NOTARY, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.LAWYER_NOTARY, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LawyerNotaryController.prototype, "delete", null);
exports.LawyerNotaryController = LawyerNotaryController = __decorate([
    (0, common_1.Controller)('lawyer-notary'),
    __metadata("design:paramtypes", [lawyer_notary_service_1.LawyerNotaryService])
], LawyerNotaryController);
//# sourceMappingURL=lawyer-notary.controller.js.map