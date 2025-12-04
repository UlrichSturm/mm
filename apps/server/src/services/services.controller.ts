import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ServiceStatus } from '@prisma/client';
import { Roles, Resource, Public, Unprotected } from 'nest-keycloak-connect';
import { ServicesService, ServiceFilters } from './services.service';
import { Role } from '../common/enums/role.enum';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto, ServiceListResponseDto } from './dto/service-response.dto';

@ApiTags('services')
@Controller('services')
@Resource('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get()
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get all services (public)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or description (min 2 characters)',
  })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor' })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10, maximum: 10 })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by: createdAt_desc, createdAt_asc, price_asc, price_desc, name_asc, name_desc, rating_asc, rating_desc',
    example: 'createdAt_desc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of services',
    type: ServiceListResponseDto,
  })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
  ): Promise<ServiceListResponseDto> {
    const filters: ServiceFilters = {
      search,
      categoryId,
      vendorId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || 'createdAt_desc',
    };
    return this.servicesService.findAll(filters);
  }

  @Get(':id')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get service by ID (public)' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service details',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  async findOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ServiceResponseDto> {
    // Pass userId if authenticated to allow owner to see their own services
    const userId = req.user?.sub;
    return this.servicesService.findOne(id, userId);
  }

  // ============================================
  // VENDOR ENDPOINTS
  // ============================================

  @Post()
  @Roles({ roles: ['vendor'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new service (vendor only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized or not approved' })
  async create(
    @Request() req: any,
    @Body() createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.create(req.user.sub, createServiceDto);
  }

  @Get('vendor/my')
  @Roles({ roles: ['vendor'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my services (vendor only)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'status', enum: ServiceStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of vendor services',
    type: ServiceListResponseDto,
  })
  async getMyServices(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ServiceStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ServiceListResponseDto> {
    return this.servicesService.getMyServices(req.user.sub, {
      search,
      categoryId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update service (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.servicesService.update(id, req.user.sub, userRole, updateServiceDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service (owner or admin)' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.servicesService.delete(id, req.user.sub, userRole);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Patch(':id/status')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update service status (admin only)' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service status updated',
    type: ServiceResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ServiceStatus,
  ): Promise<ServiceResponseDto> {
    return this.servicesService.updateStatus(id, status);
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
