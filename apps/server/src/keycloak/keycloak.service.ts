import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import type { JwksClient } from 'jwks-rsa';

export interface KeycloakUser {
  sub: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  realm_access?: {
    roles: string[];
  };
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private jwksClient: JwksClient;

  constructor() {
    this.keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    this.realm = process.env.KEYCLOAK_REALM || 'memento-mori';
    this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'memento-mori-backend';
    this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

    // Initialize JWKS client for token verification
    this.jwksClient = (jwksRsa as any)({
      jwksUri: `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  /**
   * Verify and decode Keycloak access token
   */
  async verifyToken(token: string): Promise<KeycloakUser | null> {
    try {
      // Get signing key from JWKS
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
        return null;
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      // Verify token
      const verified = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: `${this.keycloakUrl}/realms/${this.realm}`,
      }) as any;

      return {
        sub: verified.sub,
        email: verified.email,
        email_verified: verified.email_verified || false,
        preferred_username: verified.preferred_username,
        given_name: verified.given_name,
        family_name: verified.family_name,
        roles: verified.realm_access?.roles || [],
        realm_access: verified.realm_access,
      };
    } catch (error) {
      this.logger.error('Token verification failed', error);
      return null;
    }
  }

  /**
   * Get user info from Keycloak
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUser | null> {
    try {
      const response = await axios.get(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data as KeycloakUser;
    } catch (error) {
      this.logger.error('Failed to get user info from Keycloak', error);
      return null;
    }
  }

  /**
   * Create user in Keycloak
   */
  async createUser(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    roles?: string[],
  ): Promise<string | null> {
    try {
      // Get admin access token
      const adminToken = await this.getAdminToken();
      if (!adminToken) {
        throw new Error('Failed to get admin token');
      }

      // Create user
      const userData = {
        email,
        emailVerified: true,
        enabled: true,
        username: email,
        firstName: firstName || '',
        lastName: lastName || '',
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      };

      const createResponse = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const userId = createResponse.headers.location?.split('/').pop();
      if (!userId) {
        throw new Error('Failed to get user ID from response');
      }

      // Assign roles if provided
      if (roles && roles.length > 0) {
        await this.assignRoles(userId, roles, adminToken);
      }

      return userId;
    } catch (error: any) {
      this.logger.error('Failed to create user in Keycloak', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Get admin access token for Keycloak Admin API
   */
  private async getAdminToken(): Promise<string | null> {
    try {
      // Use password grant for admin user
      const response = await axios.post(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: process.env.KEYCLOAK_ADMIN || 'admin',
          password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error: any) {
      this.logger.error('Failed to get admin token', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Assign roles to user
   */
  private async assignRoles(userId: string, roles: string[], adminToken: string): Promise<void> {
    try {
      // Get realm roles
      const rolesResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/roles`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      const realmRoles = rolesResponse.data.filter((role: any) => roles.includes(role.name));

      if (realmRoles.length > 0) {
        await axios.post(
          `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
          realmRoles,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to assign roles', error);
    }
  }

  /**
   * Map Keycloak role to application role
   */
  mapKeycloakRoleToAppRole(keycloakRole: string): string {
    const roleMap: Record<string, string> = {
      'client': 'CLIENT',
      'vendor': 'VENDOR',
      'lawyer-notary': 'LAWYER_NOTARY',
      'admin': 'ADMIN',
    };

    return roleMap[keycloakRole.toLowerCase()] || 'CLIENT';
  }
}

