import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OrderStatus, Role, ServiceStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

// Tax rate for Germany (19% VAT)
const TAX_RATE = 0.19;

// Valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export interface OrderFilters {
  status?: OrderStatus;
  clientId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `ORD-${year}-${random}`;
  }

  /**
   * Create a new order
   */
  async create(clientId: string, dto: CreateOrderDto) {
    this.logger.log(`Creating order for client ${clientId}`);

    // Validate and fetch services
    const serviceIds = dto.items.map(item => item.serviceId);
    const services = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        status: ServiceStatus.ACTIVE,
      },
      include: {
        vendor: true,
      },
    });

    // Check all services exist and are active
    if (services.length !== serviceIds.length) {
      const foundIds = services.map(s => s.id);
      const missingIds = serviceIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Services not found or inactive: ${missingIds.join(', ')}`);
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = dto.items.map(item => {
      const service = services.find(s => s.id === item.serviceId)!;
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

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        clientId,
        subtotal,
        tax,
        totalPrice,
        notes: dto.notes,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        status: OrderStatus.PENDING,
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

    // Send order confirmation email to client
    if (order.client.email && order.client.firstName) {
      try {
        await this.emailService.sendOrderConfirmation(order.client.email, {
          firstName: order.client.firstName,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          items: order.items.map(item => ({
            name: item.serviceName,
            quantity: item.quantity,
            price: `€${Number(item.totalPrice).toFixed(2)}`,
          })),
          totalPrice: `€${Number(order.totalPrice).toFixed(2)}`,
        });
      } catch (error) {
        this.logger.error(`Failed to send order confirmation email: ${(error as Error).message}`);
      }
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Get all orders with filters
   */
  async findAll(filters: OrderFilters) {
    const { status, clientId, vendorId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

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

  /**
   * Get order by ID
   */
  async findOne(id: string, userId: string, userRole: Role) {
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check access: client owns order, vendor has service in order, or admin
    if (userRole !== Role.ADMIN) {
      const isClient = order.clientId === userId;
      const isVendor =
        userRole === Role.VENDOR && order.items.some(item => item.service.vendor.userId === userId);

      if (!isClient && !isVendor) {
        throw new ForbiddenException('You do not have access to this order');
      }
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Get order by order number
   */
  async findByOrderNumber(orderNumber: string) {
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
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Update order details (notes, scheduled date)
   */
  async update(id: string, userId: string, userRole: Role, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only client or admin can update
    if (userRole !== Role.ADMIN && order.clientId !== userId) {
      throw new ForbiddenException('You do not have access to update this order');
    }

    // Cannot update completed/cancelled/refunded orders
    const finalStatuses: OrderStatus[] = [
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
      OrderStatus.REFUNDED,
    ];
    if (finalStatuses.includes(order.status)) {
      throw new BadRequestException(`Cannot update order with status ${order.status}`);
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

  /**
   * Update order status
   */
  async updateStatus(id: string, userId: string, userRole: Role, dto: UpdateOrderStatusDto) {
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check permissions
    const isClient = order.clientId === userId;
    const isVendor =
      userRole === Role.VENDOR && order.items.some(item => item.service.vendor.userId === userId);
    const isAdmin = userRole === Role.ADMIN;

    // Client can only cancel PENDING orders
    if (isClient && !isAdmin) {
      if (dto.status !== OrderStatus.CANCELLED) {
        throw new ForbiddenException('Clients can only cancel orders');
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Can only cancel orders with PENDING status');
      }
    }

    // Vendor can update their orders
    if (isVendor && !isAdmin && !isClient) {
      const allowedStatuses: OrderStatus[] = [
        OrderStatus.CONFIRMED,
        OrderStatus.IN_PROGRESS,
        OrderStatus.COMPLETED,
      ];
      if (!allowedStatuses.includes(dto.status)) {
        throw new ForbiddenException('Vendors can only confirm, progress, or complete orders');
      }
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    // Update order
    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    if (dto.status === OrderStatus.CANCELLED) {
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

    // Send email notification about status change
    if (updated.client.email && updated.client.firstName) {
      try {
        await this.emailService.sendOrderStatusUpdate(
          updated.client.email,
          updated.client.firstName,
          updated.orderNumber,
          dto.status,
          dto.reason,
        );
      } catch (error) {
        this.logger.error(`Failed to send order status email: ${(error as Error).message}`);
      }
    }

    return this.formatOrderResponse(updated);
  }

  /**
   * Cancel order (shortcut for client)
   */
  async cancel(id: string, userId: string, reason?: string) {
    return this.updateStatus(id, userId, Role.CLIENT, {
      status: OrderStatus.CANCELLED,
      reason,
    });
  }

  /**
   * Get orders for current client
   */
  async getMyOrders(clientId: string, filters: Omit<OrderFilters, 'clientId'>) {
    return this.findAll({ ...filters, clientId });
  }

  /**
   * Get orders for vendor (orders containing their services)
   */
  async getVendorOrders(userId: string, filters: Omit<OrderFilters, 'vendorId'>) {
    // First get vendor profile
    const vendorProfile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendorProfile) {
      throw new NotFoundException('Vendor profile not found');
    }

    return this.findAll({ ...filters, vendorId: vendorProfile.id });
  }

  /**
   * Format order for API response
   */
  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      client: order.client,
      items: order.items.map((item: any) => ({
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
}
