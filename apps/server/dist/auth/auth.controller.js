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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async getProfile(req) {
        const keycloakUserId = req.user.sub;
        let user = await this.authService.findByKeycloakId(keycloakUserId);
        if (!user) {
            user = await this.authService.syncUserFromKeycloak(req.user);
        }
        return user;
    }
    async updateProfile(req, body) {
        const keycloakUserId = req.user.sub;
        return this.authService.updateProfile(keycloakUserId, body);
    }
    async changePassword(req, body) {
        const keycloakUserId = req.user.sub;
        return this.authService.changePassword(keycloakUserId, body.currentPassword, body.newPassword);
    }
    async login(body) {
        if (!body.username || !body.password) {
            throw new common_1.BadRequestException('Username and password are required');
        }
        return this.authService.loginUser(body.username, body.password);
    }
    async register(body) {
        return this.authService.registerUser(body);
    }
    healthCheck() {
        return { status: 'ok', service: 'auth', timestamp: new Date() };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user profile',
        description: 'Returns user profile from database. User must be authenticated via Keycloak.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile',
        schema: {
            example: {
                id: 'uuid',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'CLIENT',
                createdAt: '2025-12-01T00:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update current user profile',
        description: 'Update user profile information including addresses',
    }),
    (0, swagger_1.ApiBody)({ type: update_profile_dto_1.UpdateProfileDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile updated successfully',
        schema: {
            example: {
                id: 'uuid',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Smith',
                phone: '+49 123 456 7890',
                deliveryAddress: 'Musterstraße 123',
                deliveryPostalCode: '10115',
                deliveryCity: 'Berlin',
                deliveryCountry: 'DE',
                billingAddress: 'Rechnungsstraße 456',
                billingPostalCode: '20095',
                billingCity: 'Hamburg',
                billingCountry: 'DE',
                role: 'CLIENT',
                createdAt: '2025-12-01T00:00:00.000Z',
                updatedAt: '2025-12-01T00:00:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('password'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change user password',
        description: 'Change password using Keycloak Admin API. Requires current password verification.',
    }),
    (0, swagger_1.ApiBody)({ type: change_password_dto_1.ChangePasswordDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password changed successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password or validation error' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Login user',
        description: 'Authenticates user with Keycloak using Direct Access Grants',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'password123' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                expires_in: { type: 'number' },
                token_type: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Register new user',
        description: 'Creates a new user in Keycloak and syncs to local database',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                username: { type: 'string', example: 'username' },
                password: { type: 'string', example: 'password123' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check for auth service',
        description: 'Public endpoint to check if auth service is running',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Auth service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "healthCheck", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map