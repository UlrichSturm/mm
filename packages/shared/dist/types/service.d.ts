/**
 * Service category
 */
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Service interface
 */
export interface Service {
    id: string;
    vendorId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration?: number;
    isActive: boolean;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Service availability
 */
export interface ServiceAvailability {
    id: string;
    serviceId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
