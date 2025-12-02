export declare class CreateOrderItemDto {
    serviceId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    notes?: string;
    scheduledDate?: string;
}
