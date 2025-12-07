import { AdminService } from './admin.service';
import { AdminStatsResponseDto } from './dto/stats-response.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<AdminStatsResponseDto>;
}
