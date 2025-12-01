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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const role_enum_1 = require("../common/enums/role.enum");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.password !== password) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            token,
            user: {
                id: userWithoutPassword.id,
                email: userWithoutPassword.email,
                role: userWithoutPassword.role,
                firstName: userWithoutPassword.firstName,
                lastName: userWithoutPassword.lastName,
            },
        };
    }
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + 24 * 60 * 60 * 1000,
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
    async validateToken(token) {
        try {
            const payload = JSON.parse(Buffer.from(token, 'base64').toString());
            if (payload.exp && payload.exp < Date.now()) {
                return null;
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.id },
            });
            if (!user) {
                return null;
            }
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            };
        }
        catch {
            return null;
        }
    }
    async register(email, password, role = role_enum_1.Role.CLIENT) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('User with this email already exists');
        }
        const newUser = await this.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password,
                role: role,
            },
        });
        return {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map