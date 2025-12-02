import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminStatsResponseDto } from './dto/stats-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
