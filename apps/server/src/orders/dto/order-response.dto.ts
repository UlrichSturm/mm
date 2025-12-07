import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  serviceId: string;

  @ApiProperty({ example: 'Funeral Flower Arrangement' })
  serviceName: string;

  @ApiProperty({ example: 150.0 })
  servicePrice: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 150.0 })
  unitPrice: number;

  @ApiProperty({ example: 300.0 })
  totalPrice: number;

  @ApiPropertyOptional({ example: 'White roses preferred' })
  notes?: string;
}

export class OrderClientDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id: string;

  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Hans' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Mueller' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+49 123 456 7890' })
  phone?: string;
}

export class OrderVendorDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  id: string;

  @ApiProperty({ example: 'Bestattungen Becker GmbH' })
  businessName: string;

  @ApiProperty({ example: 'vendor@example.com' })
  contactEmail: string;

  @ApiPropertyOptional({ example: '+49 987 654 3210' })
  contactPhone?: string;
}

export class OrderPaymentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440004' })
  id: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  status: PaymentStatus;

  @ApiProperty({ example: 300.0 })
  amount: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiPropertyOptional({ example: '2025-12-10T14:30:00.000Z' })
  paidAt?: Date;
}

export class OrderResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440005' })
  id: string;

  @ApiProperty({ example: 'ORD-2025-001234' })
  orderNumber: string;

  @ApiProperty({ type: OrderClientDto })
  client: OrderClientDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: 300.0 })
  subtotal: number;

  @ApiProperty({ example: 57.0 })
  tax: number;

  @ApiProperty({ example: 357.0 })
  totalPrice: number;

  @ApiProperty({ example: 'EUR' })
  currency: string;

  @ApiPropertyOptional({ example: 'Delivery to the back entrance' })
  notes?: string;

  @ApiPropertyOptional({ example: '2025-12-15T10:00:00.000Z' })
  scheduledDate?: Date;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiPropertyOptional({ type: OrderPaymentDto })
  payment?: OrderPaymentDto;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T10:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2025-12-15T12:00:00.000Z' })
  completedAt?: Date;

  @ApiPropertyOptional({ example: null })
  cancelledAt?: Date;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

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
