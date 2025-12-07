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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const orders_service_1 = require("./orders.service");
const role_enum_1 = require("../common/enums/role.enum");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const order_response_dto_1 = require("./dto/order-response.dto");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async create(req, createOrderDto) {
        return this.ordersService.create(req.user.sub, createOrderDto);
    }
    async getMyOrders(req, status, page, limit) {
        return this.ordersService.getMyOrders(req.user.sub, {
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    async cancel(req, id, reason) {
        return this.ordersService.cancel(id, req.user.sub, reason);
    }
    async getVendorOrders(req, status, page, limit) {
        return this.ordersService.getVendorOrders(req.user.sub, {
            status,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }
    async updateStatus(req, id, updateStatusDto) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.ordersService.updateStatus(id, req.user.sub, userRole, updateStatusDto);
    }
    async findAll(status, clientId, vendorId, page, limit) {
        const filters = {
            status,
            clientId,
            vendorId,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        };
        return this.ordersService.findAll(filters);
    }
    async findOne(req, id) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.ordersService.findOne(id, req.user.sub, userRole);
    }
    async findByOrderNumber(orderNumber) {
        return this.ordersService.findByOrderNumber(orderNumber);
    }
    async update(req, id, updateOrderDto) {
        const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
        return this.ordersService.update(id, req.user.sub, userRole, updateOrderDto);
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
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['client'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Order created successfully',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['client'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Get current client orders' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.OrderStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of client orders',
        type: order_response_dto_1.OrderListResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getMyOrders", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['client'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an order (client only, PENDING status)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Order cancelled successfully',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Cannot cancel this order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('vendor'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor', 'admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders for vendor services' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.OrderStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of vendor orders',
        type: order_response_dto_1.OrderListResponseDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getVendorOrders", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['vendor', 'admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status (vendor/admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Order status updated successfully',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid status transition' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_order_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['admin'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.OrderStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'clientId', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'vendorId', type: String, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of all orders',
        type: order_response_dto_1.OrderListResponseDto,
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('clientId')),
    __param(2, (0, common_1.Query)('vendorId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Order details',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('number/:orderNumber'),
    (0, nest_keycloak_connect_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by order number' }),
    (0, swagger_1.ApiParam)({ name: 'orderNumber', description: 'Order number (e.g., ORD-2025-001234)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Order details',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    __param(0, (0, common_1.Param)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findByOrderNumber", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update order details (notes, scheduled date)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Order ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Order updated successfully',
        type: order_response_dto_1.OrderResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Cannot update this order' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Order not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Not authorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('orders'),
    (0, nest_keycloak_connect_1.Resource)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map