# P0-003: Docker Setup

**Epic:** E-000 Phase 0 - Подготовка  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Исполнитель:** DevOps / Backend  
**Срок:** Day 2  
**Статус:** ⬜ Не начато

---

## Описание

Настройка Docker окружения для локальной разработки с hot reload и всеми необходимыми сервисами.

---

## Задачи

### 1. Docker Compose для разработки

- [ ] Создать `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  # ===== PostgreSQL =====
  postgres:
    image: postgres:15-alpine
    container_name: mm-postgres-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: memento_mori_dev
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ===== Redis =====
  redis:
    image: redis:7-alpine
    container_name: mm-redis-dev
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # ===== Mailhog (Email Testing) =====
  mailhog:
    image: mailhog/mailhog
    container_name: mm-mailhog-dev
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    restart: unless-stopped

  # ===== MinIO (S3 Compatible Storage) =====
  minio:
    image: minio/minio
    container_name: mm-minio-dev
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_dev_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    restart: unless-stopped

volumes:
  postgres_dev_data:
  redis_dev_data:
  minio_dev_data:

networks:
  default:
    name: mm-dev-network
```

### 2. Production Docker Compose

- [ ] Обновить `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # ===== PostgreSQL =====
  postgres:
    image: postgres:15-alpine
    container_name: mm-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-postgres}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
      - POSTGRES_DB=${POSTGRES_DB:-memento_mori}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - mm-network

  # ===== Redis =====
  redis:
    image: redis:7-alpine
    container_name: mm-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - mm-network

  # ===== Backend Server =====
  server:
    build:
      context: ./apps/server
      dockerfile: Dockerfile
    container_name: mm-server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-memento_mori}?schema=public
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - mm-network

  # ===== Client App =====
  client:
    build:
      context: ./apps/client
      dockerfile: Dockerfile
    container_name: mm-client
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - mm-network

  # ===== Vendor Portal =====
  vendor-portal:
    build:
      context: ./apps/vendor-portal
      dockerfile: Dockerfile
    container_name: mm-vendor-portal
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - mm-network

  # ===== Admin Portal =====
  admin-portal:
    build:
      context: ./apps/admin-portal
      dockerfile: Dockerfile
    container_name: mm-admin-portal
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - mm-network

volumes:
  postgres_data:
  redis_data:

networks:
  mm-network:
    driver: bridge
```

### 3. PostgreSQL Init Script

- [ ] Создать `docker/postgres/init.sql`:

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create test database for testing
CREATE DATABASE memento_mori_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE memento_mori_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE memento_mori_test TO postgres;
```

### 4. Backend Dockerfile

- [ ] Обновить `apps/server/Dockerfile`:

```dockerfile
# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ===== Stage 2: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build
RUN npm run build

# ===== Stage 3: Runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001
ENV PORT 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
```

### 5. Frontend Dockerfile (Next.js)

- [ ] Создать `apps/client/Dockerfile`:

```dockerfile
# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ===== Stage 2: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ===== Stage 3: Runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 6. Docker Ignore Files

- [ ] Создать `.dockerignore` в каждом app:

```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next
out

# Production
build
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea
.vscode

# Git
.git
.gitignore
```

### 7. Makefile для удобства

- [ ] Создать `Makefile`:

```makefile
.PHONY: help dev up down logs build clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Services started:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"
	@echo "  Mailhog: http://localhost:8025"
	@echo "  MinIO: http://localhost:9001"

up: ## Start production environment
	docker-compose up -d

down: ## Stop all containers
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

logs: ## Show logs
	docker-compose -f docker-compose.dev.yml logs -f

build: ## Build all images
	docker-compose build

clean: ## Clean up volumes and images
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	docker system prune -f

db-reset: ## Reset database
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS memento_mori_dev;"
	docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE memento_mori_dev;"
```

---

## Acceptance Criteria

- [ ] `docker-compose -f docker-compose.dev.yml up -d` запускает все сервисы
- [ ] PostgreSQL доступен на localhost:5432
- [ ] Redis доступен на localhost:6379
- [ ] Mailhog UI доступен на http://localhost:8025
- [ ] MinIO UI доступен на http://localhost:9001
- [ ] Все контейнеры проходят health checks
- [ ] Volumes сохраняют данные между перезапусками
- [ ] Makefile команды работают

---

## Definition of Done

- [ ] Все docker-compose файлы созданы
- [ ] Dockerfiles для всех сервисов созданы
- [ ] Health checks настроены
- [ ] Makefile создан
- [ ] Документация обновлена

