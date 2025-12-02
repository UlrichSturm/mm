import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
export interface CreatePaymentIntentParams {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
    description?: string;
}
export interface CreateConnectAccountParams {
    email: string;
    businessName: string;
    country?: string;
}
export declare class StripeService {
    private readonly stripe;
    private readonly configService;
    private readonly logger;
    private readonly webhookSecret;
    constructor(stripe: Stripe, configService: ConfigService);
    createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent>;
    getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    createRefund(paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason): Promise<Stripe.Refund>;
    createCustomer(email: string, name?: string): Promise<Stripe.Customer>;
    createConnectAccount(params: CreateConnectAccountParams): Promise<Stripe.Account>;
    createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<Stripe.AccountLink>;
    getConnectAccount(accountId: string): Promise<Stripe.Account>;
    createTransfer(amount: number, destinationAccountId: string, transferGroup?: string): Promise<Stripe.Transfer>;
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
}
