import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Order ID to create payment for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({
    description: 'Return URL after successful payment',
    example: 'https://mementomori.de/payments/success',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Stripe Payment Intent ID',
    example: 'pi_1234567890abcdef',
  })
  @IsString()
  paymentIntentId: string;
}
