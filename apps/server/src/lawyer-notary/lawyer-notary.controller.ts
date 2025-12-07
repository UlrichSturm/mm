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
import { LawyerNotaryService, LawyerNotaryStatus } from './lawyer-notary.service';
import { Role } from '../common/enums/role.enum';

@ApiTags('lawyers-notaries')
@Controller('lawyer-notary')
@Resource('lawyer-notary')
export class LawyerNotaryController {
  constructor(private readonly lawyerNotaryService: LawyerNotaryService) {}

  @Post()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create lawyer/notary profile (admin only)' })
  async create(@Body() data: any) {
    // Admin creates lawyer/notary profile
    return this.lawyerNotaryService.create(data.userId, data);
  }

  @Get()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all lawyers/notaries (admin only)' })
  @ApiQuery({ name: 'status', enum: LawyerNotaryStatus, required: false })
  async findAll(@Query('status') status?: LawyerNotaryStatus) {
    return this.lawyerNotaryService.findAll(status);
  }

  @Get('available')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get available lawyers by postal code (public)' })
  @ApiQuery({ name: 'postalCode', required: true })
  async getAvailableLawyers(@Query('postalCode') postalCode: string) {
    return this.lawyerNotaryService.getAvailableLawyers(postalCode || '');
  }

  @Get('me')
  @Roles({ roles: ['lawyer_notary', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my lawyer/notary profile' })
  async getMyProfile(@Request() req: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get(':id')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Get lawyer/notary by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.lawyerNotaryService.findOne(id);
  }

  @Get('me/settings')
  @Roles({ roles: ['lawyer_notary', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my lawyer/notary settings' })
  async getMySettings(@Request() req: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return {
      officePostalCode: profile.postalCode || '',
      officeAddress: profile.address || '',
      officeRadius: profile.maxTravelRadius || 10,
      homeVisitEnabled: profile.homeVisitAvailable || false,
      homeVisitPostalCode: profile.postalCode || '',
      homeVisitRadius: profile.maxTravelRadius || 10,
    };
  }

  @Patch('me/settings')
  @Roles({ roles: ['lawyer_notary', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my lawyer/notary settings' })
  async updateMySettings(@Request() req: any, @Body() data: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.lawyerNotaryService.updateProfile(profile.id, req.user.sub, userRole, {
      postalCode: data.officePostalCode || data.homeVisitPostalCode,
      address: data.officeAddress,
      maxTravelRadius: data.officeRadius || data.homeVisitRadius,
      homeVisitAvailable: data.homeVisitEnabled || false,
    });
  }

  @Patch('me')
  @Roles({ roles: ['lawyer_notary', 'admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my lawyer/notary profile' })
  async updateMyProfile(@Request() req: any, @Body() data: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.sub);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.lawyerNotaryService.updateProfile(profile.id, req.user.sub, userRole, data);
  }

  @Patch(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lawyer/notary profile (admin only)' })
  async updateProfile(@Param('id') id: string, @Body() data: any) {
    // Admin can update any profile
    const profile = await this.lawyerNotaryService.findOne(id);
    return this.lawyerNotaryService.updateProfile(id, profile.userId, Role.ADMIN, data);
  }

  @Patch(':id/status')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update lawyer/notary status (admin only)' })
  @ApiParam({ name: 'id', description: 'Lawyer/Notary ID' })
  async updateStatus(@Param('id') id: string, @Body('status') status: LawyerNotaryStatus) {
    return this.lawyerNotaryService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete lawyer/notary profile (admin only)' })
  async delete(@Param('id') id: string) {
    await this.lawyerNotaryService.delete(id);
    return { message: 'Profile deleted successfully' };
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
