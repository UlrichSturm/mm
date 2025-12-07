import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderResponseDto, OrderListResponseDto } from './dto/order-response.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, createOrderDto: CreateOrderDto): Promise<OrderResponseDto>;
    getMyOrders(req: any, status?: OrderStatus, page?: number, limit?: number): Promise<OrderListResponseDto>;
    cancel(req: any, id: string, reason?: string): Promise<OrderResponseDto>;
    getVendorOrders(req: any, status?: OrderStatus, page?: number, limit?: number): Promise<OrderListResponseDto>;
    updateStatus(req: any, id: string, updateStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto>;
    findAll(status?: OrderStatus, clientId?: string, vendorId?: string, page?: number, limit?: number): Promise<OrderListResponseDto>;
    findOne(req: any, id: string): Promise<OrderResponseDto>;
    findByOrderNumber(orderNumber: string): Promise<OrderResponseDto>;
    update(req: any, id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto>;
    private getRoleFromKeycloakRoles;
}
