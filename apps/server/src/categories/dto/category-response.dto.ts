import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Funeral Flowers' })
  name: string;

  @ApiProperty({ example: 'funeral-flowers' })
  slug: string;

  @ApiPropertyOptional({ example: 'Beautiful floral arrangements for funeral services' })
  description?: string;

  @ApiPropertyOptional({ example: 'flower' })
  icon?: string;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 15 })
  servicesCount: number;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  updatedAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;
}
