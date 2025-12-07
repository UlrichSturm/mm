import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentStatus, Role } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import Stripe from 'stripe';
export interface PaymentFilters {
    status?: PaymentStatus;
    clientId?: string;
    page?: number;
    limit?: number;
}
export declare class PaymentsService {
    private readonly prisma;
    private readonly stripeService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createPaymentIntent(userId: string, dto: CreatePaymentIntentDto): Promise<{
        paymentIntentId: string;
        clientSecret: string;
        amount: number;
        currency: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<{
        id: any;
        orderId: any;
        orderNumber: any;
        stripePaymentIntentId: any;
        amount: number;
        currency: any;
        platformFee: number;
        stripeFee: number;
        vendorPayout: number;
        status: any;
        paidAt: any;
        refundedAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    handlePaymentFailed(paymentIntentId: string): Promise<void>;
    handleWebhook(event: Stripe.Event): Promise<void>;
    handleRefund(paymentIntentId: string): Promise<void>;
    createRefund(paymentId: string, userId: string, userRole: Role): Promise<{
        message: string;
    }>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        id: any;
        orderId: any;
        orderNumber: any;
        stripePaymentIntentId: any;
        amount: number;
        currency: any;
        platformFee: number;
        stripeFee: number;
        vendorPayout: number;
        status: any;
        paidAt: any;
        refundedAt: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findAll(filters: PaymentFilters): Promise<{
        data: {
            id: any;
            orderId: any;
            orderNumber: any;
            stripePaymentIntentId: any;
            amount: number;
            currency: any;
            platformFee: number;
            stripeFee: number;
            vendorPayout: number;
            status: any;
            paidAt: any;
            refundedAt: any;
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyPayments(clientId: string, filters: Omit<PaymentFilters, 'clientId'>): Promise<{
        data: {
            id: any;
            orderId: any;
            orderNumber: any;
            stripePaymentIntentId: any;
            amount: number;
            currency: any;
            platformFee: number;
            stripeFee: number;
            vendorPayout: number;
            status: any;
            paidAt: any;
            refundedAt: any;
            createdAt: any;
            updatedAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private formatPaymentResponse;
}
