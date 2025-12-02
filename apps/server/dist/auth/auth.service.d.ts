import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
export interface User {
    id: string;
    email: string;
    password?: string;
    role: Role;
    firstName?: string;
    lastName?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: Omit<User, 'password'>;
}
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    login(loginDto: LoginDto): Promise<LoginResponse>;
    private generateToken;
    validateToken(token: string): Promise<User | null>;
    register(email: string, password: string, role?: Role, firstName?: string, lastName?: string): Promise<User>;
    getProfile(userId: string): Promise<User>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<User>;
}
