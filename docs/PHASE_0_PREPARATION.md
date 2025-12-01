# 🚀 Phase 0: Подготовка к разработке

**Дата создания:** 2025-12-01  
**Статус:** В работе  
**Продолжительность:** 1-2 недели  
**Приоритет:** 🔴 Критический (блокирует разработку)

---

## 📋 Обзор

Phase 0 включает все подготовительные задачи, которые **необходимо завершить до начала разработки MVP**. Это фундамент проекта, без которого невозможна эффективная командная работа.

---

## ✅ Чеклист задач

### 1. 📚 Документация

#### 1.1 Техническая документация
- [ ] **PRD (Product Requirements Document)** - Требования к продукту
- [ ] **Technical Architecture Document** - Архитектура системы
- [ ] **API Design Document** - Спецификация API (OpenAPI/Swagger)
- [ ] **Database Schema Design** - Схема базы данных
- [ ] **Security Requirements** - Требования безопасности
- [ ] **Integration Specifications** - Спецификации интеграций (Stripe, Email)

#### 1.2 Процессные документы
- [ ] **Development Guidelines** - Стандарты разработки
- [ ] **Code Style Guide** - Стиль кода (ESLint, Prettier конфиги)
- [ ] **Git Flow Document** - Процесс работы с Git
- [ ] **PR Review Checklist** - Чеклист для code review
- [ ] **Definition of Done** - Критерии готовности задач

#### 1.3 Дизайн документация
- [ ] **UI/UX Wireframes** - Макеты интерфейсов
- [ ] **Design System** - Компоненты и стили
- [ ] **Brand Guidelines** - Брендбук (цвета, шрифты, логотипы)
- [ ] **User Flows** - Пользовательские сценарии

---

### 2. ⚙️ Настройка окружения разработки

#### 2.1 Репозиторий и CI/CD
- [ ] **GitHub Repository Setup**
  - [ ] Создать организацию/репозиторий
  - [ ] Настроить branch protection rules
  - [ ] Добавить CODEOWNERS
  - [ ] Настроить issue templates
  - [ ] Настроить PR templates

- [ ] **CI/CD Pipeline (GitHub Actions)**
  - [ ] Lint & Format check
  - [ ] Unit tests
  - [ ] Build check
  - [ ] Security scan (Snyk/Dependabot)
  - [ ] Auto-deploy to staging

#### 2.2 Development Environment
- [ ] **Docker Setup**
  - [ ] docker-compose.yml для local dev
  - [ ] Dockerfiles для всех сервисов
  - [ ] Hot reload в контейнерах

- [ ] **Local Development**
  - [ ] README с инструкциями
  - [ ] .env.example файлы
  - [ ] Seed scripts для БД
  - [ ] Mock data generators

#### 2.3 Shared Configurations
- [ ] **ESLint Configuration**
  - [ ] Backend (NestJS) config
  - [ ] Frontend (Next.js) config
  - [ ] Shared rules

- [ ] **Prettier Configuration**
  - [ ] .prettierrc
  - [ ] .prettierignore

- [ ] **TypeScript Configuration**
  - [ ] Strict mode
  - [ ] Path aliases
  - [ ] Shared types package

- [ ] **Husky & Lint-staged**
  - [ ] Pre-commit hooks
  - [ ] Commit message validation (Commitlint)

---

### 3. 🔐 Безопасность и секреты

#### 3.1 Secrets Management
- [ ] **Environment Variables**
  - [ ] Документировать все переменные
  - [ ] Создать .env.example
  - [ ] Настроить GitHub Secrets
  - [ ] Настроить Vercel/Railway secrets

- [ ] **API Keys & Credentials**
  - [ ] Stripe Test Keys
  - [ ] Mailgun/SendGrid API Key
  - [ ] JWT Secret generation
  - [ ] Database credentials

#### 3.2 Security Policies
- [ ] **CORS Configuration**
- [ ] **Rate Limiting Policy**
- [ ] **Authentication Flow**
- [ ] **Data Encryption Policy**

---

### 4. 🗄️ База данных

#### 4.1 Database Setup
- [ ] **PostgreSQL Setup**
  - [ ] Docker container config
  - [ ] Production database (Supabase/Railway)
  - [ ] Backup strategy

