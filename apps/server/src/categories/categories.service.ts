import { Injectable } from '@nestjs/common';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

@Injectable()
export class CategoriesService {
  // Mock data removed - categories should be stored in database
  // TODO: Implement Prisma service model for categories

  findAll(): Category[] {
    // Return empty array - no mock data
    // Categories should be retrieved from database via Prisma
    return [];
  }
}

