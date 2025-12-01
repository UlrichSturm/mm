import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { VendorsService, VendorStatus } from './vendors.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    // Admin creates vendor profile
    return this.vendorsService.create(data.userId, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query('status') status?: VendorStatus) {
    return this.vendorsService.findAll(status);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  async getMyProfile(@Request() req: any) {
    const profile = await this.vendorsService.findByUserId(req.user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR, Role.ADMIN)
  async updateMyProfile(@Request() req: any, @Body() data: any) {
    const profile = await this.vendorsService.findByUserId(req.user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.vendorsService.updateProfile(
      profile.id,
      req.user.id,
      req.user.role,
      data,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateProfile(@Param('id') id: string, @Body() data: any) {
    // Admin can update any profile
    const profile = await this.vendorsService.findOne(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.vendorsService.updateProfile(
      id,
      profile.userId,
      Role.ADMIN,
      data,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: VendorStatus) {
    return this.vendorsService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.vendorsService.delete(id);
    return { message: 'Vendor deleted successfully' };
  }
}

