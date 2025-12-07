# External Services

This document describes the external services used by Memento Mori and how to configure them.

## Overview

| Service     | Purpose        | Development       | Production         |
| ----------- | -------------- | ----------------- | ------------------ |
| **Stripe**  | Payments       | Test Mode         | Live Mode          |
| **Email**   | Notifications  | Mailhog           | Mailgun/SendGrid   |
| **Storage** | File uploads   | MinIO             | AWS S3             |
| **Auth**    | Authentication | Keycloak (Docker) | Keycloak (Managed) |

---

## Stripe (Payments)

### Dashboard

- Test: https://dashboard.stripe.com/test
- Live: https://dashboard.stripe.com

### Configuration

```env
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Local Development with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/payments/webhook

# Copy the webhook signing secret from the output
# whsec_...
```

### Test Card Numbers

| Card            | Number                | Use Case                |
| --------------- | --------------------- | ----------------------- |
| ✅ Success      | `4242 4242 4242 4242` | Successful payment      |
| ❌ Decline      | `4000 0000 0000 0002` | Card declined           |
| 🔐 3D Secure    | `4000 0025 0000 3155` | Requires authentication |
| 💰 Insufficient | `4000 0000 0000 9995` | Insufficient funds      |

Use any future date for expiry and any 3-digit CVC.

### Stripe Connect (Vendor Payouts)

1. Create Connect Express account for vendor
2. Generate onboarding link
3. Vendor completes onboarding
4. Platform can transfer funds to vendor

---

## Email

### Development (Mailhog)

Mailhog is included in `docker-compose.dev.yml`.

- **Web UI**: http://localhost:8025
- **SMTP Host**: localhost
- **SMTP Port**: 1025

All emails sent in development are captured by Mailhog.

```env
# Development
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
```

### Production (Mailgun)

1. Create account at https://mailgun.com
2. Add and verify domain
3. Configure DNS records (SPF, DKIM)

```env
# Production
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mail.mementomori.de
SMTP_PASS=your-mailgun-smtp-password
EMAIL_FROM=Memento Mori <noreply@mementomori.de>
```

### Email Templates

Templates are located in `apps/server/src/email/templates/`:

| Template                   | Purpose              |
| -------------------------- | -------------------- |
| `welcome.hbs`              | Welcome new users    |
| `order-confirmation.hbs`   | Order placed         |
| `order-status.hbs`         | Order status update  |
| `vendor-approval.hbs`      | Vendor approved      |
| `vendor-rejection.hbs`     | Vendor rejected      |
| `password-reset.hbs`       | Password reset link  |
| `appointment-reminder.hbs` | Appointment reminder |

---

## File Storage

### Development (MinIO)

MinIO is included in `docker-compose.dev.yml`.

- **API Endpoint**: http://localhost:9000
- **Console**: http://localhost:9001
- **Access Key**: minioadmin
- **Secret Key**: minioadmin
- **Bucket**: memento-mori

```env
# Development
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=memento-mori
S3_PUBLIC_URL=http://localhost:9000
```

### Creating a Bucket

1. Open MinIO Console: http://localhost:9001
2. Login with minioadmin/minioadmin
3. Create bucket named `memento-mori`
4. Set access policy to `public` for public files

### Production (AWS S3)

```env
# Production
S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com
S3_REGION=eu-central-1
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key
S3_BUCKET=memento-mori-prod
S3_PUBLIC_URL=https://memento-mori-prod.s3.eu-central-1.amazonaws.com
```

### File Upload Folders

| Folder       | Purpose                   |
| ------------ | ------------------------- |
| `avatars/`   | User profile pictures     |
| `services/`  | Service images            |
| `documents/` | Legal documents           |
| `vendors/`   | Vendor business documents |

---

## Keycloak (Authentication)

### Development

Keycloak is included in `docker-compose.dev.yml`.

- **Admin Console**: http://localhost:8080
- **Admin User**: admin
- **Admin Password**: admin
- **Realm**: memento-mori

```env
# Development
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

### Initial Setup

1. Open http://localhost:8080
2. Login as admin
3. Create realm `memento-mori`
4. Create client `memento-mori-api`
5. Configure client settings
6. Create roles (CLIENT, VENDOR, LAWYER_NOTARY, ADMIN)

### Production

Use managed Keycloak or deploy to cloud provider.

---

## Redis (Caching & Sessions)

### Development

Redis is included in `docker-compose.dev.yml`.

- **Host**: localhost
- **Port**: 6379

```env
# Development
REDIS_URL=redis://localhost:6379
```

### Production

Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)

```env
# Production
REDIS_URL=redis://:password@your-redis-host:6379
```

---

## Quick Start Commands

```bash
# Start all development services
make dev

# Check service status
docker-compose -f docker-compose.dev.yml ps

# View logs
make logs

# Stop services
make stop

# Reset database
make reset-db
```

---

## Environment Variables Summary

```env
# Application
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3000
VENDOR_PORTAL_URL=http://localhost:3002
ADMIN_PORTAL_URL=http://localhost:3003

# Database
DATABASE_URL=postgresql://memento:memento@localhost:5432/memento_mori

# Redis
REDIS_URL=redis://localhost:6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=your-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=Memento Mori <noreply@mementomori.de>

# Storage
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=memento-mori
```

---

## Troubleshooting

### Stripe webhooks not working locally

1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3001/api/payments/webhook`
2. Check the webhook secret matches `.env`

### Emails not appearing in Mailhog

1. Verify Mailhog is running: http://localhost:8025
2. Check SMTP configuration in `.env`

### MinIO connection refused

1. Check MinIO is running: `docker-compose -f docker-compose.dev.yml ps`
2. Verify endpoint URL in `.env`

### Keycloak login issues

1. Check realm configuration
2. Verify client ID and secret
3. Ensure redirect URIs are configured

---

**Last updated:** December 2025
