import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(search?: string, categoryId?: string): import("./services.service").Service[];
}
