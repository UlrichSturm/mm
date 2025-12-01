import { AuthService, LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<import("./auth.service").LoginResponse>;
    register(body: {
        email: string;
        password: string;
    }): Promise<import("./auth.service").User>;
}
