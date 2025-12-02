import { PaymentStatus } from '@prisma/client';
export declare class PaymentIntentResponseDto {
    paymentIntentId: string;
    clientSecret: string;
    amount: number;
    currency: string;
}
export declare class PaymentResponseDto {
    id: string;
    orderId: string;
    orderNumber: string;
    stripePaymentIntentId?: string;
    amount: number;
    currency: string;
    platformFee: number;
    stripeFee: number;
    vendorPayout: number;
    status: PaymentStatus;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaymentListResponseDto {
    data: PaymentResponseDto[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
