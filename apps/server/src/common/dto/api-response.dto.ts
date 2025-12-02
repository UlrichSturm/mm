import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard success response wrapper
 */
export class ApiSuccessResponse<T = unknown> {
  @ApiProperty({ description: 'Request success status', example: true })
  success: true;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiPropertyOptional({
    description: 'Optional message',
    example: 'Operation completed successfully',
  })
  message?: string;
}

/**
 * Error details for validation errors
 */
export class ValidationErrorDetail {
  @ApiProperty({ description: 'Field name', example: 'email' })
  field: string;

  @ApiProperty({ description: 'Error message', example: 'Invalid email format' })
  message: string;
}

/**
 * Error information
 */
export class ApiErrorInfo {
  @ApiProperty({ description: 'Error code', example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ description: 'Human-readable error message', example: 'Validation failed' })
  message: string;

  @ApiPropertyOptional({
    description: 'Detailed error information',
    type: [ValidationErrorDetail],
    example: [{ field: 'email', message: 'Invalid email format' }],
  })
  details?: ValidationErrorDetail[];
}

/**
 * Standard error response wrapper
 */
export class ApiErrorResponse {
  @ApiProperty({ description: 'Request success status', example: false })
  success: false;

  @ApiProperty({ description: 'Error information', type: ApiErrorInfo })
  error: ApiErrorInfo;

  @ApiProperty({ description: 'Timestamp of the error', example: '2025-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ description: 'Request path', example: '/api/users' })
  path: string;
}

/**
 * Simple message response
 */
export class MessageResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Operation completed successfully' })
  message: string;
}

/**
 * ID response for create operations
 */
export class IdResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Created resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Resource created successfully',
  })
  message?: string;
}
