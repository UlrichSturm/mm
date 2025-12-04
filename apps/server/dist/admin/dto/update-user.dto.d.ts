import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: Role;
    isBlocked?: boolean;
}
