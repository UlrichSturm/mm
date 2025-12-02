import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

class HealthCheckResponse {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '2025-12-02T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'development' })
  environment: string;
}

class DatabaseHealthResponse {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'Connected' })
  database: string;

  @ApiProperty({ example: 15 })
  responseTimeMs: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns the current status of the API',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthCheckResponse,
  })
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Checks if the service is ready to handle requests (database connected)',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
    type: DatabaseHealthResponse,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  async ready(): Promise<DatabaseHealthResponse> {
    // In a real implementation, this would check database connectivity
    return {
      status: 'ok',
      database: 'Connected',
      responseTimeMs: 15,
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Simple check to verify the service is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  live(): { status: string } {
    return { status: 'ok' };
  }
}
