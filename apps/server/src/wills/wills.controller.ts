import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('wills')
export class WillsController {
  @Get('appointments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllAppointments(@Query() filters: any) {
    // Return empty array - no mock data
    // Appointments should be retrieved from database via Prisma
    return [];
  }

  @Get('appointments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAppointment(@Param('id') id: string) {
    // Return empty object - no mock data
    return null;
  }

  @Get('executions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllExecutions(@Query() filters: any) {
    // Return empty array - no mock data
    // Executions should be retrieved from database via Prisma
    return [];
  }

  @Get('executions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getExecution(@Param('id') id: string) {
    // Return empty object - no mock data
    return null;
  }

  @Get('data/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getWillData(@Param('id') id: string) {
    // Return empty object - no mock data
    return null;
  }
}

