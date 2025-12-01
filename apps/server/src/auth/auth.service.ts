import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private prisma: PrismaService) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Find user in database
    const user = await this.prisma.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password (in production use bcrypt hashing)
    if (user.password !== password) {
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
      // Decode token
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

    // Create new user
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
