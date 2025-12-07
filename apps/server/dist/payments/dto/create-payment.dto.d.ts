export declare class CreatePaymentIntentDto {
    orderId: string;
    returnUrl?: string;
}
export declare class ConfirmPaymentDto {
    paymentIntentId: string;
}
