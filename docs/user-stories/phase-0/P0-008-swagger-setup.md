# P0-008: Swagger Setup

**Epic:** E-000 Phase 0 - Подготовка
**Приоритет:** 🟡 High
**Story Points:** 2
**Исполнитель:** Backend Lead
**Срок:** Day 3
**Статус:** ✅ Выполнено

---

## Описание

Настройка Swagger/OpenAPI документации для Backend API.

---

## Задачи

### 1. Install Dependencies

- [ ] Установить зависимости:

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 2. Swagger Configuration

- [ ] Обновить `apps/server/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Memento Mori API')
      .setDescription(
        `
        ## API Documentation for Memento Mori Platform

        ### Authentication
        Most endpoints require JWT authentication. Include the token in the Authorization header:
        \`Authorization: Bearer <token>\`

        ### Rate Limiting
        API requests are rate-limited to ${process.env.THROTTLE_LIMIT || 100} requests per ${process.env.THROTTLE_TTL || 60} seconds.

        ### Environments
        - Development: http://localhost:3001
        - Staging: https://api-staging.mementomori.ru
        - Production: https://api.mementomori.ru
      `,
      )
      .setVersion('1.0')
      .setContact('Memento Mori Team', 'https://mementomori.ru', 'support@mementomori.ru')
      .setLicense('Private', '')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication & Authorization')
      .addTag('users', 'User management')
      .addTag('vendors', 'Vendor management')
      .addTag('services', 'Services catalog')
      .addTag('categories', 'Categories management')
      .addTag('orders', 'Orders management')
      .addTag('payments', 'Payments processing')
      .addTag('admin', 'Admin panel endpoints')
      .addServer('http://localhost:3001', 'Development')
      .addServer('https://api-staging.mementomori.ru', 'Staging')
      .addServer('https://api.mementomori.ru', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Custom options
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: 'Memento Mori API Docs',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { font-size: 2rem }
      `,
    });

    logger.log('Swagger documentation available at /api/docs');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}

bootstrap();
```

### 3. API Decorators

- [ ] Создать `apps/server/src/common/decorators/api.decorator.ts`:

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export function ApiEndpoint(options: {
  summary: string;
  description?: string;
  tags?: string[];
  auth?: boolean;
  responses?: {
    status: number;
    description: string;
    type?: any;
  }[];
}) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  ];

  if (options.tags) {
    decorators.push(ApiTags(...options.tags));
  }

  if (options.auth !== false) {
    decorators.push(ApiBearerAuth('JWT-auth'));
  }

  if (options.responses) {
    options.responses.forEach(response => {
      decorators.push(
        ApiResponse({
          status: response.status,
          description: response.description,
          type: response.type,
        }),
      );
    });
  }

  // Default responses
  decorators.push(
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  );

  return applyDecorators(...decorators);
}
```

### 4. DTO Documentation

- [ ] Пример документированного DTO:

```typescript
// apps/server/src/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'SecurePassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Петров',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
```

### 5. Response Documentation

- [ ] Пример документированного Response:

```typescript
// apps/server/src/auth/dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Иван' })
  firstName?: string;

  @ApiProperty({ example: 'Петров' })
  lastName?: string;

  @ApiProperty({ example: 'CLIENT', enum: ['CLIENT', 'VENDOR', 'ADMIN'] })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
```

### 6. Controller Documentation

- [ ] Пример документированного контроллера:

```typescript
// apps/server/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with CLIENT role',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and returns JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
```

### 7. Swagger JSON Export

- [ ] Добавить endpoint для экспорта JSON:

```typescript
// В main.ts после создания документа
if (process.env.NODE_ENV !== 'production') {
  // Export OpenAPI spec as JSON
  app.getHttpAdapter().get('/api/docs-json', (req, res) => {
    res.json(document);
  });
}
```

---

## Acceptance Criteria

- [ ] Swagger UI доступен на /api/docs
- [ ] Все endpoints документированы
- [ ] Примеры запросов/ответов добавлены
- [ ] Авторизация через Bearer token работает
- [ ] JSON spec доступен для экспорта
- [ ] Tags группируют endpoints

---

## Definition of Done

- [ ] Swagger настроен и работает
- [ ] Все DTOs документированы
- [ ] Примеры добавлены
- [ ] Тестирование через UI работает
