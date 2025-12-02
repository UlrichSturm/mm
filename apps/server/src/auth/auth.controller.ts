import { Controller, Get, Post, Patch, Body, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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

  @Post('login')
  @Public()
  @Unprotected()
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user with Keycloak using Direct Access Grants',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        expires_in: { type: 'number' },
        token_type: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { username: string; password: string }) {
    if (!body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.authService.loginUser(body.username, body.password);
  }

  @Post('register')
  @Public()
  @Unprotected()
  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user in Keycloak and syncs to local database',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'username' },
        password: { type: 'string', example: 'password123' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body()
    body: {
      email: string;
      username?: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    return this.authService.registerUser(body);
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
