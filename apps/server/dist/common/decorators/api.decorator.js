"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEndpoint = ApiEndpoint;
exports.ApiPaginatedResponse = ApiPaginatedResponse;
exports.ApiPublicEndpoint = ApiPublicEndpoint;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
function ApiEndpoint(options) {
    const decorators = [
        (0, swagger_1.ApiOperation)({
            summary: options.summary,
            description: options.description,
        }),
    ];
    if (options.tags?.length) {
        decorators.push((0, swagger_1.ApiTags)(...options.tags));
    }
    if (options.auth !== false) {
        decorators.push((0, swagger_1.ApiBearerAuth)('JWT-auth'));
    }
    if (options.responses?.length) {
        options.responses.forEach(response => {
            decorators.push((0, swagger_1.ApiResponse)({
                status: response.status,
                description: response.description,
                type: response.type,
                isArray: response.isArray,
            }));
        });
    }
    if (options.auth !== false) {
        decorators.push((0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Invalid or missing token' }), (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }));
    }
    decorators.push((0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }));
    return (0, common_1.applyDecorators)(...decorators);
}
function ApiPaginatedResponse(model) {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(model), (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated list retrieved successfully',
        schema: {
            allOf: [
                {
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'array',
                            items: { $ref: (0, swagger_1.getSchemaPath)(model) },
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
    }));
}
function ApiPublicEndpoint(options) {
    return ApiEndpoint({ ...options, auth: false });
}
//# sourceMappingURL=api.decorator.js.map