import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakService } from '../keycloak/keycloak.service';

export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  status: VendorStatus;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private keycloakService: KeycloakService,
  ) {}

  async findAll(status?: VendorStatus): Promise<VendorProfile[]> {
    const where = status ? { status: status as any } : {};
    const vendors = await this.prisma.vendorProfile.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return vendors.map(v => this.mapToInterface(v));
  }

  async findOne(id: string): Promise<VendorProfile | null> {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    return vendor ? this.mapToInterface(vendor) : null;
  }

  async findByUserId(userId: string): Promise<VendorProfile | null> {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    return vendor ? this.mapToInterface(vendor) : null;
  }

  async create(data: Partial<VendorProfile> & { password: string }): Promise<VendorProfile> {
    // Validate required fields
    if (!data.email || !data.password || !data.businessName) {
      throw new BadRequestException('Email, password, and business name are required');
    }

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create user in Keycloak first (this will generate a UUID automatically)
    const keycloakUserId = await this.keycloakService.createUser(
      data.email,
      data.password,
      undefined, // firstName
      undefined, // lastName
      ['vendor'], // role
    );

    if (!keycloakUserId) {
      throw new BadRequestException('Failed to create user in Keycloak');
    }

    // Create user in local database using Keycloak UUID as id
    await this.prisma.user.create({
      data: {
        id: keycloakUserId, // Use Keycloak UUID as the user ID
        email: data.email.toLowerCase(),
        password: null, // Password stored in Keycloak
        role: 'VENDOR',
      },
    });

    // Create vendor profile
    const vendor = await this.prisma.vendorProfile.create({
      data: {
        userId: keycloakUserId, // Use Keycloak UUID as userId
        businessName: data.businessName || '',
        contactEmail: data.email || '',
        contactPhone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        status: 'PENDING',
      },
      include: { user: true },
    });
    return this.mapToInterface(vendor);
  }

  async updateProfile(
    id: string,
    userId: string,
    userRole: string,
    data: Partial<VendorProfile>,
  ): Promise<VendorProfile> {
    const vendor = await this.findOne(id);
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Only vendor owner or admin can update
    if (vendor.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: {
        businessName: data.businessName,
        contactEmail: data.email,
        contactPhone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
      },
      include: { user: true },
    });
    return this.mapToInterface(updated);
  }

  async updateStatus(id: string, status: VendorStatus): Promise<VendorProfile> {
    const updated = await this.prisma.vendorProfile.update({
      where: { id },
      data: { status: status as any },
      include: { user: true },
    });
    return this.mapToInterface(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vendorProfile.delete({
      where: { id },
    });
  }

  private mapToInterface(vendor: any): VendorProfile {
    return {
      id: vendor.id,
      userId: vendor.userId,
      businessName: vendor.businessName,
      email: vendor.contactEmail,
      phone: vendor.contactPhone,
      address: vendor.address,
      postalCode: vendor.postalCode,
      status: vendor.status as VendorStatus,
      registrationDate: vendor.registrationDate || vendor.createdAt,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    };
  }
}
