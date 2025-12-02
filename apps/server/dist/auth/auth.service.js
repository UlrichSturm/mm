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
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.keycloakUrl = this.configService.get('KEYCLOAK_URL') || 'http://localhost:8080';
        this.keycloakRealm = this.configService.get('KEYCLOAK_REALM') || 'memento-mori';
        this.keycloakAdminUser = this.configService.get('KEYCLOAK_ADMIN_USER') || 'admin';
        this.keycloakAdminPassword = this.configService.get('KEYCLOAK_ADMIN_PASSWORD') || 'admin';
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
    async loginUser(username, password) {
        try {
            const keycloakClientId = this.configService.get('KEYCLOAK_CLIENT_ID') || 'memento-mori-api';
            const keycloakClientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET');
            if (!keycloakClientSecret) {
                throw new common_1.BadRequestException('Keycloak client secret not configured');
            }
            const response = await axios_1.default.post(`${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`, new URLSearchParams({
                grant_type: 'password',
                client_id: keycloakClientId,
                client_secret: keycloakClientSecret,
                username,
                password,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const data = response.data;
            const tokenPayload = this.parseJwt(data.access_token);
            if (tokenPayload) {
                await this.syncUserFromKeycloak({
                    sub: tokenPayload.sub,
                    email: tokenPayload.email || tokenPayload.preferred_username,
                    given_name: tokenPayload.given_name,
                    family_name: tokenPayload.family_name,
                    roles: tokenPayload.realm_access?.roles || [],
                });
            }
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (axios_1.default.isAxiosError(error) && error.response) {
                const errorData = error.response.data || {};
                throw new common_1.BadRequestException(errorData.error_description || errorData.error || 'Invalid credentials');
            }
            this.logger.error('Login error:', error);
            throw new common_1.BadRequestException('Login failed');
        }
    }
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
            return JSON.parse(jsonPayload);
        }
        catch {
            return null;
        }
    }
    async registerUser(data) {
        this.logger.log(`Registering new user: ${data.email}`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const adminToken = await this.getKeycloakAdminToken();
        if (!adminToken) {
            throw new common_1.BadRequestException('Failed to authenticate with Keycloak admin');
        }
        const keycloakUserId = await this.createKeycloakUser(adminToken, {
            email: data.email,
            username: data.username || data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        if (!keycloakUserId) {
            throw new common_1.BadRequestException('Failed to create user in Keycloak');
        }
        await this.assignRoleToUser(adminToken, keycloakUserId, 'client');
        const user = await this.prisma.user.create({
            data: {
                id: keycloakUserId,
                email: data.email,
                password: '',
                firstName: data.firstName,
                lastName: data.lastName,
                role: role_enum_1.Role.CLIENT,
            },
        });
        this.logger.log(`User ${data.email} registered successfully`);
        return user;
    }
    async getKeycloakAdminToken() {
        try {
            const response = await axios_1.default.post(`${this.keycloakUrl}/realms/master/protocol/openid-connect/token`, new URLSearchParams({
                grant_type: 'password',
                client_id: 'admin-cli',
                username: this.keycloakAdminUser,
                password: this.keycloakAdminPassword,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            this.logger.error('Error getting admin token:', error);
            return null;
        }
    }
    async createKeycloakUser(adminToken, data) {
        try {
            const response = await axios_1.default.post(`${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users`, {
                email: data.email,
                username: data.username,
                enabled: true,
                emailVerified: true,
                firstName: data.firstName,
                lastName: data.lastName,
                credentials: [
                    {
                        type: 'password',
                        value: data.password,
                        temporary: false,
                    },
                ],
            }, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
                validateStatus: () => true,
            });
            if (response.status === 409) {
                throw new common_1.ConflictException('User already exists in Keycloak');
            }
            if (response.status >= 400) {
                this.logger.error('Failed to create user in Keycloak:', response.data);
                return null;
            }
            const location = response.headers.location;
            if (location) {
                const userId = location.split('/').pop();
                return userId || null;
            }
            const searchResponse = await axios_1.default.get(`${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users`, {
                params: { email: data.email },
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                },
            });
            if (searchResponse.data && searchResponse.data.length > 0) {
                return searchResponse.data[0].id;
            }
            return null;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Error creating user in Keycloak:', error);
            return null;
        }
    }
    async assignRoleToUser(adminToken, userId, roleName) {
        try {
            const roleResponse = await axios_1.default.get(`${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/roles/${roleName}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                },
                validateStatus: () => true,
            });
            if (roleResponse.status >= 400) {
                this.logger.warn(`Role ${roleName} not found, skipping role assignment`);
                return false;
            }
            const role = roleResponse.data;
            const assignResponse = await axios_1.default.post(`${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}/role-mappings/realm`, [role], {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json',
                },
                validateStatus: () => true,
            });
            return assignResponse.status < 400;
        }
        catch (error) {
            this.logger.error('Error assigning role to user:', error);
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map