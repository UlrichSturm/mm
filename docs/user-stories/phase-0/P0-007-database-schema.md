# P0-007: Database Schema

**Epic:** E-000 Phase 0 - Подготовка  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Исполнитель:** Backend Lead  
**Срок:** Day 3  
**Статус:** ⬜ Не начато

---

## Описание

Создание полной схемы базы данных для MVP с использованием Prisma ORM.

---

## Задачи

### 1. Prisma Schema

- [ ] Создать `apps/server/prisma/schema.prisma`:

```prisma
// ================================================
// MEMENTO MORI - Database Schema
// ================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ================================================
// USER & AUTHENTICATION
// ================================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  phone     String?
  avatar    String?
  
  role      Role     @default(CLIENT)
  isBlocked Boolean  @default(false) @map("is_blocked")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  vendorProfile VendorProfile?
  orders        Order[]         @relation("ClientOrders")
  
  @@map("users")
}

enum Role {
  CLIENT
  VENDOR
  ADMIN
}

// ================================================
// VENDOR
// ================================================

model VendorProfile {
  id            String       @id @default(uuid())
  userId        String       @unique @map("user_id")
  
  businessName  String       @map("business_name")
  description   String?      @db.Text
  contactEmail  String?      @map("contact_email")
  contactPhone  String       @map("contact_phone")
  address       String
  postalCode    String       @map("postal_code")
  
  status          VendorStatus @default(PENDING)
  rejectionReason String?      @map("rejection_reason") @db.Text
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  services Service[]
  
  @@map("vendor_profiles")
}

enum VendorStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

// ================================================
// CATEGORY
// ================================================

model Category {
  id          String  @id @default(uuid())
  name        String  @unique
  description String? @db.Text
  icon        String?
  slug        String  @unique
  sortOrder   Int     @default(0) @map("sort_order")
  isActive    Boolean @default(true) @map("is_active")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  services Service[]
  
  @@map("categories")
}

// ================================================
// SERVICE
// ================================================

model Service {
  id          String  @id @default(uuid())
  vendorId    String  @map("vendor_id")
  categoryId  String? @map("category_id")
  
  name        String
  description String  @db.Text
  price       Decimal @db.Decimal(10, 2)
  images      String[]
  
  status ServiceStatus @default(ACTIVE)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  vendor   VendorProfile @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  category Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orders   Order[]
  
  @@index([vendorId])
  @@index([categoryId])
  @@index([status])
  @@index([createdAt])
  @@map("services")
}

enum ServiceStatus {
  ACTIVE
  INACTIVE
  PENDING_REVIEW
  DELETED
}

// ================================================
// ORDER
// ================================================

model Order {
  id         String  @id @default(uuid())
  orderNumber String @unique @map("order_number")
  clientId   String  @map("client_id")
  serviceId  String  @map("service_id")
  
  quantity   Int     @default(1)
  unitPrice  Decimal @map("unit_price") @db.Decimal(10, 2)
  totalPrice Decimal @map("total_price") @db.Decimal(10, 2)
  notes      String? @db.Text
  
  status OrderStatus @default(PENDING)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relations
  client  User    @relation("ClientOrders", fields: [clientId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  payment Payment?
  
  @@index([clientId])
  @@index([serviceId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// ================================================
// PAYMENT
// ================================================

model Payment {
  id              String  @id @default(uuid())
  orderId         String  @unique @map("order_id")
  
  stripePaymentId String? @map("stripe_payment_id")
  amount          Decimal @db.Decimal(10, 2)
  currency        String  @default("rub")
  
  status PaymentStatus @default(PENDING)
  
  paidAt    DateTime? @map("paid_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([stripePaymentId])
  @@index([status])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

### 2. Initial Migration

- [ ] Создать первую миграцию:

```bash
npx prisma migrate dev --name init
```

### 3. Migration Scripts

- [ ] Добавить scripts в `apps/server/package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio"
  }
}
```

### 4. ERD Documentation

- [ ] Создать `docs/DATABASE_SCHEMA.md`:

```markdown
# Database Schema

## Entity Relationship Diagram

\`\`\`
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │       │  VendorProfile   │       │   Category   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id           │──────<│ userId           │       │ id           │
│ email        │       │ businessName     │       │ name         │
│ password     │       │ contactPhone     │       │ description  │
│ firstName    │       │ address          │       │ slug         │
│ lastName     │       │ status           │       │ isActive     │
│ role         │       └────────┬─────────┘       └──────┬───────┘
│ isBlocked    │                │                        │
└──────┬───────┘                │                        │
       │                        │                        │
       │                        ▼                        ▼
       │               ┌──────────────┐                  │
       │               │   Service    │<─────────────────┘
       │               ├──────────────┤
       │               │ id           │
       │               │ vendorId     │
       │               │ categoryId   │
       │               │ name         │
       │               │ price        │
       │               │ status       │
       │               └──────┬───────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    Order     │       │   Payment    │
├──────────────┤       ├──────────────┤
│ id           │──────>│ orderId      │
│ clientId     │       │ stripeId     │
│ serviceId    │       │ amount       │
│ quantity     │       │ status       │
│ totalPrice   │       └──────────────┘
│ status       │
└──────────────┘
\`\`\`

## Tables

### users
Primary table for all users (clients, vendors, admins).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password |
| role | ENUM | CLIENT, VENDOR, ADMIN |

### vendor_profiles
Extended profile for vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| business_name | VARCHAR | Company name |
| status | ENUM | PENDING, APPROVED, REJECTED |

### categories
Service categories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Unique category name |
| slug | VARCHAR | URL-friendly name |

### services
Services offered by vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | FK to vendor_profiles |
| category_id | UUID | FK to categories (nullable) |
| name | VARCHAR | Service name |
| price | DECIMAL | Price in RUB |
| status | ENUM | ACTIVE, INACTIVE, DELETED |

### orders
Customer orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | VARCHAR | Human-readable order number |
| client_id | UUID | FK to users |
| service_id | UUID | FK to services |
| status | ENUM | PENDING, CONFIRMED, COMPLETED |

### payments
Payment records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to orders (unique) |
| stripe_payment_id | VARCHAR | Stripe payment intent ID |
| status | ENUM | PENDING, COMPLETED, FAILED |

## Indexes

- `users.email` - Unique index for login
- `services.vendor_id` - Filter by vendor
- `services.category_id` - Filter by category
- `services.status` - Filter by status
- `orders.client_id` - Filter by client
- `orders.status` - Filter by status
- `payments.stripe_payment_id` - Lookup by Stripe ID
\`\`\`

### 5. Database Utilities

- [ ] Создать `apps/server/src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    
    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }
  }
}
```

- [ ] Создать `apps/server/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## Acceptance Criteria

- [ ] Prisma schema создана со всеми моделями
- [ ] Миграция успешно применяется
- [ ] Индексы созданы для основных запросов
- [ ] ERD документация написана
- [ ] PrismaService работает
- [ ] `npm run db:studio` открывает Prisma Studio

---

## Definition of Done

- [ ] Schema создана и протестирована
- [ ] Миграция работает
- [ ] Документация актуальна
- [ ] Prisma Studio доступен

