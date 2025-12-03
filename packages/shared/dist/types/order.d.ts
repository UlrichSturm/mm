/**
 * Order status enum
 */
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
/**
 * Payment status enum
 */
export declare enum PaymentStatus {
    PENDING = "PENDING",
    AUTHORIZED = "AUTHORIZED",
    CAPTURED = "CAPTURED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED"
}
/**
 * Order interface
 */
export interface Order {
    id: string;
    clientId: string;
    vendorId: string;
    serviceId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    currency: string;
    notes?: string;
    scheduledDate?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Order item interface
 */
export interface OrderItem {
    id: string;
    orderId: string;
    serviceId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}
