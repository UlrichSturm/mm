import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ServiceStatus } from '@prisma/client';

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service name',
    example: 'Funeral Flower Arrangement',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Service description',
    example: 'Beautiful floral arrangement for funeral ceremonies...',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    description: 'Service price in EUR',
    example: 150.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Service duration in minutes',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Image URLs',
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Service status',
    enum: ServiceStatus,
  })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
