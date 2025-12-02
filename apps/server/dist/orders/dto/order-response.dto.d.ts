import { OrderStatus, PaymentStatus } from '@prisma/client';
export declare class OrderItemResponseDto {
    id: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}
export declare class OrderClientDto {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}
export declare class OrderVendorDto {
    id: string;
    businessName: string;
    contactEmail: string;
    contactPhone?: string;
}
export declare class OrderPaymentDto {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    paidAt?: Date;
}
export declare class OrderResponseDto {
    id: string;
    orderNumber: string;
    client: OrderClientDto;
    items: OrderItemResponseDto[];
    subtotal: number;
    tax: number;
    totalPrice: number;
    currency: string;
    notes?: string;
    scheduledDate?: Date;
    status: OrderStatus;
    payment?: OrderPaymentDto;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    cancelledAt?: Date;
}
export declare class OrderListResponseDto {
    data: OrderResponseDto[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
