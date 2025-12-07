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
exports.WillsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
let WillsController = class WillsController {
    async getAllAppointments(_filters) {
        return [];
    }
    async getAppointment(_id) {
        return null;
    }
    async getAllExecutions(_filters) {
        return [];
    }
    async getExecution(_id) {
        return null;
    }
    async getWillData(_id) {
        return null;
    }
};
exports.WillsController = WillsController;
__decorate([
    (0, common_1.Get)('appointments'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all will appointments (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getAllAppointments", null);
__decorate([
    (0, common_1.Get)('appointments/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get will appointment by ID (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getAppointment", null);
__decorate([
    (0, common_1.Get)('executions'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all will executions (admin only)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getAllExecutions", null);
__decorate([
    (0, common_1.Get)('executions/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get will execution by ID (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Get)('data/:id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get will data by ID (admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WillsController.prototype, "getWillData", null);
exports.WillsController = WillsController = __decorate([
    (0, swagger_1.ApiTags)('wills'),
    (0, common_1.Controller)('wills'),
    (0, nest_keycloak_connect_1.Resource)('wills')
], WillsController);
//# sourceMappingURL=wills.controller.js.map