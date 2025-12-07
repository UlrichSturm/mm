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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles, Resource, Public, Unprotected } from 'nest-keycloak-connect';
import { VendorsService, VendorStatus } from './vendors.service';
import { Role } from '../common/enums/role.enum';

@ApiTags('vendors')
@Controller('vendors')
@Resource('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create vendor profile (admin only). User will be created in Keycloak with UUID.' })
  async create(@Body() data: any) {
    // Admin creates vendor profile - user will be created in Keycloak automatically
    return this.vendorsService.create(data);
  }

  @Get()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all vendors (admin only)' })
  @ApiQuery({ name: 'status', enum: VendorStatus, required: false })
  async findAll(@Query('status') status?: VendorStatus) {
    return this.vendorsService.findAll(status);
  }

  @Get('me')
  @Roles({ roles: ['vendor', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my vendor profile' })
  async getMyProfile(@Request() req: any) {
    const profile = await this.vendorsService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get(':id')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get vendor by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch('me')
  @Roles({ roles: ['vendor', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my vendor profile' })
  async updateMyProfile(@Request() req: any, @Body() data: any) {
    const profile = await this.vendorsService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.vendorsService.updateProfile(profile.id, req.user.sub, userRole, data);
  }

  @Patch(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vendor profile (admin only)' })
  async updateProfile(@Param('id') id: string, @Body() data: any) {
    // Admin can update any profile
    const profile = await this.vendorsService.findOne(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.vendorsService.updateProfile(id, profile.userId, Role.ADMIN, data);
  }

  @Patch(':id/status')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vendor status (admin only)' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async updateStatus(@Param('id') id: string, @Body('status') status: VendorStatus) {
    return this.vendorsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete vendor (admin only)' })
  async delete(@Param('id') id: string) {
    await this.vendorsService.delete(id);
    return { message: 'Vendor deleted successfully' };
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
