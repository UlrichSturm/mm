import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
export declare enum LawyerNotaryStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface LawyerNotaryProfile {
    id: string;
    userId: string;
    licenseNumber: string;
    licenseType: 'LAWYER' | 'NOTARY' | 'BOTH';
    organizationName?: string;
    status: LawyerNotaryStatus;
    specialization?: string;
    yearsOfExperience?: number;
    postalCode?: string;
    address?: string;
    homeVisitAvailable?: boolean;
    maxTravelRadius?: number;
    rating?: number;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LawyerNotaryService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: Partial<LawyerNotaryProfile>): Promise<LawyerNotaryProfile>;
    findAll(status?: LawyerNotaryStatus): Promise<LawyerNotaryProfile[]>;
    findByUserId(userId: string): Promise<LawyerNotaryProfile | null>;
    findOne(id: string): Promise<LawyerNotaryProfile>;
    private mapToInterface;
    updateProfile(id: string, userId: string, userRole: Role, data: Partial<LawyerNotaryProfile>): Promise<LawyerNotaryProfile>;
    updateStatus(id: string, status: LawyerNotaryStatus): Promise<LawyerNotaryProfile>;
    delete(id: string): Promise<void>;
    getAvailableLawyers(postalCode: string): Promise<any[]>;
}
