import { AuthService, LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("./auth.service").LoginResponse>;
    register(body: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }): Promise<import("./auth.service").User>;
    getProfile(req: any): Promise<import("./auth.service").User>;
    updateProfile(req: any, body: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<import("./auth.service").User>;
}
