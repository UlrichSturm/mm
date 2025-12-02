import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Options for the ApiEndpoint decorator
 */
export interface ApiEndpointOptions {
  /** Short summary of the endpoint */
  summary: string;
  /** Detailed description of what the endpoint does */
  description?: string;
  /** Tags to group the endpoint (e.g., 'users', 'orders') */
  tags?: string[];
  /** Whether authentication is required (default: true) */
  auth?: boolean;
  /** Custom responses configuration */
  responses?: ApiResponseConfig[];
}

export interface ApiResponseConfig {
  /** HTTP status code */
  status: number;
  /** Description of the response */
  description: string;
  /** Response DTO type */
  type?: Type<unknown>;
  /** Whether the response is an array */
  isArray?: boolean;
}

/**
 * Combined decorator for API endpoints that applies common Swagger decorators
 *
 * @example
 * ```typescript
 * @Get(':id')
 * @ApiEndpoint({
 *   summary: 'Get user by ID',
 *   description: 'Returns a single user by their unique ID',
 *   tags: ['users'],
 *   responses: [
 *     { status: 200, description: 'User found', type: UserResponseDto },
 *     { status: 404, description: 'User not found' },
 *   ],
 * })
 * async findOne(@Param('id') id: string): Promise<UserResponseDto> {
 *   return this.usersService.findOne(id);
 * }
 * ```
 */
export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  ];

  // Add tags
  if (options.tags?.length) {
    decorators.push(ApiTags(...options.tags));
  }

  // Add authentication
  if (options.auth !== false) {
    decorators.push(ApiBearerAuth('JWT-auth'));
  }

  // Add custom responses
  if (options.responses?.length) {
    options.responses.forEach(response => {
      decorators.push(
        ApiResponse({
          status: response.status,
          description: response.description,
          type: response.type,
          isArray: response.isArray,
        }),
      );
    });
  }

  // Add default error responses if auth is required
  if (options.auth !== false) {
    decorators.push(
      ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
      ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    );
  }

  // Always add server error response
  decorators.push(ApiResponse({ status: 500, description: 'Internal Server Error' }));

  return applyDecorators(...decorators);
}

/**
 * Decorator for paginated list endpoints
 */
export function ApiPaginatedResponse<TModel extends Type<unknown>>(model: TModel) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description: 'Paginated list retrieved successfully',
      schema: {
        allOf: [
          {
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 20 },
                  total: { type: 'number', example: 100 },
                  totalPages: { type: 'number', example: 5 },
                },
              },
            },
          },
        ],
      },
    }),
  );
}

/**
 * Decorator for public endpoints that don't require authentication
 */
export function ApiPublicEndpoint(options: Omit<ApiEndpointOptions, 'auth'>) {
  return ApiEndpoint({ ...options, auth: false });
}
