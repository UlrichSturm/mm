import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { PaymentStatus, Role } from '@prisma/client';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { Decimal } from '@prisma/client/runtime/library';
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
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService, emailService: EmailService);
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
    findPaymentByIntentId(paymentIntentId: string): Promise<{
        order: {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            orderNumber: string;
            totalPrice: Decimal;
            clientId: string;
            currency: string;
            notes: string | null;
            scheduledDate: Date | null;
            subtotal: Decimal;
            tax: Decimal;
            completedAt: Date | null;
            cancelledAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: Decimal;
        currency: string;
        orderId: string;
        stripePaymentIntentId: string | null;
        stripeChargeId: string | null;
        platformFee: Decimal;
        stripeFee: Decimal;
        vendorPayout: Decimal;
        paidAt: Date | null;
        refundedAt: Date | null;
    }>;
    private formatPaymentResponse;
}
