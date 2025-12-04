import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  HttpStatus,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles, Resource } from 'nest-keycloak-connect';
import { AdminService } from './admin.service';
import { AdminStatsResponseDto } from './dto/stats-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VendorsService, VendorStatus } from '../vendors/vendors.service';
import { ServicesService } from '../services/services.service';
import { ServiceStatus } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@Resource('admin')
@Roles({ roles: ['admin'] })
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly vendorsService: VendorsService,
    private readonly servicesService: ServicesService,
  ) {}

  // ============================================
  // STATISTICS
  // ============================================

  @Get('stats')
  @ApiOperation({
    summary: 'Get platform statistics (admin only)',
    description: `
Returns comprehensive platform statistics including:
- User counts by role
- Vendor and service statistics by status
- Order and payment statistics
- Financial metrics (revenue, fees, payouts)
- Recent activity (last 7 days)
- Top performing categories
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Platform statistics',
    type: AdminStatsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized (admin only)',
  })
  async getStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats();
  }

  // ============================================
  // VENDOR MODERATION
  // ============================================

  @Get('vendors')
  @ApiOperation({ summary: 'Get vendors for moderation (admin only)' })
  @ApiQuery({ name: 'status', enum: VendorStatus, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of vendors for moderation',
  })
  async getVendorsForModeration(@Query('status') status?: VendorStatus) {
    return this.vendorsService.findAll(status);
  }

  @Patch('vendors/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update vendor status (admin only)' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vendor status updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vendor not found',
  })
  async updateVendorStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: VendorStatus,
  ) {
    return this.vendorsService.updateStatus(id, status);
  }

  // ============================================
  // SERVICE MODERATION
  // ============================================

  @Get('services')
  @ApiOperation({ summary: 'Get services for moderation (admin only)' })
  @ApiQuery({ name: 'status', enum: ServiceStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of services for moderation',
  })
  async getServicesForModeration(
    @Query('status') status?: ServiceStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getServicesForModeration(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Patch('services/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update service status (admin only)' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service status updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async updateServiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ServiceStatus,
  ) {
    return this.servicesService.updateStatus(id, status);
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'role', enum: ['CLIENT', 'VENDOR', 'LAWYER_NOTARY', 'ADMIN'], required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
  })
  async getUsers(
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(
      role as any,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  @Patch('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('users/:id/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block or unblock user (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User block status updated',
  })
  async toggleUserBlock(@Param('id', ParseUUIDPipe) id: string, @Body('isBlocked') isBlocked: boolean) {
    return this.adminService.updateUser(id, { isBlocked });
  }

  // ============================================
  // LOGS
  // ============================================

  @Get('logs')
  @ApiOperation({ summary: 'Get application logs (admin only)' })
  @ApiQuery({ name: 'level', required: false, description: 'Log level: error, warn, log, debug' })
  @ApiQuery({ name: 'module', required: false, description: 'Module name' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 50 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application logs',
  })
  async getLogs(
    @Query('level') level?: string,
    @Query('module') module?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getLogs(
      level,
      module,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }
}
