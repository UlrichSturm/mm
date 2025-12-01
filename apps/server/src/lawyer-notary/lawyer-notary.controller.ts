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
import { LawyerNotaryService, LawyerNotaryStatus } from './lawyer-notary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('lawyer-notary')
export class LawyerNotaryController {
  constructor(private readonly lawyerNotaryService: LawyerNotaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() data: any) {
    // Admin creates lawyer/notary profile
    return this.lawyerNotaryService.create(data.userId, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query('status') status?: LawyerNotaryStatus) {
    return this.lawyerNotaryService.findAll(status);
  }

  @Get('available')
  async getAvailableLawyers(@Query('postalCode') postalCode: string) {
    // Public endpoint - no auth required
    return this.lawyerNotaryService.getAvailableLawyers(postalCode || '');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LAWYER_NOTARY, Role.ADMIN)
  async getMyProfile(@Request() req: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lawyerNotaryService.findOne(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LAWYER_NOTARY, Role.ADMIN)
  async updateMyProfile(@Request() req: any, @Body() data: any) {
    const profile = await this.lawyerNotaryService.findByUserId(req.user.id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.lawyerNotaryService.updateProfile(
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
    const profile = await this.lawyerNotaryService.findOne(id);
    return this.lawyerNotaryService.updateProfile(
      id,
      profile.userId,
      Role.ADMIN,
      data,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: LawyerNotaryStatus) {
    return this.lawyerNotaryService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.lawyerNotaryService.delete(id);
    return { message: 'Profile deleted successfully' };
  }
}

