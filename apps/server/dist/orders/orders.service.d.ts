import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';
export interface OrderFilters {
    status?: OrderStatus;
    clientId?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
}
export declare class OrdersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private generateOrderNumber;
    create(clientId: string, dto: CreateOrderDto): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    findAll(filters: OrderFilters): Promise<{
        data: {
            id: any;
            orderNumber: any;
            client: any;
            items: any;
            subtotal: number;
            tax: number;
            totalPrice: number;
            currency: any;
            notes: any;
            scheduledDate: any;
            status: any;
            payment: {
                id: any;
                status: any;
                amount: number;
                currency: any;
                paidAt: any;
            };
            createdAt: any;
            updatedAt: any;
            completedAt: any;
            cancelledAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    findByOrderNumber(orderNumber: string): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    update(id: string, userId: string, userRole: Role, dto: UpdateOrderDto): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    updateStatus(id: string, userId: string, userRole: Role, dto: UpdateOrderStatusDto): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    cancel(id: string, userId: string, reason?: string): Promise<{
        id: any;
        orderNumber: any;
        client: any;
        items: any;
        subtotal: number;
        tax: number;
        totalPrice: number;
        currency: any;
        notes: any;
        scheduledDate: any;
        status: any;
        payment: {
            id: any;
            status: any;
            amount: number;
            currency: any;
            paidAt: any;
        };
        createdAt: any;
        updatedAt: any;
        completedAt: any;
        cancelledAt: any;
    }>;
    getMyOrders(clientId: string, filters: Omit<OrderFilters, 'clientId'>): Promise<{
        data: {
            id: any;
            orderNumber: any;
            client: any;
            items: any;
            subtotal: number;
            tax: number;
            totalPrice: number;
            currency: any;
            notes: any;
            scheduledDate: any;
            status: any;
            payment: {
                id: any;
                status: any;
                amount: number;
                currency: any;
                paidAt: any;
            };
            createdAt: any;
            updatedAt: any;
            completedAt: any;
            cancelledAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getVendorOrders(userId: string, filters: Omit<OrderFilters, 'vendorId'>): Promise<{
        data: {
            id: any;
            orderNumber: any;
            client: any;
            items: any;
            subtotal: number;
            tax: number;
            totalPrice: number;
            currency: any;
            notes: any;
            scheduledDate: any;
            status: any;
            payment: {
                id: any;
                status: any;
                amount: number;
                currency: any;
                paidAt: any;
            };
            createdAt: any;
            updatedAt: any;
            completedAt: any;
            cancelledAt: any;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private formatOrderResponse;
}