- [ ] **Prisma Setup**
  - [ ] Initial schema
  - [ ] Migrations workflow
  - [ ] Seed scripts

#### 4.2 Schema Design
- [ ] **ERD (Entity Relationship Diagram)**
- [ ] **All models documented**
- [ ] **Indexes planned**
- [ ] **Relations validated**

---

### 5. 🛠️ Инструменты и сервисы

#### 5.1 Development Tools
- [ ] **IDE Setup**
  - [ ] VSCode settings.json
  - [ ] Recommended extensions
  - [ ] Debug configurations

- [ ] **Testing Tools**
  - [ ] Jest configuration
  - [ ] Testing Library setup
  - [ ] E2E testing (Playwright/Cypress)

#### 5.2 External Services
- [ ] **Stripe Account**
  - [ ] Test mode setup
  - [ ] Webhook endpoints
  - [ ] Products/Prices setup

- [ ] **Email Service**
  - [ ] Mailgun/SendGrid account
  - [ ] Domain verification
  - [ ] Email templates

- [ ] **Hosting/Deployment**
  - [ ] Vercel (Frontend)
  - [ ] Railway/Render (Backend)
  - [ ] Domain setup

- [ ] **Monitoring & Logging**
  - [ ] Sentry setup (error tracking)
  - [ ] LogRocket/Datadog (optional)

---

### 6. 📊 Project Management

#### 6.1 Task Management
- [ ] **Project Board Setup**
  - [ ] GitHub Projects / Jira / Linear
  - [ ] Columns: Backlog, Todo, In Progress, Review, Done
  - [ ] Labels setup

- [ ] **Sprint Planning**
  - [ ] Sprint 1 backlog готов
  - [ ] Story points присвоены
  - [ ] Зависимости определены

#### 6.2 Communication
- [ ] **Slack/Discord Channel**
- [ ] **Daily Standup Schedule**
- [ ] **Sprint Review/Retro Schedule**

---

### 7. 📝 API Documentation

#### 7.1 OpenAPI/Swagger
- [ ] **Swagger Setup in NestJS**
  - [ ] @nestjs/swagger installed
  - [ ] Global config
  - [ ] Auth decorators

- [ ] **API Endpoints Documented**
  - [ ] Auth endpoints
  - [ ] Vendors endpoints
  - [ ] Services endpoints
  - [ ] Orders endpoints
  - [ ] Payments endpoints
  - [ ] Admin endpoints

#### 7.2 Postman/Insomnia
- [ ] **Collection Created**
- [ ] **Environment Variables**
- [ ] **Example Requests**
- [ ] **Tests/Scripts**

---

## 📁 Файлы для создания

### Конфигурационные файлы

```
project-root/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # CI pipeline
│   │   ├── deploy.yml       # Deploy pipeline
│   │   └── security.yml     # Security scan
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── task.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .vscode/
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_DESIGN.md
│   ├── DATABASE_SCHEMA.md
│   ├── SECURITY.md
│   ├── DEVELOPMENT.md
│   └── DEPLOYMENT.md
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── commitlint.config.js
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## 📋 Детальные задачи

### P0-001: Настройка GitHub Repository

**Приоритет:** 🔴 Critical  
**Исполнитель:** Tech Lead  
**Срок:** Day 1

**Задачи:**
- [ ] Создать репозиторий с правильной структурой
- [ ] Настроить branch protection для `main`
  - Require PR reviews (min 1)
  - Require status checks
  - Require linear history
- [ ] Добавить CODEOWNERS файл
- [ ] Создать issue templates
- [ ] Создать PR template
- [ ] Добавить README.md с инструкциями

---

### P0-002: CI/CD Pipeline

**Приоритет:** 🔴 Critical  
**Исполнитель:** DevOps/Tech Lead  
**Срок:** Day 1-2

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

### P0-003: Docker Setup

**Приоритет:** 🔴 Critical  
**Исполнитель:** DevOps/Backend  
**Срок:** Day 2

**docker-compose.dev.yml:**

```yaml
version: '3.8'

