import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, data: {
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
    syncUserFromKeycloak(keycloakUser: {
        sub: string;
        email: string;
        given_name?: string;
        family_name?: string;
        roles?: string[];
    }): Promise<{
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
    findByEmail(email: string): Promise<{
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
    findByKeycloakId(keycloakId: string): Promise<{
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
}
