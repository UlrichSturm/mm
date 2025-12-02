import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

/**
 * AuthService for Keycloak integration
 * 
 * Note: Authentication is handled by Keycloak.
 * This service only manages user profiles in our database.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

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
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User ${userId} profile updated`);
    return user;
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
}
