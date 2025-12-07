"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const yaml = require("js-yaml");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }));
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                logger.warn(`CORS blocked request from: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    });
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Memento Mori API')
            .setDescription(`
## API Documentation for Memento Mori Platform

Memento Mori is a marketplace platform for funeral services connecting clients with verified vendors.

### Authentication

This API uses **Keycloak** for authentication. Include the access token in the Authorization header:

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

### Rate Limiting

API requests are rate-limited to protect the service:
- Default: 100 requests per 60 seconds per IP
- Auth endpoints: 10 requests per 60 seconds per IP

### Error Responses

All errors follow a consistent format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  },
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`

### Common Status Codes

- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request (validation error)
- \`401\` - Unauthorized (not authenticated)
- \`403\` - Forbidden (not authorized)
- \`404\` - Not Found
- \`409\` - Conflict (duplicate resource)
- \`422\` - Unprocessable Entity (business logic error)
- \`429\` - Too Many Requests
- \`500\` - Internal Server Error
      `)
            .setVersion('1.0.0')
            .setContact('Memento Mori Team', 'https://mementomori.de', 'support@mementomori.de')
            .setLicense('Private', '')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'Authorization',
            description: 'Enter Keycloak access token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('health', 'Health check endpoints')
            .addTag('auth', 'Authentication & Authorization (Keycloak)')
            .addTag('users', 'User management')
            .addTag('vendors', 'Vendor profiles and management')
            .addTag('lawyers-notaries', 'Lawyer and Notary profiles')
            .addTag('services', 'Services catalog')
            .addTag('categories', 'Service categories')
            .addTag('orders', 'Order management')
            .addTag('payments', 'Payment processing (Stripe)')
            .addTag('admin', 'Admin panel endpoints')
            .addServer('http://localhost:3001', 'Local Development')
            .addServer('https://api-staging.mementomori.de', 'Staging')
            .addServer('https://api.mementomori.de', 'Production')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                docExpansion: 'none',
                filter: true,
                showRequestDuration: true,
                tryItOutEnabled: true,
            },
            customSiteTitle: 'Memento Mori API Documentation',
            customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2rem; font-weight: 700; }
        .swagger-ui .info .description { margin-top: 1rem; }
        .swagger-ui .opblock-tag { font-size: 1.1rem; }
      `,
        });
        app.getHttpAdapter().get('/api/docs-json', (req, res) => {
            res.json(document);
        });
        app.getHttpAdapter().get('/api/docs-yaml', (req, res) => {
            res.type('text/yaml').send(yaml.dump(document));
        });
        logger.log('📚 Swagger documentation available at /api/docs');
        logger.log('📄 OpenAPI JSON spec available at /api/docs-json');
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Application running on http://localhost:${port}`);
    logger.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map