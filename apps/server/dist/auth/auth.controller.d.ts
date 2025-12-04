import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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
        deliveryAddress: string | null;
        deliveryPostalCode: string | null;
        deliveryCity: string | null;
        deliveryCountry: string | null;
        billingAddress: string | null;
        billingPostalCode: string | null;
        billingCity: string | null;
        billingCountry: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    updateProfile(req: AuthenticatedRequest, body: UpdateProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        deliveryAddress: string;
        deliveryPostalCode: string;
        deliveryCity: string;
        deliveryCountry: string;
        billingAddress: string;
        billingPostalCode: string;
        billingCity: string;
        billingCountry: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    changePassword(req: AuthenticatedRequest, body: ChangePasswordDto): Promise<{
        message: string;
    }>;
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
        token_type: any;
    }>;
    register(body: {
        email: string;
        username?: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        deliveryAddress: string | null;
        deliveryPostalCode: string | null;
        deliveryCity: string | null;
        deliveryCountry: string | null;
        billingAddress: string | null;
        billingPostalCode: string | null;
        billingCity: string | null;
        billingCountry: string | null;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    healthCheck(): {
        status: string;
        service: string;
        timestamp: Date;
    };
}
export {};
