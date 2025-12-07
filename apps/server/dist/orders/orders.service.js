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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const TAX_RATE = 0.19;
const STATUS_TRANSITIONS = {
    [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.CANCELLED],
    [client_1.OrderStatus.CONFIRMED]: [client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.CANCELLED],
    [client_1.OrderStatus.IN_PROGRESS]: [client_1.OrderStatus.COMPLETED, client_1.OrderStatus.CANCELLED],
    [client_1.OrderStatus.COMPLETED]: [client_1.OrderStatus.REFUNDED],
    [client_1.OrderStatus.CANCELLED]: [],
    [client_1.OrderStatus.REFUNDED]: [],
};
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    generateOrderNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0');
        return `ORD-${year}-${random}`;
    }
    async create(clientId, dto) {
        this.logger.log(`Creating order for client ${clientId}`);
        const serviceIds = dto.items.map(item => item.serviceId);
        const services = await this.prisma.service.findMany({
            where: {
                id: { in: serviceIds },
                status: client_1.ServiceStatus.ACTIVE,
            },
            include: {
                vendor: true,
            },
        });
        if (services.length !== serviceIds.length) {
            const foundIds = services.map(s => s.id);
            const missingIds = serviceIds.filter(id => !foundIds.includes(id));
            throw new common_1.BadRequestException(`Services not found or inactive: ${missingIds.join(', ')}`);
        }
        let subtotal = new library_1.Decimal(0);
        const orderItems = dto.items.map(item => {
            const service = services.find(s => s.id === item.serviceId);
            const unitPrice = service.price;
            const totalPrice = unitPrice.mul(item.quantity);
            subtotal = subtotal.add(totalPrice);
            return {
                serviceId: item.serviceId,
                serviceName: service.name,
                servicePrice: service.price,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                notes: item.notes,
            };
        });
        const tax = subtotal.mul(TAX_RATE);
        const totalPrice = subtotal.add(tax);
        const order = await this.prisma.order.create({
            data: {
                orderNumber: this.generateOrderNumber(),
                clientId,
                subtotal,
                tax,
                totalPrice,
                notes: dto.notes,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
                status: client_1.OrderStatus.PENDING,
                items: {
                    create: orderItems,
                },
            },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
                payment: true,
            },
        });
        this.logger.log(`Order ${order.orderNumber} created successfully`);
        return this.formatOrderResponse(order);
    }
    async findAll(filters) {
        const { status, clientId, vendorId, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (clientId) {
            where.clientId = clientId;
        }
        if (vendorId) {
            where.items = {
                some: {
                    service: {
                        vendorId: vendorId,
                    },
                },
            };
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    items: {
                        include: {
                            service: {
                                include: {
                                    vendor: true,
                                },
                            },
                        },
                    },
                    payment: true,
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders.map(order => this.formatOrderResponse(order)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
                payment: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (userRole !== client_1.Role.ADMIN) {
            const isClient = order.clientId === userId;
            const isVendor = userRole === client_1.Role.VENDOR && order.items.some(item => item.service.vendor.userId === userId);
            if (!isClient && !isVendor) {
                throw new common_1.ForbiddenException('You do not have access to this order');
            }
        }
        return this.formatOrderResponse(order);
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
                payment: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderNumber} not found`);
        }
        return this.formatOrderResponse(order);
    }
    async update(id, userId, userRole, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (userRole !== client_1.Role.ADMIN && order.clientId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to update this order');
        }
        const finalStatuses = [
            client_1.OrderStatus.COMPLETED,
            client_1.OrderStatus.CANCELLED,
            client_1.OrderStatus.REFUNDED,
        ];
        if (finalStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Cannot update order with status ${order.status}`);
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                notes: dto.notes,
                scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
                payment: true,
            },
        });
        return this.formatOrderResponse(updated);
    }
    async updateStatus(id, userId, userRole, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const isClient = order.clientId === userId;
        const isVendor = userRole === client_1.Role.VENDOR && order.items.some(item => item.service.vendor.userId === userId);
        const isAdmin = userRole === client_1.Role.ADMIN;
        if (isClient && !isAdmin) {
            if (dto.status !== client_1.OrderStatus.CANCELLED) {
                throw new common_1.ForbiddenException('Clients can only cancel orders');
            }
            if (order.status !== client_1.OrderStatus.PENDING) {
                throw new common_1.BadRequestException('Can only cancel orders with PENDING status');
            }
        }
        if (isVendor && !isAdmin && !isClient) {
            const allowedStatuses = [
                client_1.OrderStatus.CONFIRMED,
                client_1.OrderStatus.IN_PROGRESS,
                client_1.OrderStatus.COMPLETED,
            ];
            if (!allowedStatuses.includes(dto.status)) {
                throw new common_1.ForbiddenException('Vendors can only confirm, progress, or complete orders');
            }
        }
        const allowedTransitions = STATUS_TRANSITIONS[order.status];
        if (!allowedTransitions.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
        }
        const updateData = {
            status: dto.status,
        };
        if (dto.status === client_1.OrderStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        if (dto.status === client_1.OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                client: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        service: {
                            include: {
                                vendor: true,
                            },
                        },
                    },
                },
                payment: true,
            },
        });
        this.logger.log(`Order ${order.orderNumber} status changed: ${order.status} → ${dto.status}`);
        return this.formatOrderResponse(updated);
    }
    async cancel(id, userId, reason) {
        return this.updateStatus(id, userId, client_1.Role.CLIENT, {
            status: client_1.OrderStatus.CANCELLED,
            reason,
        });
    }
    async getMyOrders(clientId, filters) {
        return this.findAll({ ...filters, clientId });
    }
    async getVendorOrders(userId, filters) {
        const vendorProfile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
        });
        if (!vendorProfile) {
            throw new common_1.NotFoundException('Vendor profile not found');
        }
        return this.findAll({ ...filters, vendorId: vendorProfile.id });
    }
    formatOrderResponse(order) {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            client: order.client,
            items: order.items.map((item) => ({
                id: item.id,
                serviceId: item.serviceId,
                serviceName: item.serviceName,
                servicePrice: Number(item.servicePrice),
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                totalPrice: Number(item.totalPrice),
                notes: item.notes,
                vendor: item.service?.vendor
                    ? {
                        id: item.service.vendor.id,
                        businessName: item.service.vendor.businessName,
                        contactEmail: item.service.vendor.contactEmail,
                        contactPhone: item.service.vendor.contactPhone,
                    }
                    : null,
            })),
            subtotal: Number(order.subtotal),
            tax: Number(order.tax),
            totalPrice: Number(order.totalPrice),
            currency: order.currency,
            notes: order.notes,
            scheduledDate: order.scheduledDate,
            status: order.status,
            payment: order.payment
                ? {
                    id: order.payment.id,
                    status: order.payment.status,
                    amount: Number(order.payment.amount),
                    currency: order.payment.currency,
                    paidAt: order.payment.paidAt,
                }
                : null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            completedAt: order.completedAt,
            cancelledAt: order.cancelledAt,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map