import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../common/enums/role.enum';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Mock Prisma Service
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock Email Service
  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
  };

  // Mock Config Service
  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        KEYCLOAK_URL: 'http://localhost:8080',
        KEYCLOAK_REALM: 'memento-mori',
        KEYCLOAK_ADMIN_USER: 'admin',
        KEYCLOAK_ADMIN_PASSWORD: 'admin',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile when user exists', async () => {
      // Arrange
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getProfile(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890',
      };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        ...updateData,
        role: Role.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: expect.any(Object),
      });
    });

    it('should only update provided fields', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateData = {
        firstName: 'Updated',
      };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: Role.CLIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { firstName: 'Updated' },
        select: expect.any(Object),
      });
    });
  });

  describe('findByKeycloakId', () => {
    it('should find user by Keycloak ID', async () => {
      // Arrange
      const keycloakId = 'keycloak-user-id';
      const mockUser = {
        id: keycloakId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.CLIENT,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByKeycloakId(keycloakId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: keycloakId },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const keycloakId = 'non-existent-keycloak-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByKeycloakId(keycloakId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      // Act & Assert
      await expect(service.registerUser(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw BadRequestException when Keycloak user creation fails', async () => {
      // Arrange
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Mock axios to throw error (simulating Keycloak failure)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const axiosModule = require('axios');
      jest.spyOn(axiosModule, 'post').mockRejectedValue(new Error('Keycloak error'));

      // Act & Assert
      await expect(service.registerUser(registerDto)).rejects.toThrow(BadRequestException);
    });
  });
});
