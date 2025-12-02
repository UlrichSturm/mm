import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change (required for cancellation/refund)',
    example: 'Customer requested cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'General notes for the order',
    example: 'Updated delivery instructions',
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
