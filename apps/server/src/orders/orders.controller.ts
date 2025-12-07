import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Roles, Resource, Public } from 'nest-keycloak-connect';
import { OrdersService, OrderFilters } from './orders.service';
import { Role } from '../common/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderResponseDto, OrderListResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@Resource('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============================================
  // CLIENT ENDPOINTS
  // ============================================

  @Post()
  @Roles({ roles: ['client'] })
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async create(
    @Request() req: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @Get('my')
  @Roles({ roles: ['client'] })
  @ApiOperation({ summary: 'Get current client orders' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of client orders',
    type: OrderListResponseDto,
  })
  async getMyOrders(
    @Request() req: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.getMyOrders(req.user.sub, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles({ roles: ['client'] })
  @ApiOperation({ summary: 'Cancel an order (client only, PENDING status)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot cancel this order' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async cancel(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancel(id, req.user.sub, reason);
  }

  // ============================================
  // VENDOR ENDPOINTS
  // ============================================

  @Get('vendor')
  @Roles({ roles: ['vendor', 'admin'] })
  @ApiOperation({ summary: 'Get orders for vendor services' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of vendor orders',
    type: OrderListResponseDto,
  })
  async getVendorOrders(
    @Request() req: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<OrderListResponseDto> {
    return this.ordersService.getVendorOrders(req.user.sub, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles({ roles: ['vendor', 'admin'] })
  @ApiOperation({ summary: 'Update order status (vendor/admin)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status transition' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.ordersService.updateStatus(id, req.user.sub, userRole, updateStatusDto);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get()
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'clientId', type: String, required: false })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all orders',
    type: OrderListResponseDto,
  })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('clientId') clientId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<OrderListResponseDto> {
    const filters: OrderFilters = {
      status,
      clientId,
      vendorId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };
    return this.ordersService.findAll(filters);
  }

  // ============================================
  // COMMON ENDPOINTS
  // ============================================

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async findOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.ordersService.findOne(id, req.user.sub, userRole);
  }

  @Get('number/:orderNumber')
  @Public()
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number (e.g., ORD-2025-001234)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<OrderResponseDto> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order details (notes, scheduled date)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot update this order' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.ordersService.update(id, req.user.sub, userRole, updateOrderDto);
  }

  /**
   * Helper to convert Keycloak roles to our Role enum
   */
  private getRoleFromKeycloakRoles(roles: string[]): Role {
    if (roles?.includes('admin')) {return Role.ADMIN;}
    if (roles?.includes('vendor')) {return Role.VENDOR;}
    if (roles?.includes('lawyer_notary')) {return Role.LAWYER_NOTARY;}
    return Role.CLIENT;
  }
}
