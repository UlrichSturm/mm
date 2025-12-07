import { OrderStatus } from '@prisma/client';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    reason?: string;
}
export declare class UpdateOrderDto {
    notes?: string;
    scheduledDate?: string;
}
