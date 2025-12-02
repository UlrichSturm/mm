import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Service ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Quantity of the service',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Additional notes for this item',
    example: 'Please call before arrival',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'General notes for the order',
    example: 'Delivery to the back entrance',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date for the service',
    example: '2025-12-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;
}
