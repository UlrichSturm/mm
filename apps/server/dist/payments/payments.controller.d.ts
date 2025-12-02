import { RawBodyRequest } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { StripeService } from '../stripe/stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { PaymentIntentResponseDto, PaymentResponseDto, PaymentListResponseDto } from './dto/payment-response.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly stripeService;
    constructor(paymentsService: PaymentsService, stripeService: StripeService);
    createPaymentIntent(req: any, dto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto>;
    getMyPayments(req: any, status?: PaymentStatus, page?: number, limit?: number): Promise<PaymentListResponseDto>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
        error: string;
    } | {
        received: boolean;
        error?: undefined;
    }>;
    findAll(status?: PaymentStatus, clientId?: string, page?: number, limit?: number): Promise<PaymentListResponseDto>;
    createRefund(req: any, id: string): Promise<{
        message: string;
    }>;
    findOne(req: any, id: string): Promise<PaymentResponseDto>;
    private getRoleFromKeycloakRoles;
}