services:
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

  redis:
    image: redis:7-alpine
    container_name: mm-redis-dev
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    container_name: mm-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_dev_data:
```

---

### P0-004: ESLint & Prettier Configuration

**Приоритет:** 🟡 High  
**Исполнитель:** Frontend Lead  
**Срок:** Day 2

**.eslintrc.js (shared):**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

**.prettierrc:**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

---

### P0-005: Husky & Commitlint Setup

**Приоритет:** 🟡 High  
**Исполнитель:** Tech Lead  
**Срок:** Day 2

**Установка:**

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

**commitlint.config.js:**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Refactoring
        'test',     // Tests
        'chore',    // Maintenance
        'ci',       // CI/CD
        'perf',     // Performance
        'revert',   // Revert
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};
```

**.husky/pre-commit:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**.husky/commit-msg:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

---

### P0-006: Environment Variables

**Приоритет:** 🔴 Critical  
**Исполнитель:** Tech Lead  
**Срок:** Day 1

**.env.example:**

```env
# App
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/memento_mori_dev?schema=public

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRATION=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Email
MAILGUN_API_KEY=xxx
MAILGUN_DOMAIN=sandbox.mailgun.org
EMAIL_FROM=noreply@mementomori.ru

# Frontend URLs
CLIENT_URL=http://localhost:3000
VENDOR_URL=http://localhost:3002
ADMIN_URL=http://localhost:3003

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

---

### P0-007: Database Schema

**Приоритет:** 🔴 Critical  
**Исполнитель:** Backend Lead  
**Срок:** Day 3

**prisma/schema.prisma:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User & Auth
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(CLIENT)
  isBlocked Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  vendorProfile VendorProfile?
  orders        Order[]        @relation("ClientOrders")
}

enum Role {
  CLIENT
  VENDOR
  ADMIN
}

// Vendor
model VendorProfile {
  id            String       @id @default(uuid())
  userId        String       @unique
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  businessName  String
  description   String?
  contactEmail  String?
  contactPhone  String
  address       String
  postalCode    String
  
  status          VendorStatus @default(PENDING)
  rejectionReason String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  services Service[]
}

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

// Service
model Service {
  id          String        @id @default(uuid())
  vendorId    String
  vendor      VendorProfile @relation(fields: [vendorId], references: [id])
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  
  name        String
  description String
  price       Decimal       @db.Decimal(10, 2)
  images      String[]
  
  status ServiceStatus @default(ACTIVE)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  orders Order[]
  
  @@index([vendorId])
  @@index([categoryId])
  @@index([status])
}

enum ServiceStatus {
  ACTIVE
  INACTIVE
  PENDING_REVIEW
  DELETED
}

// Category
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  icon        String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  services Service[]
}

// Order
model Order {
  id         String      @id @default(uuid())
  clientId   String
  client     User        @relation("ClientOrders", fields: [clientId], references: [id])
  serviceId  String
  service    Service     @relation(fields: [serviceId], references: [id])
  
  quantity   Int         @default(1)
  totalPrice Decimal     @db.Decimal(10, 2)
  notes      String?
  
  status OrderStatus @default(PENDING)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  payment Payment?
  
  @@index([clientId])
  @@index([serviceId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// Payment
model Payment {
  id              String        @id @default(uuid())
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  
  stripePaymentId String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("rub")
  
  status PaymentStatus @default(PENDING)
  
  paidAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

### P0-008: Swagger/OpenAPI Setup

**Приоритет:** 🟡 High  
**Исполнитель:** Backend Lead  
**Срок:** Day 3

**main.ts (NestJS):**

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // CORS
  app.enableCors({
    origin: [
      process.env.CLIENT_URL,
      process.env.VENDOR_URL,
      process.env.ADMIN_URL,
    ],
    credentials: true,
  });
  
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Memento Mori API')
    .setDescription('API documentation for Memento Mori platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('vendors', 'Vendor management')
    .addTag('services', 'Services catalog')
    .addTag('orders', 'Orders management')
    .addTag('payments', 'Payments')
    .addTag('admin', 'Admin endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
```

---

### P0-009: Seed Data Script

**Приоритет:** 🟡 High  
**Исполнитель:** Backend  
**Срок:** Day 4

