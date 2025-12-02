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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const role_enum_1 = require("../common/enums/role.enum");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            this.logger.warn(`User ${userId} not found in database, needs sync`);
            return null;
        }
        return user;
    }
    async updateProfile(userId, data) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                avatar: data.avatar,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User ${userId} profile updated`);
        return user;
    }
    async syncUserFromKeycloak(keycloakUser) {
        this.logger.log(`Syncing user from Keycloak: ${keycloakUser.email}`);
        let role = role_enum_1.Role.CLIENT;
        if (keycloakUser.roles?.includes('admin')) {
            role = role_enum_1.Role.ADMIN;
        }
        else if (keycloakUser.roles?.includes('vendor')) {
            role = role_enum_1.Role.VENDOR;
        }
        else if (keycloakUser.roles?.includes('lawyer_notary')) {
            role = role_enum_1.Role.LAWYER_NOTARY;
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: keycloakUser.email },
        });
        if (existingUser) {
            return this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    firstName: keycloakUser.given_name,
                    lastName: keycloakUser.family_name,
                    role,
                },
            });
        }
        return this.prisma.user.create({
            data: {
                id: keycloakUser.sub,
                email: keycloakUser.email,
                password: '',
                firstName: keycloakUser.given_name,
                lastName: keycloakUser.family_name,
                role,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByKeycloakId(keycloakId) {
        return this.prisma.user.findUnique({
            where: { id: keycloakId },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map