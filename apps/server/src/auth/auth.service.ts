import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AuthService for Keycloak integration
 *
 * Note: Authentication is handled by Keycloak.
 * This service only manages user profiles in our database.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly keycloakUrl: string;
  private readonly keycloakRealm: string;
  private readonly keycloakAdminUser: string;
  private readonly keycloakAdminPassword: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || 'http://localhost:8080';
    this.keycloakRealm = this.configService.get<string>('KEYCLOAK_REALM') || 'memento-mori';
    this.keycloakAdminUser = this.configService.get<string>('KEYCLOAK_ADMIN_USER') || 'admin';
    this.keycloakAdminPassword =
      this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD') || 'admin';
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        deliveryAddress: true,
        deliveryPostalCode: true,
        deliveryCity: true,
        deliveryCountry: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // User authenticated in Keycloak but not in our DB - create profile
      this.logger.warn(`User ${userId} not found in database, needs sync`);
      return null;
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
      deliveryAddress?: string;
      deliveryPostalCode?: string;
      deliveryCity?: string;
      deliveryCountry?: string;
      billingAddress?: string;
      billingPostalCode?: string;
      billingCity?: string;
      billingCountry?: string;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
        deliveryAddress: data.deliveryAddress,
        deliveryPostalCode: data.deliveryPostalCode,
        deliveryCity: data.deliveryCity,
        deliveryCountry: data.deliveryCountry,
        billingAddress: data.billingAddress,
        billingPostalCode: data.billingPostalCode,
        billingCity: data.billingCity,
        billingCountry: data.billingCountry,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        deliveryAddress: true,
        deliveryPostalCode: true,
        deliveryCity: true,
        deliveryCountry: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${userId} profile updated`);
    return user;
  }

  /**
   * Change user password via Keycloak Admin API
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    this.logger.log(`Changing password for user ${userId}`);

    const keycloakClientId =
      this.configService.get<string>('KEYCLOAK_CLIENT_ID') || 'memento-mori-api';
    const keycloakClientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

    if (!keycloakClientSecret) {
      throw new BadRequestException('Keycloak client secret not configured');
    }

    // Get user email from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Step 1: Verify current password by attempting to login
    try {
      await axios.post(
        `${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: keycloakClientId,
          client_secret: keycloakClientSecret,
          username: user.email,
          password: currentPassword,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (error) {
      // Only handle 401 from password verification, not from admin API
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new BadRequestException('Current password is incorrect');
      }
      // Re-throw other errors from password verification
      this.logger.error('Error verifying current password:', error);
      throw new BadRequestException('Failed to verify current password');
    }

    // Step 2: Current password is correct, now update it via Admin API
    const adminToken = await this.getKeycloakAdminToken();
    if (!adminToken) {
      throw new BadRequestException('Failed to authenticate with Keycloak admin');
    }

    // Step 3: Update password in Keycloak
    try {
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}/reset-password`,
        {
          type: 'password',
          value: newPassword,
          temporary: false,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Password changed successfully for user ${userId}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      // Handle errors from admin API separately
      if (axios.isAxiosError(error)) {
        this.logger.error(
          'Error changing password via Keycloak Admin API:',
          error.response?.data || error.message,
        );
        if (error.response?.status === 401) {
          throw new BadRequestException('Failed to authenticate with Keycloak admin');
        }
        if (error.response?.status === 403) {
          throw new BadRequestException('Insufficient permissions to change password');
        }
        if (error.response?.status === 404) {
          throw new BadRequestException('User not found in Keycloak');
        }
        throw new BadRequestException('Failed to change password in Keycloak');
      }
      throw error;
    }
  }

  /**
   * Sync user from Keycloak to local database
   * Called when user authenticates via Keycloak but doesn't exist in our DB
   */
  async syncUserFromKeycloak(keycloakUser: {
    sub: string; // Keycloak user ID
    email: string;
    given_name?: string;
    family_name?: string;
    roles?: string[];
  }) {
    this.logger.log(`Syncing user from Keycloak: ${keycloakUser.email}`);

    // Determine role from Keycloak roles
    let role = Role.CLIENT;
    if (keycloakUser.roles?.includes('admin')) {
      role = Role.ADMIN;
    } else if (keycloakUser.roles?.includes('vendor')) {
      role = Role.VENDOR;
    } else if (keycloakUser.roles?.includes('lawyer_notary')) {
      role = Role.LAWYER_NOTARY;
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: keycloakUser.email },
    });

    if (existingUser) {
      // Update existing user
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: keycloakUser.given_name,
          lastName: keycloakUser.family_name,
          role,
        },
      });
    }

    // Create new user
    return this.prisma.user.create({
      data: {
        id: keycloakUser.sub, // Use Keycloak user ID
        email: keycloakUser.email,
        password: '', // Empty - managed by Keycloak
        firstName: keycloakUser.given_name,
        lastName: keycloakUser.family_name,
        role,
      },
    });
  }

  /**
   * Get user by email (for Keycloak sync)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get user by Keycloak ID
   */
  async findByKeycloakId(keycloakId: string) {
    return this.prisma.user.findUnique({
      where: { id: keycloakId },
    });
  }

  /**
   * Login user using Keycloak Direct Access Grants (with confidential client)
   */
  async loginUser(username: string, password: string) {
    try {
      const keycloakClientId =
        this.configService.get<string>('KEYCLOAK_CLIENT_ID') || 'memento-mori-api';
      const keycloakClientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

      if (!keycloakClientSecret) {
        throw new BadRequestException('Keycloak client secret not configured');
      }

      const response = await axios.post(
        `${this.keycloakUrl}/realms/${this.keycloakRealm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: keycloakClientId,
          client_secret: keycloakClientSecret,
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = response.data;

      // Sync user to local database if needed
      const tokenPayload = this.parseJwt(data.access_token);
      if (tokenPayload) {
        await this.syncUserFromKeycloak({
          sub: tokenPayload.sub,
          email: tokenPayload.email || tokenPayload.preferred_username,
          given_name: tokenPayload.given_name,
          family_name: tokenPayload.family_name,
          roles: tokenPayload.realm_access?.roles || [],
        });
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data || {};
        throw new BadRequestException(
          errorData.error_description || errorData.error || 'Invalid credentials',
        );
      }
      this.logger.error('Login error:', error);
      throw new BadRequestException('Login failed');
    }
  }

  /**
   * Parse JWT token
   */
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Register new user in Keycloak and sync to local database
   */
  async registerUser(data: {
    email: string;
    username?: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    this.logger.log(`Registering new user: ${data.email}`);

    // Check if user already exists in database
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get admin token
    const adminToken = await this.getKeycloakAdminToken();
    if (!adminToken) {
      throw new BadRequestException('Failed to authenticate with Keycloak admin');
    }

    // Create user in Keycloak
    const keycloakUserId = await this.createKeycloakUser(adminToken, {
      email: data.email,
      username: data.username || data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (!keycloakUserId) {
      throw new BadRequestException('Failed to create user in Keycloak');
    }

    // Assign default role (client)
    await this.assignRoleToUser(adminToken, keycloakUserId, 'client');

    // Create user in local database
    const user = await this.prisma.user.create({
      data: {
        id: keycloakUserId,
        email: data.email,
        password: '', // Empty - managed by Keycloak
        firstName: data.firstName,
        lastName: data.lastName,
        role: Role.CLIENT,
      },
    });

    this.logger.log(`User ${data.email} registered successfully`);
    return user;
  }

  /**
   * Get Keycloak admin token
   */
  private async getKeycloakAdminToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.keycloakAdminUser,
          password: this.keycloakAdminPassword,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Error getting admin token:', error);
      return null;
    }
  }

  /**
   * Create user in Keycloak
   */
  private async createKeycloakUser(
    adminToken: string,
    data: {
      email: string;
      username: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users`,
        {
          email: data.email,
          username: data.username,
          enabled: true,
          emailVerified: true,
          firstName: data.firstName,
          lastName: data.lastName,
          credentials: [
            {
              type: 'password',
              value: data.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true, // Don't throw on any status
        },
      );

      if (response.status === 409) {
        throw new ConflictException('User already exists in Keycloak');
      }

      if (response.status >= 400) {
        this.logger.error('Failed to create user in Keycloak:', response.data);
        return null;
      }

      // Get user ID from Location header
      const location = response.headers.location;
      if (location) {
        const userId = location.split('/').pop();
        return userId || null;
      }

      // If no Location header, search for user by email
      const searchResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users`,
        {
          params: { email: data.email },
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      if (searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].id;
      }

      return null;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating user in Keycloak:', error);
      return null;
    }
  }

  /**
   * Assign role to user in Keycloak
   */
  private async assignRoleToUser(
    adminToken: string,
    userId: string,
    roleName: string,
  ): Promise<boolean> {
    try {
      // Get role
      const roleResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/roles/${roleName}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          validateStatus: () => true,
        },
      );

      if (roleResponse.status >= 400) {
        this.logger.warn(`Role ${roleName} not found, skipping role assignment`);
        return false;
      }

      const role = roleResponse.data;

      // Assign role to user
      const assignResponse = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.keycloakRealm}/users/${userId}/role-mappings/realm`,
        [role],
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true,
        },
      );

      return assignResponse.status < 400;
    } catch (error) {
      this.logger.error('Error assigning role to user:', error);
      return false;
    }
  }
}
