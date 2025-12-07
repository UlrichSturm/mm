import { ServiceStatus } from '@prisma/client';
export declare class ServiceVendorDto {
    id: string;
    businessName: string;
    rating: number;
    reviewCount: number;
}
export declare class ServiceCategoryDto {
    id: string;
    name: string;
    slug: string;
}
export declare class ServiceResponseDto {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration?: number;
    images?: string[];
    status: ServiceStatus;
    vendor?: ServiceVendorDto;
    category?: ServiceCategoryDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ServiceListResponseDto {
    data: ServiceResponseDto[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
