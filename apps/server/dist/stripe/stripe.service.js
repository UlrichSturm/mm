"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const stripe_module_1 = require("./stripe.module");
const config_1 = require("@nestjs/config");
let StripeService = StripeService_1 = class StripeService {
    constructor(stripe, configService) {
        this.stripe = stripe;
        this.configService = configService;
        this.logger = new common_1.Logger(StripeService_1.name);
        this.webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET') || '';
    }
    async createPaymentIntent(params) {
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
        }
        catch (error) {
            this.logger.error(`Failed to create PaymentIntent: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create payment');
        }
    }
    async getPaymentIntent(paymentIntentId) {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async cancelPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
            this.logger.log(`PaymentIntent cancelled: ${paymentIntentId}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Failed to cancel PaymentIntent: ${error.message}`);
            throw new common_1.BadRequestException('Failed to cancel payment');
        }
    }
    async createRefund(paymentIntentId, amount, reason) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount,
                reason,
            });
            this.logger.log(`Refund created: ${refund.id} for PaymentIntent: ${paymentIntentId}`);
            return refund;
        }
        catch (error) {
            this.logger.error(`Failed to create refund: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create refund');
        }
    }
    async createCustomer(email, name) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
            });
            this.logger.log(`Customer created: ${customer.id}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to create customer: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create customer');
        }
    }
    async createConnectAccount(params) {
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
        }
        catch (error) {
            this.logger.error(`Failed to create Connect account: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create vendor account');
        }
    }
    async createAccountLink(accountId, refreshUrl, returnUrl) {
        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: 'account_onboarding',
            });
            return accountLink;
        }
        catch (error) {
            this.logger.error(`Failed to create account link: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create onboarding link');
        }
    }
    async getConnectAccount(accountId) {
        return this.stripe.accounts.retrieve(accountId);
    }
    async createTransfer(amount, destinationAccountId, transferGroup) {
        try {
            const transfer = await this.stripe.transfers.create({
                amount,
                currency: 'eur',
                destination: destinationAccountId,
                transfer_group: transferGroup,
            });
            this.logger.log(`Transfer created: ${transfer.id} to ${destinationAccountId}`);
            return transfer;
        }
        catch (error) {
            this.logger.error(`Failed to create transfer: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create transfer');
        }
    }
    constructWebhookEvent(payload, signature) {
        if (!this.webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error.message}`);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(stripe_module_1.STRIPE_CLIENT)),
    __metadata("design:paramtypes", [stripe_1.default,
        config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map