import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles, Resource } from 'nest-keycloak-connect';

@ApiTags('wills')
@Controller('wills')
@Resource('wills')
export class WillsController {
  @Get('appointments')
  @Roles({ roles: ['admin', 'lawyer_notary'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get will appointments (admin or lawyer/notary)' })
  async getAllAppointments(@Query() _filters: Record<string, unknown>) {
    // Return empty array - no mock data
    // Appointments should be retrieved from database via Prisma
    return [];
  }

  @Get('appointments/:id')
  @Roles({ roles: ['admin', 'lawyer_notary'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get will appointment by ID (admin or lawyer/notary)' })
  async getAppointment(@Param('id') _id: string) {
    // Return empty object - no mock data
    return null;
  }

  @Get('executions')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all will executions (admin only)' })
  async getAllExecutions(@Query() _filters: Record<string, unknown>) {
    // Return empty array - no mock data
    // Executions should be retrieved from database via Prisma
    return [];
  }

  @Get('executions/:id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get will execution by ID (admin only)' })
  async getExecution(@Param('id') _id: string) {
    // Return empty object - no mock data
    return null;
  }

  @Get('data/:id')
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get will data by ID (admin only)' })
  async getWillData(@Param('id') _id: string) {
    // Return empty object - no mock data
    return null;
  }
}
