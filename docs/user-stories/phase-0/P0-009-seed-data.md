# P0-009: Seed Data

**Epic:** E-000 Phase 0 - Подготовка
**Приоритет:** 🟡 High
**Story Points:** 2
**Исполнитель:** Backend
**Срок:** Day 4
**Статус:** ✅ Выполнено

---

## Описание

Создание seed скриптов для заполнения базы данных тестовыми данными для разработки.

---

## Задачи

### 1. Main Seed Script

- [ ] Создать `apps/server/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clean database (only in development)
  if (process.env.NODE_ENV !== 'production') {
    await cleanDatabase();
  }

  // Seed data
  await seedUsers();
  await seedCategories();
  await seedVendors();
  await seedServices();
  await seedOrders();

  console.log('\n✅ Seed completed!');
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('   Database cleaned');
}

async function seedUsers() {
  console.log('👥 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mementomori.ru' },
    update: {},
    create: {
      email: 'admin@mementomori.ru',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log(`   Created admin: ${admin.email}`);

  // Test clients
  const clients = [
    { email: 'client1@test.com', firstName: 'Иван', lastName: 'Петров' },
    { email: 'client2@test.com', firstName: 'Мария', lastName: 'Иванова' },
    { email: 'client3@test.com', firstName: 'Алексей', lastName: 'Сидоров' },
  ];

  for (const client of clients) {
    await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: {
        ...client,
        password: hashedPassword,
        role: 'CLIENT',
      },
    });
    console.log(`   Created client: ${client.email}`);
  }
}

async function seedCategories() {
  console.log('📁 Seeding categories...');

  const categories = [
    {
      name: 'Ритуальные услуги',
      description: 'Полный комплекс услуг по организации похорон',
      icon: 'funeral',
      slug: 'ritual-services',
      sortOrder: 1,
    },
    {
      name: 'Транспорт',
      description: 'Катафалк и транспортные услуги',
      icon: 'transport',
      slug: 'transport',
      sortOrder: 2,
    },
    {
      name: 'Юридические услуги',
      description: 'Оформление документов и наследства',
      icon: 'legal',
      slug: 'legal-services',
      sortOrder: 3,
    },
    {
      name: 'Памятники',
      description: 'Изготовление и установка памятников',
      icon: 'monument',
      slug: 'monuments',
      sortOrder: 4,
    },
    {
      name: 'Цветы и венки',
      description: 'Траурные букеты и венки',
      icon: 'flowers',
      slug: 'flowers',
      sortOrder: 5,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`   Created category: ${category.name}`);
  }
}

async function seedVendors() {
  console.log('🏪 Seeding vendors...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const vendors = [
    {
      email: 'vendor1@test.com',
      firstName: 'Петр',
      lastName: 'Кузнецов',
      businessName: 'Ритуальное агентство "Память"',
      contactPhone: '+7 (999) 111-11-11',
      address: 'г. Москва, ул. Мира, д. 15',
      postalCode: '101000',
      status: 'APPROVED' as const,
    },
    {
      email: 'vendor2@test.com',
      firstName: 'Елена',
      lastName: 'Смирнова',
      businessName: 'Юридическая компания "Наследие"',
      contactPhone: '+7 (999) 222-22-22',
      address: 'г. Москва, ул. Правды, д. 8',
      postalCode: '101001',
      status: 'APPROVED' as const,
    },
    {
      email: 'vendor3@test.com',
      firstName: 'Сергей',
      lastName: 'Волков',
      businessName: 'Транспортная служба "Путь"',
      contactPhone: '+7 (999) 333-33-33',
      address: 'г. Москва, ул. Транспортная, д. 3',
      postalCode: '101002',
      status: 'APPROVED' as const,
    },
    {
      email: 'vendor4@test.com',
      firstName: 'Анна',
      lastName: 'Козлова',
      businessName: 'Цветочный салон "Вечность"',
      contactPhone: '+7 (999) 444-44-44',
      address: 'г. Москва, ул. Цветочная, д. 12',
      postalCode: '101003',
      status: 'PENDING' as const,
    },
  ];

  for (const vendor of vendors) {
    const user = await prisma.user.upsert({
      where: { email: vendor.email },
      update: {},
      create: {
        email: vendor.email,
        password: hashedPassword,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        role: 'VENDOR',
      },
    });

    await prisma.vendorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        businessName: vendor.businessName,
        contactPhone: vendor.contactPhone,
        address: vendor.address,
        postalCode: vendor.postalCode,
        status: vendor.status,
      },
    });

    console.log(`   Created vendor: ${vendor.businessName} (${vendor.status})`);
  }
}

async function seedServices() {
  console.log('📦 Seeding services...');

  const vendors = await prisma.vendorProfile.findMany({
    where: { status: 'APPROVED' },
    include: { user: true },
  });

  const categories = await prisma.category.findMany();

  const servicesData = [
    {
      vendorEmail: 'vendor1@test.com',
      categorySlug: 'ritual-services',
      services: [
        {
          name: 'Организация похорон под ключ',
          description:
            'Полный комплекс услуг: гроб, венок, транспорт, оформление документов, организация поминок',
          price: 45000,
        },
        {
          name: 'Кремация',
          description: 'Организация кремации с последующей выдачей праха',
          price: 25000,
        },
        {
          name: 'Эконом-пакет',
          description: 'Базовый набор ритуальных услуг',
          price: 20000,
        },
      ],
    },
    {
      vendorEmail: 'vendor2@test.com',
      categorySlug: 'legal-services',
      services: [
        {
          name: 'Оформление наследства',
          description: 'Полное юридическое сопровождение вступления в наследство',
          price: 30000,
        },
        {
          name: 'Оформление завещания',
          description: 'Составление и нотариальное заверение завещания',
          price: 15000,
        },
        {
          name: 'Консультация юриста',
          description: 'Часовая консультация по вопросам наследства',
          price: 3000,
        },
      ],
    },
    {
      vendorEmail: 'vendor3@test.com',
      categorySlug: 'transport',
      services: [
        {
          name: 'Катафалк на день',
          description: 'Аренда катафалка с водителем на весь день',
          price: 15000,
        },
        {
          name: 'Перевозка тела',
          description: 'Перевозка тела в пределах города',
          price: 8000,
        },
        {
          name: 'Междугородняя перевозка',
          description: 'Перевозка тела между городами (за км)',
          price: 50,
        },
      ],
    },
  ];

  for (const vendorServices of servicesData) {
    const vendor = vendors.find(v => v.user.email === vendorServices.vendorEmail);
    const category = categories.find(c => c.slug === vendorServices.categorySlug);

    if (!vendor || !category) continue;

    for (const service of vendorServices.services) {
      await prisma.service.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          name: service.name,
          description: service.description,
          price: service.price,
          status: 'ACTIVE',
          images: [],
        },
      });
      console.log(`   Created service: ${service.name}`);
    }
  }
}

async function seedOrders() {
  console.log('🛒 Seeding orders...');

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
  });

  const services = await prisma.service.findMany({
    where: { status: 'ACTIVE' },
  });

  if (clients.length === 0 || services.length === 0) {
    console.log('   Skipping orders (no clients or services)');
    return;
  }

  const orderStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] as const;

  let orderCount = 1;
  for (const client of clients.slice(0, 2)) {
    for (let i = 0; i < 3; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const unitPrice = Number(service.price);
      const totalPrice = unitPrice * quantity;

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${String(orderCount++).padStart(6, '0')}`,
          clientId: client.id,
          serviceId: service.id,
          quantity,
          unitPrice,
          totalPrice,
          status,
          notes: status === 'PENDING' ? 'Ожидает подтверждения' : null,
        },
      });

      // Create payment for completed orders
      if (status === 'COMPLETED') {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: totalPrice,
            currency: 'rub',
            status: 'COMPLETED',
            stripePaymentId: `pi_test_${order.id.slice(0, 8)}`,
            paidAt: new Date(),
          },
        });
      }

      console.log(`   Created order: ${order.orderNumber} (${status})`);
    }
  }
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2. Configure Prisma Seed

