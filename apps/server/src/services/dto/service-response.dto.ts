import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

export class ServiceVendorDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Bestattungen Becker GmbH' })
  businessName: string;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 23 })
  reviewCount: number;
}

export class ServiceCategoryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'Flowers' })
  name: string;

  @ApiProperty({ example: 'flowers' })
  slug: string;
}

export class ServiceResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id: string;

  @ApiProperty({ example: 'Funeral Flower Arrangement' })
  name: string;

  @ApiProperty({ example: 'Beautiful floral arrangement for funeral ceremonies...' })
  description: string;

  @ApiProperty({ example: 150.0 })
  price: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiPropertyOptional({ example: 60 })
  duration?: number;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  images?: string[];

  @ApiProperty({ enum: ServiceStatus, example: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @ApiPropertyOptional({ type: ServiceVendorDto })
  vendor?: ServiceVendorDto;

  @ApiPropertyOptional({ type: ServiceCategoryDto })
  category?: ServiceCategoryDto;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  updatedAt: Date;
}

export class ServiceListResponseDto {
  @ApiProperty({ type: [ServiceResponseDto] })
  data: ServiceResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 100, totalPages: 10 },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
