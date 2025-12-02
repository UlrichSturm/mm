import { AuthService } from './auth.service';
interface AuthenticatedRequest {
    user: {
        sub: string;
        email: string;
        given_name?: string;
        family_name?: string;
        roles?: string[];
    };
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getProfile(req: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    updateProfile(req: AuthenticatedRequest, body: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    healthCheck(): {
        status: string;
        service: string;
        timestamp: Date;
    };
}
export {};
