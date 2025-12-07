import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Query parameters for paginated endpoints
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

/**
 * Pagination metadata for response
 */
export class PaginationMeta {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrevPage: boolean;
}

/**
 * Generic paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Array of items', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMeta })
  meta: PaginationMeta;
}

/**
 * Helper to create pagination metadata
 */
export function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
