import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';

export enum LawyerNotaryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface LawyerNotaryProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseType: 'LAWYER' | 'NOTARY' | 'BOTH';
  organizationName?: string;
  status: LawyerNotaryStatus;
  specialization?: string;
  yearsOfExperience?: number;
  postalCode?: string;
  address?: string;
  homeVisitAvailable?: boolean;
  maxTravelRadius?: number;
  rating?: number;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LawyerNotaryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: Partial<LawyerNotaryProfile>): Promise<LawyerNotaryProfile> {
    const profile = await this.prisma.prisma.lawyerNotaryProfile.create({
      data: {
        userId,
        licenseNumber: data.licenseNumber || '',
        licenseType: (data.licenseType || 'LAWYER') as any,
        organizationName: data.organizationName,
        status: 'PENDING',
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        postalCode: data.postalCode,
        address: data.address,
        homeVisitAvailable: data.homeVisitAvailable || false,
        maxTravelRadius: data.maxTravelRadius,
        rating: data.rating,
        name: data.name,
      },
    });
    return this.mapToInterface(profile);
  }

  async findAll(status?: LawyerNotaryStatus): Promise<LawyerNotaryProfile[]> {
    const where = status ? { status: status as any } : {};
    const profiles = await this.prisma.prisma.lawyerNotaryProfile.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map(p => this.mapToInterface(p));
  }

  async findByUserId(userId: string): Promise<LawyerNotaryProfile | null> {
    const profile = await this.prisma.prisma.lawyerNotaryProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    return profile ? this.mapToInterface(profile) : null;
  }

  async findOne(id: string): Promise<LawyerNotaryProfile> {
    const profile = await this.prisma.prisma.lawyerNotaryProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!profile) {
      throw new NotFoundException(`Lawyer/Notary profile with ID ${id} not found`);
    }
    return this.mapToInterface(profile);
  }

  private mapToInterface(profile: any): LawyerNotaryProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      licenseNumber: profile.licenseNumber,
      licenseType: profile.licenseType,
      organizationName: profile.organizationName,
      status: profile.status as LawyerNotaryStatus,
      specialization: profile.specialization,
      yearsOfExperience: profile.yearsOfExperience,
      postalCode: profile.postalCode,
      address: profile.address,
      homeVisitAvailable: profile.homeVisitAvailable,
      maxTravelRadius: profile.maxTravelRadius,
      rating: profile.rating,
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfile(
    id: string,
    userId: string,
    userRole: Role,
    data: Partial<LawyerNotaryProfile>,
  ): Promise<LawyerNotaryProfile> {
    const profile = await this.findOne(id);

    // Only the owner or admin can update
    if (profile.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updated = await this.prisma.prisma.lawyerNotaryProfile.update({
      where: { id },
      data: {
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType as any,
        organizationName: data.organizationName,
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        postalCode: data.postalCode,
        address: data.address,
        homeVisitAvailable: data.homeVisitAvailable,
        maxTravelRadius: data.maxTravelRadius,
        rating: data.rating,
        name: data.name,
      },
      include: { user: true },
    });
    return this.mapToInterface(updated);
  }

  async updateStatus(id: string, status: LawyerNotaryStatus): Promise<LawyerNotaryProfile> {
    const updated = await this.prisma.prisma.lawyerNotaryProfile.update({
      where: { id },
      data: { status: status as any },
      include: { user: true },
    });
    return this.mapToInterface(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.prisma.lawyerNotaryProfile.delete({
      where: { id },
    });
  }

  async getAvailableLawyers(postalCode: string): Promise<any[]> {
    // Return only approved lawyers
    const approvedLawyers = await this.prisma.prisma.lawyerNotaryProfile.findMany({
      where: { status: 'APPROVED' },
      include: { user: true },
    });

    // Filter lawyers by postal code proximity
    // Simple logic: check if postal codes are in the same city/region
    // For Germany: Berlin (10115-14199), Dresden (01067-01328), etc.
    const filteredLawyers = approvedLawyers.filter((profile) => {
      if (!profile.postalCode) return false;
      
      // If lawyer offers home visits, they can serve wider area
      if (profile.homeVisitAvailable && profile.maxTravelRadius) {
        // For now, consider all lawyers with home visits as available
        // In a real implementation, calculate distance between postal codes
        return true;
      }
      
      // For office-only lawyers, check if postal codes are in same city
      // Berlin: 10115-14199
      // Dresden: 01067-01328 (stored as strings to preserve leading zeros)
      const userPostalNum = parseInt(postalCode);
      const lawyerPostalNum = parseInt(profile.postalCode);
      
      // Check if both are in Berlin (10115-14199)
      if (userPostalNum >= 10115 && userPostalNum <= 14199 && 
          lawyerPostalNum >= 10115 && lawyerPostalNum <= 14199) {
        return true;
      }
      
      // Check if both are in Dresden (01067-01328)
      // Parse as string to handle leading zeros correctly
      const userPostalStr = postalCode.padStart(5, '0');
      const lawyerPostalStr = profile.postalCode.padStart(5, '0');
      if (userPostalStr.startsWith('01') && lawyerPostalStr.startsWith('01')) {
        // Both in Dresden area (01xxx)
        return true;
      }
      
      // If lawyer offers home visits, include them
      return profile.homeVisitAvailable === true;
    });

    // Transform to match client expectations
    return filteredLawyers.map((profile: any) => {
      // Map licenseType to lowercase for client compatibility
      let licenseType: 'lawyer' | 'notary' | 'both' = 'lawyer';
      if (profile.licenseType === 'NOTARY') {
        licenseType = 'notary';
      } else if (profile.licenseType === 'BOTH') {
        licenseType = 'both';
      }

      return {
        id: profile.id,
        name: profile.name || profile.organizationName || 'Lawyer',
        rating: profile.rating || 4.5,
        licenseType,
        postalCode: profile.postalCode, // Use lawyer's actual postal code, not user's
        address: profile.address || 'Address not provided',
        homeVisitAvailable: profile.homeVisitAvailable ?? true,
        specialization: profile.specialization,
        maxTravelRadius: profile.maxTravelRadius || 50,
      };
    });
  }
}

