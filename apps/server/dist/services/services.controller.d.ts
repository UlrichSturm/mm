import { ServiceStatus } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceListResponseDto, ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(search?: string, categoryId?: string, vendorId?: string, minPrice?: number, maxPrice?: number, page?: number, limit?: number, sortBy?: string): Promise<ServiceListResponseDto>;
    findOne(req: any, id: string): Promise<ServiceResponseDto>;
    create(req: any, createServiceDto: CreateServiceDto): Promise<ServiceResponseDto>;
    getMyServices(req: any, search?: string, categoryId?: string, status?: ServiceStatus, page?: number, limit?: number): Promise<ServiceListResponseDto>;
    update(req: any, id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceResponseDto>;
    delete(req: any, id: string): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: ServiceStatus): Promise<ServiceResponseDto>;
    private getRoleFromKeycloakRoles;
}
