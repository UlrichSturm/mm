import { PrismaService } from '../prisma/prisma.service';
import { ServiceStatus, Role } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export interface ServiceFilters {
    search?: string;
    categoryId?: string;
    vendorId?: string;
    status?: ServiceStatus;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}
export declare class ServicesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateServiceDto): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        currency: any;
        duration: any;
        images: any;
        status: any;
        vendor: {
            id: any;
            businessName: any;
            rating: any;
            reviewCount: any;
        };
        category: {
            id: any;
            name: any;
            slug: any;
        };
        createdAt: any;
        updatedAt: any;
    }>;
    findAll(filters: ServiceFilters): Promise<{
        data: {
            id: any;
            name: any;
            description: any;
            price: number;
            currency: any;
            duration: any;
            images: any;
            status: any;
            vendor: {
                id: any;
                businessName: any;
                rating: any;
                reviewCount: any;
            };
            category: {
                id: any;
                name: any;
                slug: any;
            };
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        currency: any;
        duration: any;
        images: any;
        status: any;
        vendor: {
            id: any;
            businessName: any;
            rating: any;
            reviewCount: any;
        };
        category: {
            id: any;
            name: any;
            slug: any;
        };
        createdAt: any;
        updatedAt: any;
    }>;
    getMyServices(userId: string, filters: Omit<ServiceFilters, 'vendorId'>): Promise<{
        data: {
            id: any;
            name: any;
            description: any;
            price: number;
            currency: any;
            duration: any;
            images: any;
            status: any;
            vendor: {
                id: any;
                businessName: any;
                rating: any;
                reviewCount: any;
            };
            category: {
                id: any;
                name: any;
                slug: any;
            };
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, userId: string, userRole: Role, dto: UpdateServiceDto): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        currency: any;
        duration: any;
        images: any;
        status: any;
        vendor: {
            id: any;
            businessName: any;
            rating: any;
            reviewCount: any;
        };
        category: {
            id: any;
            name: any;
            slug: any;
        };
        createdAt: any;
        updatedAt: any;
    }>;
    delete(id: string, userId: string, userRole: Role): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: ServiceStatus): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        currency: any;
        duration: any;
        images: any;
        status: any;
        vendor: {
            id: any;
            businessName: any;
            rating: any;
            reviewCount: any;
        };
        category: {
            id: any;
            name: any;
            slug: any;
        };
        createdAt: any;
        updatedAt: any;
    }>;
    private formatServiceResponse;
}
