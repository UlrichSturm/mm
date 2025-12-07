import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakService } from '../keycloak/keycloak.service';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private keycloakService: KeycloakService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Try to authenticate with Keycloak first
    try {
      const keycloakToken = await this.authenticateWithKeycloak(email, password);
      if (keycloakToken) {
        // Verify token and extract user info from token itself (more reliable than userinfo endpoint)
        const keycloakUser = await this.keycloakService.verifyToken(keycloakToken);
        if (keycloakUser) {
          // Find or create user in local database
          let user = await this.prisma.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          // Find the highest priority role (admin > lawyer-notary > vendor > client)
          const roles = keycloakUser.realm_access?.roles || [];
          let selectedRole = 'client';
          if (roles.includes('admin')) {
            selectedRole = 'admin';
          } else if (roles.includes('lawyer-notary')) {
            selectedRole = 'lawyer-notary';
          } else if (roles.includes('vendor')) {
            selectedRole = 'vendor';
          } else if (roles.includes('client')) {
            selectedRole = 'client';
          }
          const appRole = this.keycloakService.mapKeycloakRoleToAppRole(selectedRole);

          if (!user) {
            // Create user in local database
            user = await this.prisma.prisma.user.create({
              data: {
                email: keycloakUser.email || email.toLowerCase(),
                password: null, // Password stored in Keycloak
                role: appRole as any,
                firstName: keycloakUser.given_name || null,
                lastName: keycloakUser.family_name || null,
              },
            });
          } else {
            // Update existing user role if it changed in Keycloak
            if (user.role !== appRole) {
              user = await this.prisma.prisma.user.update({
                where: { id: user.id },
                data: {
                  role: appRole as any,
                  firstName: keycloakUser.given_name || user.firstName,
                  lastName: keycloakUser.family_name || user.lastName,
                },
              });
            }
          }

          return {
            token: keycloakToken,
            user: {
              id: user.id,
              email: user.email,
              role: user.role as Role,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          };
        }
      }
    } catch (error) {
      // Fallback to local authentication if Keycloak is not available
      console.warn('Keycloak authentication failed, falling back to local auth', error);
    }

    // Fallback: Local authentication (for backward compatibility)
    const user = await this.prisma.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password (in production use bcrypt hashing)
    // If user has no password (Keycloak user), skip password check
    if (user.password && user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // If user has no password but we're in fallback, it means Keycloak auth failed
    // and we can't authenticate without password
    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate simple token (in production use JWT)
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Return data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role as Role,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
      },
    };
  }

  private async authenticateWithKeycloak(email: string, password: string): Promise<string | null> {
    try {
      const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
      const realm = process.env.KEYCLOAK_REALM || 'memento-mori';
      const clientId = process.env.KEYCLOAK_CLIENT_ID || 'memento-mori-backend';
      const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

      const response = await axios.post(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: email,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    // Simple token for development (in production use JWT)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    
    // Base64 encoding (in production use JWT)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // Try to validate as Keycloak token first
      const keycloakUser = await this.keycloakService.verifyToken(token);
      if (keycloakUser) {
        // Find user in database by email
        let user = await this.prisma.prisma.user.findUnique({
          where: { email: keycloakUser.email },
        });

        if (!user) {
          // Create user if doesn't exist
          const appRole = this.keycloakService.mapKeycloakRoleToAppRole(
            keycloakUser.realm_access?.roles?.[0] || 'client',
          );
          user = await this.prisma.prisma.user.create({
            data: {
              email: keycloakUser.email,
              password: null, // Password stored in Keycloak
              role: appRole as any,
              firstName: keycloakUser.given_name || null,
              lastName: keycloakUser.family_name || null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as Role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }

      // Fallback: Validate as local token (for backward compatibility)
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now()) {
        return null;
      }
      
      // Find user in database
      const user = await this.prisma.prisma.user.findUnique({
        where: { id: payload.id },
      });
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, role: Role = Role.CLIENT, firstName?: string, lastName?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.prisma.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create user in Keycloak first
    try {
      const keycloakRole = role.toLowerCase().replace('_', '-');
      const keycloakUserId = await this.keycloakService.createUser(
        email,
        password,
        firstName,
        lastName,
        [keycloakRole],
      );

      if (!keycloakUserId) {
        throw new Error('Failed to create user in Keycloak');
      }
    } catch (error) {
      console.warn('Failed to create user in Keycloak, creating locally only', error);
      // Continue with local creation if Keycloak fails
    }

    // Create new user in local database
    const newUser = await this.prisma.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password, // In production hash password with bcrypt
        role: role as any,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as Role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }): Promise<User> {
    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await this.prisma.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      
      if (existingUser && existingUser.id !== userId) {
        throw new UnauthorizedException('Email already in use');
      }
    }

    // Update user
    const updatedUser = await this.prisma.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName || null }),
        ...(data.lastName !== undefined && { lastName: data.lastName || null }),
        ...(data.email && { email: data.email.toLowerCase() }),
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as Role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    };
  }
}
