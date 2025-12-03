import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+49 123 456 7890' })
  @IsOptional()
  @IsString()
  phone?: string;

  // Delivery Address
  @ApiPropertyOptional({ example: 'Musterstraße 123' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ example: '10115' })
  @IsOptional()
  @IsString()
  deliveryPostalCode?: string;

  @ApiPropertyOptional({ example: 'Berlin' })
  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @ApiPropertyOptional({ example: 'DE', default: 'DE' })
  @IsOptional()
  @IsString()
  deliveryCountry?: string;

  // Billing Address
  @ApiPropertyOptional({ example: 'Rechnungsstraße 456' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({ example: '20095' })
  @IsOptional()
  @IsString()
  billingPostalCode?: string;

  @ApiPropertyOptional({ example: 'Hamburg' })
  @IsOptional()
  @IsString()
  billingCity?: string;

  @ApiPropertyOptional({ example: 'DE', default: 'DE' })
  @IsOptional()
  @IsString()
  billingCountry?: string;
}
