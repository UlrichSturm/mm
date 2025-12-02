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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const payments_service_1 = require("./payments.service");
const role_enum_1 = require("../common/enums/role.enum");
const stripe_service_1 = require("../stripe/stripe.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const payment_response_dto_1 = require("./dto/payment-response.dto");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, stripeService) {
        this.paymentsService = paymentsService;
        this.stripeService = stripeService;
    }
    async createPaymentIntent(req, dto) {
        return this.paymentsService.createPaymentIntent(req.user.sub, dto);
    }
    async getMyPayments(req, status, page, limit) {
        return this.paymentsService.getMyPayments(req.user.sub, {
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    async handleWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody) {
            return { received: false, error: 'No raw body' };
        }
        try {
            const event = this.stripeService.constructWebhookEvent(rawBody, signature);
            await this.paymentsService.handleWebhook(event);
            return { received: true };
        }
        catch (error) {
            return { received: false, error: error.message };
        }
    }
    async findAll(status, clientId, page, limit) {
        return this.paymentsService.findAll({
            status,
            clientId,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    async createRefund(req, id) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.paymentsService.createRefund(id, req.user.sub, userRole);
    }
    async findOne(req, id) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.paymentsService.findOne(id, req.user.sub, userRole);
    }
    getRoleFromKeycloakRoles(roles) {
        if (roles?.includes('admin')) {
            return role_enum_1.Role.ADMIN;
        }
        if (roles?.includes('vendor')) {
            return role_enum_1.Role.VENDOR;
        }
        if (roles?.includes('lawyer_notary')) {
            return role_enum_1.Role.LAWYER_NOTARY;
        }
        return role_enum_1.Role.CLIENT;
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('intent'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['client'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment intent for an order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Payment intent created successfully',
        type: payment_response_dto_1.PaymentIntentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid order or already paid' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_payment_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['client'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current client payments' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.PaymentStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of client payments',
        type: payment_response_dto_1.PaymentListResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMyPayments", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, nest_keycloak_connect_1.Unprotected)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.PaymentStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of all payments',
        type: payment_response_dto_1.PaymentListResponseDto,
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate refund for a payment (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Refund initiated',
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Cannot refund this payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Payment not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createRefund", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Payment ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Payment details',
        type: payment_response_dto_1.PaymentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Payment not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    (0, nest_keycloak_connect_1.Resource)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        stripe_service_1.StripeService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map