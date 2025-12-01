import { PrismaService } from '../prisma/prisma.service';
export declare enum VendorStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface VendorProfile {
    id: string;
    userId: string;
    businessName: string;
    email: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    status: VendorStatus;
    registrationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VendorsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(status?: VendorStatus): Promise<VendorProfile[]>;
    findOne(id: string): Promise<VendorProfile | null>;
    findByUserId(userId: string): Promise<VendorProfile | null>;
    create(userId: string, data: Partial<VendorProfile>): Promise<VendorProfile>;
    updateProfile(id: string, userId: string, userRole: string, data: Partial<VendorProfile>): Promise<VendorProfile>;
    updateStatus(id: string, status: VendorStatus): Promise<VendorProfile>;
    delete(id: string): Promise<void>;
    private mapToInterface;
}