**prisma/seed.ts:**

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mementomori.ru' },
    update: {},
    create: {
      email: 'admin@mementomori.ru',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Ритуальные услуги' },
      update: {},
      create: { name: 'Ритуальные услуги', description: 'Организация похорон', icon: 'funeral' },
    }),
    prisma.category.upsert({
      where: { name: 'Юридические услуги' },
      update: {},
      create: { name: 'Юридические услуги', description: 'Оформление документов', icon: 'legal' },
    }),
    prisma.category.upsert({
      where: { name: 'Транспорт' },
      update: {},
      create: { name: 'Транспорт', description: 'Катафалк и транспортные услуги', icon: 'transport' },
    }),
  ]);
  console.log('Categories created:', categories.length);

  // Create Test Vendor
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@test.com' },
    update: {},
    create: {
      email: 'vendor@test.com',
      password: vendorPassword,
      firstName: 'Тестовый',
      lastName: 'Поставщик',
      role: 'VENDOR',
    },
  });
  
  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: 'Тестовые Ритуальные Услуги',
      contactPhone: '+7 999 123-45-67',
      address: 'г. Москва, ул. Тестовая, д. 1',
      postalCode: '123456',
      status: 'APPROVED',
    },
  });
  console.log('Vendor created:', vendorUser.email);

  // Create Test Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        vendorId: vendorProfile.id,
        categoryId: categories[0].id,
        name: 'Организация похорон под ключ',
        description: 'Полный комплекс ритуальных услуг',
        price: 45000,
        images: [],
      },
    }),
    prisma.service.create({
      data: {
        vendorId: vendorProfile.id,
        categoryId: categories[1].id,
        name: 'Оформление документов',
        description: 'Юридическое сопровождение',
        price: 15000,
        images: [],
      },
    }),
  ]);
  console.log('Services created:', services.length);

  // Create Test Client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      password: clientPassword,
      firstName: 'Тестовый',
      lastName: 'Клиент',
      role: 'CLIENT',
    },
  });
  console.log('Client created:', client.email);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### P0-010: External Services Setup

**Приоритет:** 🟡 High  
**Исполнитель:** Tech Lead  
**Срок:** Day 4-5

#### Stripe Setup
- [ ] Создать Stripe аккаунт
- [ ] Получить test keys
- [ ] Настроить webhook endpoint
- [ ] Создать тестовые Products/Prices

#### Email Setup
- [ ] Создать Mailgun/SendGrid аккаунт
- [ ] Верифицировать домен
- [ ] Создать API key
- [ ] Создать email templates

#### Hosting Setup
- [ ] Vercel аккаунт для frontend
- [ ] Railway/Render для backend
- [ ] PostgreSQL database (Supabase/Railway)
- [ ] Настроить custom domains

---

## 📅 Timeline

| День | Задачи | Ответственный |
|:----:|--------|---------------|
| 1 | P0-001, P0-006 | Tech Lead |
| 2 | P0-002, P0-003, P0-004, P0-005 | DevOps, Frontend |
| 3 | P0-007, P0-008 | Backend |
| 4 | P0-009, P0-010 (start) | Backend, Tech Lead |
| 5 | P0-010 (finish), Testing | All |

---

## ✅ Definition of Done для Phase 0

Phase 0 считается завершенной когда:

- [ ] Все разработчики могут клонировать репозиторий
- [ ] `docker-compose up` запускает все сервисы
- [ ] CI pipeline проходит успешно
- [ ] Swagger документация доступна
- [ ] База данных создается и заполняется seed данными
- [ ] Все внешние сервисы настроены (Stripe test mode, Email)
- [ ] README содержит полные инструкции по запуску
- [ ] Первый спринт спланирован

---

## 🚦 Статус задач

| ID | Задача | Статус |
|----|--------|:------:|
| P0-001 | GitHub Repository Setup | ⬜ |
| P0-002 | CI/CD Pipeline | ⬜ |
| P0-003 | Docker Setup | ⬜ |
| P0-004 | ESLint & Prettier | ⬜ |
| P0-005 | Husky & Commitlint | ⬜ |
| P0-006 | Environment Variables | ⬜ |
| P0-007 | Database Schema | ⬜ |
| P0-008 | Swagger Setup | ⬜ |
| P0-009 | Seed Data | ⬜ |
| P0-010 | External Services | ⬜ |

---

**Последнее обновление:** 2025-12-01

