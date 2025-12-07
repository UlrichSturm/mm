import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public, Unprotected } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is up and running' })
  getHealth(): { status: string; version: string; env: string } {
    return {
      status: 'ok',
      version: this.configService.get('APP_VERSION', '1.0.0'),
      env: this.configService.get('NODE_ENV', 'development'),
    };
  }

  @Get('ready')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Readiness probe: checks database connection' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is ready' })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Service is not ready' })
  async getReadiness(): Promise<{ database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'Connected' };
    } catch (error) {
      this.logger.error('Database connection failed', (error as Error).stack);
      throw new Error('Database connection failed');
    }
  }

  @Get('live')
  @Public()
  @Unprotected()
  @ApiOperation({ summary: 'Liveness probe: checks if the application is alive' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is alive' })
  getLiveness(): { status: string } {
    return { status: 'ok' };
  }
}
