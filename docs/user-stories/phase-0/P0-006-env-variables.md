# P0-006: Environment Variables Documentation

**Epic:** E-000 Phase 0 - Подготовка  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Исполнитель:** Tech Lead  
**Срок:** Day 1  
**Статус:** ⬜ Не начато

---

## Описание

Документирование всех переменных окружения и создание примеров конфигурации для всех сервисов.

---

## Задачи

### 1. Root .env.example

- [ ] Создать `.env.example` в корне проекта:

```env
# ================================================
# MEMENTO MORI - Environment Variables
# ================================================
# Copy this file to .env and fill in the values
# ================================================

# ===== Application =====
NODE_ENV=development
# NODE_ENV=production
# NODE_ENV=test

# ===== Backend Server =====
PORT=3001
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003

# ===== Database (PostgreSQL) =====
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/memento_mori_dev?schema=public

# For production:
# DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require

# ===== Redis =====
REDIS_URL=redis://localhost:6379
# REDIS_URL=redis://user:password@host:6379

# ===== JWT Authentication =====
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRATION=24h
# JWT_REFRESH_SECRET=your-refresh-token-secret
# JWT_REFRESH_EXPIRATION=7d

# ===== Stripe =====
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# ===== Email (Mailgun) =====
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=sandbox.mailgun.org
# MAILGUN_DOMAIN=mail.yourdomain.com
EMAIL_FROM=Memento Mori <noreply@mementomori.ru>

# For development (Mailhog):
# SMTP_HOST=localhost
# SMTP_PORT=1025
# SMTP_USER=
# SMTP_PASS=

# ===== File Storage (MinIO/S3) =====
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=memento-mori
S3_REGION=us-east-1
# For AWS S3:
# S3_ENDPOINT=https://s3.amazonaws.com

# ===== Frontend URLs =====
CLIENT_URL=http://localhost:3000
VENDOR_URL=http://localhost:3002
ADMIN_URL=http://localhost:3003

# ===== Sentry (Error Tracking) =====
# SENTRY_DSN=https://xxxx@sentry.io/xxxx

# ===== Rate Limiting =====
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# ===== Logging =====
LOG_LEVEL=debug
# LOG_LEVEL=info
# LOG_LEVEL=warn
# LOG_LEVEL=error
```

### 2. Backend .env.example

- [ ] Создать `apps/server/.env.example`:

```env
# ===== Server Configuration =====
NODE_ENV=development
PORT=3001
API_PREFIX=api

# ===== Database =====
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/memento_mori_dev?schema=public

# ===== Redis =====
REDIS_URL=redis://localhost:6379

# ===== JWT =====
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRATION=24h

# ===== Stripe =====
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# ===== Email =====
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=sandbox.mailgun.org
EMAIL_FROM=Memento Mori <noreply@mementomori.ru>

# ===== CORS =====
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3003

# ===== File Storage =====
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=memento-mori

# ===== Rate Limiting =====
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# ===== Logging =====
LOG_LEVEL=debug
```

### 3. Frontend .env.example

- [ ] Создать `apps/client/.env.example`:

```env
# ===== Public Environment Variables =====
# Variables prefixed with NEXT_PUBLIC_ are exposed to the browser

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 4. Environment Variables Documentation

- [ ] Создать `docs/ENVIRONMENT_VARIABLES.md`:

```markdown
# Environment Variables

## Overview

This document describes all environment variables used in the Memento Mori platform.

## Backend (apps/server)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | Random string |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxx` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_EXPIRATION` | JWT token expiration | `24h` |
| `LOG_LEVEL` | Logging level | `debug` |
| `THROTTLE_TTL` | Rate limit window (seconds) | `60` |
| `THROTTLE_LIMIT` | Max requests per window | `100` |

## Frontend (apps/client, apps/vendor-portal, apps/admin-portal)

### Public Variables (exposed to browser)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_xxx` |
| `NEXT_PUBLIC_APP_URL` | Current app URL | `http://localhost:3000` |

## Generating Secrets

### JWT Secret
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

### Database Password
\`\`\`bash
openssl rand -base64 32
\`\`\`

## Environment-specific Setup

### Development
- Use `.env` file locally
- Docker services use `docker-compose.dev.yml` defaults

### Staging
- Variables stored in Railway/Vercel
- Use test API keys for Stripe

### Production
- Variables stored in Railway/Vercel
- Use live API keys for Stripe
- Enable SSL for database
```

### 5. Gitignore for env files

- [ ] Убедиться что `.gitignore` содержит:

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Keep example files
!.env.example
```

### 6. TypeScript Env Validation

- [ ] Создать `apps/server/src/config/env.validation.ts`:

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, MinLength, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  STRIPE_SECRET_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  
  return validatedConfig;
}
```

---

## Acceptance Criteria

- [ ] .env.example создан в корне и всех apps
- [ ] Все переменные задокументированы
- [ ] .gitignore настроен правильно
- [ ] Валидация env переменных работает
- [ ] Документация по генерации секретов создана

---

## Definition of Done

- [ ] Все файлы .env.example созданы
- [ ] Документация ENVIRONMENT_VARIABLES.md написана
- [ ] Валидация настроена
- [ ] Команда может настроить окружение по документации

