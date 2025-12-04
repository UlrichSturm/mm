import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  IsInt,
  IsUrl,
  IsNotEmpty,
  Min,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service name',
    example: 'Funeral Flower Arrangement',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Beautiful floral arrangement for funeral ceremonies...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Service price in EUR',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Category ID (required)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Service duration in minutes',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Image URLs (max 5 images)',
    example: ['https://example.com/image1.jpg'],
    type: [String],
    maxItems: 5,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 images allowed' })
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  images?: string[];
}
