export interface Service {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
}
export declare class ServicesService {
    findAll(filters?: {
        search?: string;
        categoryId?: string;
    }): Service[];
}
