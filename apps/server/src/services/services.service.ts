import { Injectable } from '@nestjs/common';

export interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
}

@Injectable()
export class ServicesService {
  // Mock data removed - services should be stored in database
  // TODO: Implement Prisma service model for services

  findAll(_filters?: { search?: string; categoryId?: string }): Service[] {
    // Return empty array - no mock data
    // Services should be retrieved from database via Prisma
    return [];
  }
}