- [ ] Добавить в `apps/server/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### 3. Test Credentials Document

- [ ] Создать `docs/TEST_CREDENTIALS.md`:

```markdown
# Test Credentials

## Development Environment

### Admin

- Email: `admin@mementomori.ru`
- Password: `password123`

### Clients

| Email            | Password    | Name            |
| ---------------- | ----------- | --------------- |
| client1@test.com | password123 | Иван Петров     |
| client2@test.com | password123 | Мария Иванова   |
| client3@test.com | password123 | Алексей Сидоров |

### Vendors (Approved)

| Email            | Password    | Business                        |
| ---------------- | ----------- | ------------------------------- |
| vendor1@test.com | password123 | Ритуальное агентство "Память"   |
| vendor2@test.com | password123 | Юридическая компания "Наследие" |
| vendor3@test.com | password123 | Транспортная служба "Путь"      |

### Vendors (Pending)

| Email            | Password    | Business                   |
| ---------------- | ----------- | -------------------------- |
| vendor4@test.com | password123 | Цветочный салон "Вечность" |

## Running Seed

\`\`\`bash
npm run db:seed
\`\`\`

## Reset Database

\`\`\`bash
npm run db:reset
\`\`\`

> ⚠️ **Warning**: Reset will delete all data!
```

---

## Acceptance Criteria

- [ ] `npm run db:seed` создает тестовые данные
- [ ] Создаются пользователи всех ролей
- [ ] Создаются категории
- [ ] Создаются vendors с разными статусами
- [ ] Создаются services
- [ ] Создаются orders и payments
- [ ] Повторный запуск не дублирует данные

---

## Definition of Done

- [ ] Seed скрипт работает
- [ ] Test credentials документированы
- [ ] Данные соответствуют схеме
- [ ] Команда может использовать seed
