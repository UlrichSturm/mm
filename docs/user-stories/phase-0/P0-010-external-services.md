# P0-010: External Services Setup

**Epic:** E-000 Phase 0 - Подготовка
**Приоритет:** 🟡 High
**Story Points:** 3
**Исполнитель:** Tech Lead
**Срок:** Day 4-5
**Статус:** ✅ Выполнено

---

## Описание

Настройка и интеграция внешних сервисов: Stripe (платежи), Email (Mailgun/SendGrid), File Storage (MinIO/S3).

---

## Задачи

### 1. Stripe Setup

#### 1.1 Create Stripe Account

- [ ] Создать аккаунт на https://stripe.com
- [ ] Активировать Test Mode
- [ ] Получить API ключи:
  - Secret Key (sk*test*...)
  - Publishable Key (pk*test*...)

#### 1.2 Configure Webhook

- [ ] Создать Webhook endpoint в Stripe Dashboard
- [ ] Указать URL: `https://api.mementomori.ru/api/payments/webhook`
- [ ] Для локальной разработки использовать Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3001/api/payments/webhook
```

- [ ] Получить Webhook Secret (whsec\_...)

#### 1.3 Stripe Module

- [ ] Создать `apps/server/src/stripe/stripe.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET_KEY'), {
          apiVersion: '2023-10-16',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [STRIPE_CLIENT],
})
export class StripeModule {}
```

#### 1.4 Test Card Numbers

| Card          | Number           | Use                |
| ------------- | ---------------- | ------------------ |
| Success       | 4242424242424242 | Successful payment |
| Decline       | 4000000000000002 | Card declined      |
| Requires Auth | 4000002500003155 | 3D Secure required |
| Insufficient  | 4000000000009995 | Insufficient funds |

---

### 2. Email Setup (Mailgun)

#### 2.1 Create Mailgun Account

- [ ] Создать аккаунт на https://mailgun.com
- [ ] Добавить sandbox domain для тестов
- [ ] Получить API Key

#### 2.2 Domain Configuration (Production)

- [ ] Добавить домен mail.mementomori.ru
- [ ] Настроить DNS записи:
  - SPF record
  - DKIM record
  - MX records (optional)
- [ ] Верифицировать домен

#### 2.3 Email Module

- [ ] Установить зависимости:

```bash
npm install nodemailer @nestjs-modules/mailer handlebars
```

- [ ] Создать `apps/server/src/email/email.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST', 'smtp.mailgun.org'),
          port: configService.get('SMTP_PORT', 587),
          secure: false,
          auth: {
            user: configService.get('MAILGUN_SMTP_USER'),
            pass: configService.get('MAILGUN_SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get('EMAIL_FROM', 'Memento Mori <noreply@mementomori.ru>'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

#### 2.4 Email Templates

- [ ] Создать базовые шаблоны в `apps/server/src/email/templates/`:

```handlebars
{{! templates/layouts/main.hbs }}

<html>
  <head>
    <meta charset='utf-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>{{subject}}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: #1a1a2e;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
        background: #f5f5f5;
      }
      .footer {
        padding: 20px;
        text-align: center;
        color: #666;
        font-size: 12px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background: #4f46e5;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <div class='container'>
      <div class='header'>
        <h1>🪦 Memento Mori</h1>
      </div>
      <div class='content'>
        {{{body}}}
      </div>
      <div class='footer'>
        <p>© 2025 Memento Mori. Все права защищены.</p>
        <p>Это автоматическое сообщение, не отвечайте на него.</p>
      </div>
    </div>
  </body>
</html>
```

```handlebars
{{! templates/welcome.hbs }}
<h2>Добро пожаловать, {{firstName}}!</h2>
<p>Спасибо за регистрацию на платформе Memento Mori.</p>
<p>Теперь вы можете:</p>
<ul>
  <li>Просматривать каталог услуг</li>
  <li>Делать заказы</li>
  <li>Отслеживать статус заказов</li>
</ul>
<p>
  <a href='{{appUrl}}/services' class='button'>Перейти к каталогу</a>
</p>
```

#### 2.5 Development Email (Mailhog)

- [ ] Для разработки использовать Mailhog (включен в docker-compose.dev.yml)
- [ ] Web UI доступен на http://localhost:8025

---

### 3. File Storage (MinIO/S3)

#### 3.1 MinIO for Development

- [ ] MinIO включен в docker-compose.dev.yml
- [ ] Console доступна на http://localhost:9001
- [ ] Credentials: minioadmin/minioadmin

#### 3.2 Create Bucket

- [ ] Создать bucket `memento-mori` в MinIO Console
- [ ] Настроить public access для images

#### 3.3 Storage Module

- [ ] Установить зависимости:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

- [ ] Создать `apps/server/src/storage/storage.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get('S3_ENDPOINT'),
      region: this.configService.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_KEY'),
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.bucket = this.configService.get('S3_BUCKET', 'memento-mori');
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    folder = 'uploads',
  ): Promise<string> {
    const key = `${folder}/${uuid()}-${filename}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimetype,
      }),
    );

    this.logger.log(`File uploaded: ${key}`);
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`File deleted: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    const endpoint = this.configService.get('S3_ENDPOINT');
    return `${endpoint}/${this.bucket}/${key}`;
  }
}
```

---

### 4. Error Tracking (Sentry)

#### 4.1 Create Sentry Account

- [ ] Создать аккаунт на https://sentry.io
- [ ] Создать проект для Backend (Node.js)
- [ ] Создать проект для Frontend (Next.js)
- [ ] Получить DSN ключи

#### 4.2 Install Sentry

```bash
# Backend
npm install @sentry/node @sentry/tracing

# Frontend
npm install @sentry/nextjs
```

#### 4.3 Configure Sentry (Optional for MVP)

```typescript
// apps/server/src/main.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

---

### 5. Documentation

- [ ] Создать `docs/EXTERNAL_SERVICES.md`:

```markdown
# External Services

## Stripe

### Test Mode

- Dashboard: https://dashboard.stripe.com/test
- API Keys: Settings > API Keys
- Webhooks: Developers > Webhooks

### Local Development

\`\`\`bash
stripe listen --forward-to localhost:3001/api/payments/webhook
\`\`\`

### Test Cards

| Card    | Number              |
| ------- | ------------------- |
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |

## Email (Mailgun)

### Development

- Use Mailhog: http://localhost:8025
- SMTP: localhost:1025

### Production

- Domain: mail.mementomori.ru
- Dashboard: https://app.mailgun.com

## File Storage

### Development (MinIO)

- Console: http://localhost:9001
- Credentials: minioadmin/minioadmin
- Bucket: memento-mori

### Production (AWS S3)

- Bucket: memento-mori-prod
- Region: eu-central-1

## Sentry (Error Tracking)

- Dashboard: https://sentry.io
- DSN: See .env
```

---

## Acceptance Criteria

- [ ] Stripe test mode работает
- [ ] Webhook обрабатывает события
- [ ] Email отправляется через Mailhog
- [ ] Файлы загружаются в MinIO
- [ ] Все credentials задокументированы
- [ ] Команда может настроить сервисы

---

## Definition of Done

- [ ] Все сервисы настроены
- [ ] Модули созданы и работают
- [ ] Документация написана
- [ ] Локальная разработка возможна
