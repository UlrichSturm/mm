import { ServiceStatus } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto, ServiceListResponseDto } from './dto/service-response.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(search?: string, categoryId?: string, vendorId?: string, minPrice?: number, maxPrice?: number, page?: number, limit?: number): Promise<ServiceListResponseDto>;
    findOne(id: string): Promise<ServiceResponseDto>;
    create(req: any, createServiceDto: CreateServiceDto): Promise<ServiceResponseDto>;
    getMyServices(req: any, search?: string, categoryId?: string, status?: ServiceStatus, page?: number, limit?: number): Promise<ServiceListResponseDto>;
    update(req: any, id: string, updateServiceDto: UpdateServiceDto): Promise<ServiceResponseDto>;
    delete(req: any, id: string): Promise<{
        message: string;
    }>;
    updateStatus(id: string, status: ServiceStatus): Promise<ServiceResponseDto>;
    private getRoleFromKeycloakRoles;
}
