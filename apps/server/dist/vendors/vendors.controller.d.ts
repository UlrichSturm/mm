import { VendorsService, VendorStatus } from './vendors.service';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    create(data: any): Promise<import("./vendors.service").VendorProfile>;
    findAll(status?: VendorStatus): Promise<import("./vendors.service").VendorProfile[]>;
    getMyProfile(req: any): Promise<import("./vendors.service").VendorProfile>;
    findOne(id: string): Promise<import("./vendors.service").VendorProfile>;
    updateMyProfile(req: any, data: any): Promise<import("./vendors.service").VendorProfile>;
    updateProfile(id: string, data: any): Promise<import("./vendors.service").VendorProfile>;
    updateStatus(id: string, status: VendorStatus): Promise<import("./vendors.service").VendorProfile>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
