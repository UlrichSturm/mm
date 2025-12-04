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
var ServicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
let ServicesService = ServicesService_1 = class ServicesService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ServicesService_1.name);
    }
    async create(userId, dto) {
        this.logger.log(`Creating service for user ${userId}`);
        const vendorProfile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
        });
        if (!vendorProfile) {
            throw new common_1.ForbiddenException('Only vendors can create services');
        }
        if (vendorProfile.status !== client_1.VendorStatus.APPROVED) {
            throw new common_1.ForbiddenException('Your vendor account must be approved before creating services');
        }
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.BadRequestException(`Category ${dto.categoryId} not found`);
        }
        if (!category.isActive) {
            throw new common_1.BadRequestException(`Category ${dto.categoryId} is not active`);
        }
        const service = await this.prisma.service.create({
            data: {
                vendorId: vendorProfile.id,
                name: dto.name,
                description: dto.description,
                price: new library_1.Decimal(dto.price),
                categoryId: dto.categoryId,
                duration: dto.duration,
                images: dto.images || [],
                status: client_1.ServiceStatus.ACTIVE,
            },
            include: {
                vendor: true,
                category: true,
            },
        });
        this.logger.log(`Service ${service.id} created successfully`);
        return this.formatServiceResponse(service);
    }
    async findAll(filters) {
        const { search, categoryId, vendorId, status, minPrice, maxPrice, page = 1, limit = 10, sortBy = 'createdAt_desc', } = filters;
        if (search && search.trim().length > 0) {
            if (search.trim().length < 2) {
                throw new common_1.BadRequestException('Search query must be at least 2 characters');
            }
        }
        const maxLimit = 10;
        const actualLimit = Math.min(limit, maxLimit);
        const skip = (page - 1) * actualLimit;
        const where = {
            status: status || client_1.ServiceStatus.ACTIVE,
            vendor: {
                status: client_1.VendorStatus.APPROVED,
            },
        };
        if (search && search.trim().length >= 2) {
            where.OR = [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { description: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (vendorId) {
            where.vendorId = vendorId;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        const orderBy = this.parseSortBy(sortBy);
        const [services, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                skip,
                take: actualLimit,
                orderBy,
                include: {
                    vendor: true,
                    category: true,
                },
            }),
            this.prisma.service.count({ where }),
        ]);
        return {
            data: services.map(service => this.formatServiceResponse(service, false)),
            meta: {
                page,
                limit: actualLimit,
                total,
                totalPages: Math.ceil(total / actualLimit),
                searchQuery: search && search.trim().length >= 2 ? search.trim() : null,
            },
        };
    }
    async findOne(id, userId) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                vendor: {
                    include: {
                        user: true,
                    },
                },
                category: true,
            },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service ${id} not found`);
        }
        const isOwner = userId && service.vendor.userId === userId;
        if (!isOwner) {
            if (service.status !== client_1.ServiceStatus.ACTIVE) {
                throw new common_1.NotFoundException(`Service ${id} not found`);
            }
            if (service.vendor.status !== client_1.VendorStatus.APPROVED) {
                throw new common_1.NotFoundException(`Service ${id} not found`);
            }
        }
        return this.formatServiceResponse(service, isOwner);
    }
    async getMyServices(userId, filters) {
        const vendorProfile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
        });
        if (!vendorProfile) {
            throw new common_1.NotFoundException('Vendor profile not found');
        }
        const { page = 1, limit = 10, ...restFilters } = filters;
        const skip = (page - 1) * limit;
        const where = {
            vendorId: vendorProfile.id,
        };
        if (restFilters.status) {
            where.status = restFilters.status;
        }
        if (restFilters.categoryId) {
            where.categoryId = restFilters.categoryId;
        }
        if (restFilters.search) {
            where.OR = [
                { name: { contains: restFilters.search, mode: 'insensitive' } },
                { description: { contains: restFilters.search, mode: 'insensitive' } },
            ];
        }
        const [services, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: true,
                    category: true,
                },
            }),
            this.prisma.service.count({ where }),
        ]);
        return {
            data: services.map(service => this.formatServiceResponse(service, true)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, userId, userRole, dto) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                vendor: true,
            },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service ${id} not found`);
        }
        if (userRole !== client_1.Role.ADMIN && service.vendor.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this service');
        }
        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.BadRequestException(`Category ${dto.categoryId} not found`);
            }
            if (!category.isActive) {
                throw new common_1.BadRequestException(`Category ${dto.categoryId} is not active`);
            }
        }
        const updated = await this.prisma.service.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price !== undefined ? new library_1.Decimal(dto.price) : undefined,
                categoryId: dto.categoryId,
                duration: dto.duration,
                images: dto.images,
                status: dto.status,
            },
            include: {
                vendor: true,
                category: true,
            },
        });
        this.logger.log(`Service ${id} updated`);
        return this.formatServiceResponse(updated);
    }
    async delete(id, userId, userRole) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                vendor: true,
                orderItems: {
                    include: {
                        order: true,
                    },
                },
            },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service ${id} not found`);
        }
        if (userRole !== client_1.Role.ADMIN && service.vendor.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this service');
        }
        const activeOrderStatuses = [
            client_1.OrderStatus.PENDING,
            client_1.OrderStatus.CONFIRMED,
            client_1.OrderStatus.IN_PROGRESS,
            client_1.OrderStatus.REFUNDED,
        ];
        const activeOrders = service.orderItems.filter(item => activeOrderStatuses.includes(item.order.status));
        if (userRole !== client_1.Role.ADMIN && activeOrders.length > 0) {
            throw new common_1.BadRequestException('Cannot delete service with active orders');
        }
        if (userRole === client_1.Role.ADMIN && activeOrders.length > 0) {
            const orderIds = [...new Set(activeOrders.map(item => item.orderId))];
            await this.prisma.order.updateMany({
                where: {
                    id: { in: orderIds },
                    status: { in: activeOrderStatuses },
                },
                data: {
                    status: client_1.OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                },
            });
            this.logger.warn(`Admin deleted service ${id} with ${activeOrders.length} active orders (cascade delete)`);
        }
        await this.prisma.service.update({
            where: { id },
            data: {
                status: client_1.ServiceStatus.DELETED,
            },
        });
        this.logger.log(`Service ${id} deleted (soft)`);
        return { message: 'Service deleted successfully' };
    }
    async updateStatus(id, status) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            include: {
                vendor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service ${id} not found`);
        }
        const updated = await this.prisma.service.update({
            where: { id },
            data: { status },
            include: {
                vendor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        this.logger.log(`Service ${id} status changed to ${status}`);
        if (updated.vendor.user.email && updated.vendor.user.firstName) {
            try {
                const statusMessages = {
                    [client_1.ServiceStatus.ACTIVE]: 'Your service has been approved and is now active.',
                    [client_1.ServiceStatus.INACTIVE]: 'Your service has been deactivated.',
                    [client_1.ServiceStatus.PENDING_REVIEW]: 'Your service is pending review.',
                    [client_1.ServiceStatus.DELETED]: 'Your service has been deleted.',
                };
                await this.emailService.sendEmail({
                    to: updated.vendor.user.email,
                    subject: `Service ${updated.name} - Status Update`,
                    template: 'order-status',
                    context: {
                        firstName: updated.vendor.user.firstName,
                        orderNumber: updated.name,
                        status: status,
                        message: statusMessages[status] || 'Your service status has been updated.',
                    },
                });
            }
            catch (error) {
                this.logger.error(`Failed to send service status email: ${error.message}`);
            }
        }
        return this.formatServiceResponse(updated);
    }
    formatServiceResponse(service, isOwner = false) {
        const vendorInfo = {
            id: service.vendor.id,
            businessName: service.vendor.businessName,
            rating: service.vendor.rating,
            reviewCount: service.vendor.reviewCount,
        };
        if (isOwner || !isOwner) {
            vendorInfo.contactPhone = service.vendor.contactPhone;
            vendorInfo.address = service.vendor.address;
            vendorInfo.description = service.vendor.description;
            vendorInfo.contactEmail = service.vendor.contactEmail;
        }
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: Number(service.price),
            currency: service.currency,
            duration: service.duration,
            images: service.images,
            status: service.status,
            vendor: service.vendor ? vendorInfo : null,
            category: service.category
                ? {
                    id: service.category.id,
                    name: service.category.name,
                    slug: service.category.slug,
                    description: service.category.description,
                }
                : null,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
        };
    }
    parseSortBy(sortBy) {
        const [field, direction] = sortBy.split('_');
        const order = direction === 'asc' ? 'asc' : 'desc';
        switch (field) {
            case 'price':
                return { price: order };
            case 'name':
                return { name: order };
            case 'rating':
                return { vendor: { rating: order } };
            case 'createdAt':
            default:
                return { createdAt: order };
        }
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = ServicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], ServicesService);
//# sourceMappingURL=services.service.js.map