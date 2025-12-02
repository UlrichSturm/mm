import { LawyerNotaryService, LawyerNotaryStatus } from './lawyer-notary.service';
export declare class LawyerNotaryController {
    private readonly lawyerNotaryService;
    constructor(lawyerNotaryService: LawyerNotaryService);
    create(data: any): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    findAll(status?: LawyerNotaryStatus): Promise<import("./lawyer-notary.service").LawyerNotaryProfile[]>;
    getAvailableLawyers(postalCode: string): Promise<any[]>;
    getMyProfile(req: any): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    findOne(id: string): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    updateMyProfile(req: any, data: any): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    updateProfile(id: string, data: any): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    updateStatus(id: string, status: LawyerNotaryStatus): Promise<import("./lawyer-notary.service").LawyerNotaryProfile>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
