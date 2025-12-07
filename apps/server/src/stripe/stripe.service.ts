import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
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

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly webhookSecret: string;
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe features will be disabled');
      // Create dummy stripe instance
      this.stripe = {} as Stripe;
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2025-11-17.clover',
        typescript: true,
      });
    }

    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  /**
   * Create a payment intent for a one-time payment
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const { amount, currency = 'eur', customerId, metadata, description } = params;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata,
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create PaymentIntent: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create payment');
    }
  }

  /**
   * Retrieve a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`PaymentIntent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to cancel PaymentIntent: ${(error as Error).message}`);
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });

      this.logger.log(`Refund created: ${refund.id} for PaymentIntent: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create refund');
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create customer');
    }
  }

  /**
   * Create a Stripe Connect account for vendors
   */
  async createConnectAccount(params: CreateConnectAccountParams): Promise<Stripe.Account> {
    const { email, businessName, country = 'DE' } = params;

    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_profile: {
          name: businessName,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      this.logger.log(`Connect account created: ${account.id}`);
      return account;
    } catch (error) {
      this.logger.error(`Failed to create Connect account: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create vendor account');
    }
  }

  /**
   * Create account link for Connect onboarding
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      this.logger.error(`Failed to create account link: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create onboarding link');
    }
  }

  /**
   * Get Connect account details
   */
  async getConnectAccount(accountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(accountId);
  }

  /**
   * Create a transfer to a Connect account (vendor payout)
   */
  async createTransfer(
    amount: number,
    destinationAccountId: string,
    transferGroup?: string,
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount,
        currency: 'eur',
        destination: destinationAccountId,
        transfer_group: transferGroup,
      });

      this.logger.log(`Transfer created: ${transfer.id} to ${destinationAccountId}`);
      return transfer;
    } catch (error) {
      this.logger.error(`Failed to create transfer: ${(error as Error).message}`);
      throw new BadRequestException('Failed to create transfer');
    }
  }

  /**
   * Verify webhook signature and construct event
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${(error as Error).message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
