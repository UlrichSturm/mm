import { ServiceStatus } from '@prisma/client';
export declare class UpdateServiceDto {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    duration?: number;
    images?: string[];
    status?: ServiceStatus;
}
