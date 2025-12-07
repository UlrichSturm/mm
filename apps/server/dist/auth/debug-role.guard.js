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
var DebugRoleGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let DebugRoleGuard = DebugRoleGuard_1 = class DebugRoleGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(DebugRoleGuard_1.name);
    }
    canActivate(context) {
        const rolesMeta = this.reflector.get('roles', context.getHandler());
        if (!rolesMeta || !rolesMeta.roles) {
            this.logger.warn('DebugRoleGuard: No roles required for this handler');
            return true;
        }
        const roles = rolesMeta.roles;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        this.logger.warn(`DebugRoleGuard: Required Roles: ${JSON.stringify(roles)}`);
        this.logger.warn(`DebugRoleGuard: User Roles (from request.user.roles): ${JSON.stringify(user?.roles)}`);
        this.logger.warn(`DebugRoleGuard: User Realm Access: ${JSON.stringify(user?.realm_access)}`);
        this.logger.warn(`DebugRoleGuard: User Resource Access: ${JSON.stringify(user?.resource_access)}`);
        if (!user || !user.realm_access || !user.realm_access.roles) {
            this.logger.warn('DebugRoleGuard: User has no realm_access.roles');
            return false;
        }
        const userRoles = user.realm_access.roles;
        const hasRole = roles.some(role => userRoles.includes(role));
        this.logger.warn(`DebugRoleGuard: Match Result: ${hasRole}`);
        return hasRole;
    }
};
exports.DebugRoleGuard = DebugRoleGuard;
exports.DebugRoleGuard = DebugRoleGuard = DebugRoleGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], DebugRoleGuard);
//# sourceMappingURL=debug-role.guard.js.map