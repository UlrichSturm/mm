import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class PaymentIntentResponseDto {
  @ApiProperty({
    description: 'Stripe Payment Intent ID',
    example: 'pi_1234567890abcdef',
  })
  paymentIntentId: string;

  @ApiProperty({
    description: 'Client secret for Stripe Elements',
    example: 'pi_1234567890abcdef_secret_xyz',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Amount in cents',
    example: 35700,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'eur',
  })
  currency: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  orderId: string;

  @ApiProperty({ example: 'ORD-2025-001234' })
  orderNumber: string;

  @ApiPropertyOptional({ example: 'pi_1234567890abcdef' })
  stripePaymentIntentId?: string;

  @ApiProperty({ example: 357.0 })
  amount: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiProperty({ example: 17.85 })
  platformFee: number;

  @ApiProperty({ example: 10.71 })
  stripeFee: number;

  @ApiProperty({ example: 328.44 })
  vendorPayout: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  status: PaymentStatus;

  @ApiPropertyOptional({ example: '2025-12-10T14:30:00.000Z' })
  paidAt?: Date;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T14:30:00.000Z' })
  updatedAt: Date;
}

export class PaymentListResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  data: PaymentResponseDto[];

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
