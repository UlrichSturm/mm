import { AdminService } from './admin.service';
import { AdminStatsResponseDto } from './dto/stats-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VendorsService, VendorStatus } from '../vendors/vendors.service';
import { ServicesService } from '../services/services.service';
import { ServiceStatus } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    private readonly vendorsService;
    private readonly servicesService;
    constructor(adminService: AdminService, vendorsService: VendorsService, servicesService: ServicesService);
    getStats(): Promise<AdminStatsResponseDto>;
    getVendorsForModeration(status?: VendorStatus): Promise<import("../vendors/vendors.service").VendorProfile[]>;
    updateVendorStatus(id: string, status: VendorStatus): Promise<import("../vendors/vendors.service").VendorProfile>;
    getServicesForModeration(status?: ServiceStatus, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            status: import(".prisma/client").$Enums.ServiceStatus;
            vendor: {
                id: string;
                businessName: string;
                contactEmail: string;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateServiceStatus(id: string, status: ServiceStatus): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        currency: any;
        duration: any;
        images: any;
        status: any;
        vendor: any;
        category: {
            id: any;
            name: any;
            slug: any;
            description: any;
        };
        createdAt: any;
        updatedAt: any;
    }>;
    getUsers(role?: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            isBlocked: boolean;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    toggleUserBlock(id: string, isBlocked: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        isBlocked: boolean;
    }>;
    getLogs(level?: string, module?: string, page?: number, limit?: number): Promise<{
        data: {
            timestamp: Date;
            level: string;
            module: string;
            message: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            note: string;
        };
    }>;
}
