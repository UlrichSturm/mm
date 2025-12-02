import { Controller, Get, Patch, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public, Unprotected } from 'nest-keycloak-connect';

interface AuthenticatedRequest {
  user: {
    sub: string; // Keycloak user ID
    email: string;
    given_name?: string;
    family_name?: string;
    roles?: string[];
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns user profile from database. User must be authenticated via Keycloak.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        createdAt: '2025-12-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    const keycloakUserId = req.user.sub;
    
    // Try to get user from database
    let user = await this.authService.findByKeycloakId(keycloakUserId);

    // If not found, sync from Keycloak
    if (!user) {
      user = await this.authService.syncUserFromKeycloak(req.user);
    }

    return user;
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update user profile information (firstName, lastName, phone, avatar)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Smith' },
        phone: { type: 'string', example: '+49 123 456 7890' },
        avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: { firstName?: string; lastName?: string; phone?: string; avatar?: string },
  ) {
    const keycloakUserId = req.user.sub;
    return this.authService.updateProfile(keycloakUserId, body);
  }

  @Get('health')
  @Public()
  @Unprotected()
  @ApiOperation({
    summary: 'Health check for auth service',
    description: 'Public endpoint to check if auth service is running',
  })
  @ApiResponse({ status: 200, description: 'Auth service is healthy' })
  healthCheck() {
    return { status: 'ok', service: 'auth', timestamp: new Date() };
  }
}
