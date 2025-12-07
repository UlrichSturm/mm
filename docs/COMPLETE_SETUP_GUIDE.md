# Complete Setup Guide - Memento Mori

**Last Updated:** 2025-12-02
**Status:** ✅ Ready for Development

---

## 🎯 Quick Start (5 Minutes)

### 1. Start Services

```bash
# Start all services (PostgreSQL, Redis, Keycloak, Mailhog, MinIO)
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready (30-60 seconds)
sleep 30
```

### 2. Setup Keycloak

```bash
# Automatic setup (recommended)
node scripts/setup-keycloak.js

# The script will output the API client secret
# Add it to apps/server/.env:
# KEYCLOAK_CLIENT_SECRET=<secret-from-output>
```

### 3. Setup Database

```bash
# Run migrations
npm run db:migrate -w apps/server

# Seed database
npm run db:seed -w apps/server
```

### 4. Start Applications

```bash
# Backend (Terminal 1)
npm run start:dev -w apps/server

# Client App (Terminal 2)
npm run dev -w apps/client

# Vendor Portal (Terminal 3)
npm run dev -w apps/vendor-portal

# Admin Portal (Terminal 4)
npm run dev -w apps/admin-portal
```

### 5. Test

- **Keycloak Admin:** http://localhost:8080 (admin/admin)
- **Client App:** http://localhost:3000
- **Vendor Portal:** http://localhost:3002
- **Admin Portal:** http://localhost:3003
- **Backend API:** http://localhost:3001/api/docs
- **Mailhog:** http://localhost:8025

---

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

---

## 🔐 Keycloak Configuration

### Automatic Setup (Recommended)

```bash
node scripts/setup-keycloak.js
```

**What it creates:**

- Realm: `memento-mori`
- Clients: `memento-mori-api`, `memento-mori-client`, `memento-mori-vendor`, `memento-mori-admin`
- Roles: `client`, `vendor`, `lawyer_notary`, `admin`
- Test users: 4 users with different roles

**Test Credentials:**

- Admin: `admin@mementomori.de` / `admin123`
- Client: `client1@test.com` / `password123`
- Vendor: `vendor1@test.com` / `password123`
- Lawyer: `lawyer1@test.com` / `password123`

### Manual Setup

See [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) for step-by-step instructions.

---

## 🔧 Environment Variables

### Backend (`apps/server/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/memento_mori

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=<from-setup-script>

# Redis
REDIS_URL=redis://localhost:6379

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Mailhog for development)
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=noreply@mementomori.de

# Storage (MinIO for development)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=memento-mori

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Client App (`apps/client/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-client
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Vendor Portal (`apps/vendor-portal/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-vendor
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Admin Portal (`apps/admin-portal/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧪 Testing

### Test Keycloak Integration

```bash
# Run test script
./scripts/test-keycloak-flow.sh
```

**What it tests:**

1. ✅ Keycloak health check
2. ✅ Realm existence
3. ✅ Client configuration
4. ✅ User authentication
5. ✅ API token validation
6. ✅ Protected endpoints

### Manual API Testing

#### 1. Get Access Token

```bash
curl -X POST http://localhost:8080/realms/memento-mori/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=memento-mori-api" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=password" \
  -d "username=client1@test.com" \
  -d "password=password123"
```

#### 2. Use Token in API

```bash
# Get user profile
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <access_token>"

# Get orders
curl -X GET http://localhost:3001/api/orders/my \
  -H "Authorization: Bearer <access_token>"
```

### Test Frontend Login

1. Open http://localhost:3000
2. Click "Sign In"
3. Redirected to Keycloak login
4. Enter `client1@test.com` / `password123`
5. Redirected back to app
6. User is authenticated ✅

---

## 📚 Documentation

| Document                                                               | Description                  |
| ---------------------------------------------------------------------- | ---------------------------- |
| [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md)                               | Manual Keycloak setup guide  |
| [KEYCLOAK_AUTO_SETUP.md](./KEYCLOAK_AUTO_SETUP.md)                     | Automatic setup script guide |
| [FRONTEND_KEYCLOAK_INTEGRATION.md](./FRONTEND_KEYCLOAK_INTEGRATION.md) | Frontend integration details |
| [API_REFERENCE.md](./API_REFERENCE.md)                                 | Complete API documentation   |
| [API_IMPLEMENTATION_SUMMARY.md](./API_IMPLEMENTATION_SUMMARY.md)       | API implementation summary   |
| [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md)                           | Test user accounts           |

---

## 🐛 Troubleshooting

### Keycloak not accessible

```bash
# Check if running
docker ps | grep keycloak

# Check logs
docker logs mm-keycloak-dev

# Restart
docker-compose -f docker-compose.dev.yml restart keycloak
```

### Database connection failed

```bash
# Check PostgreSQL
docker ps | grep postgres

# Check connection
psql postgresql://postgres:postgres@localhost:5432/memento_mori

# Reset database
npm run db:reset -w apps/server
```

### API returns 401 Unauthorized

- Check if token is valid (not expired)
- Verify `KEYCLOAK_CLIENT_SECRET` in `.env`
- Check Keycloak realm and client configuration
- Ensure user has correct role

### Frontend login redirect loop

- Check redirect URIs in Keycloak client settings
- Verify `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` matches Keycloak
- Check browser console for errors
- Clear browser cache and cookies

---

## 🚀 Development Workflow

### Daily Development

```bash
# 1. Start services
docker-compose -f docker-compose.dev.yml up -d

# 2. Start backend
npm run start:dev -w apps/server

# 3. Start frontend (in separate terminals)
npm run dev -w apps/client
npm run dev -w apps/vendor-portal
npm run dev -w apps/admin-portal
```

### Database Changes

```bash
# Create migration
npm run db:migrate -w apps/server

# Apply migration
npm run db:migrate:deploy -w apps/server

# Reset database (development only)
npm run db:reset -w apps/server
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run typecheck
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Docker services running (PostgreSQL, Redis, Keycloak, Mailhog, MinIO)
- [ ] Keycloak realm `memento-mori` exists
- [ ] 4 Keycloak clients created
- [ ] 4 Keycloak roles created
- [ ] 4 test users created
- [ ] Database migrations applied
- [ ] Database seeded
- [ ] Backend starts without errors
- [ ] Frontend apps start without errors
- [ ] Can login via Keycloak
- [ ] API accepts Keycloak tokens
- [ ] Swagger docs accessible

---

## 🎉 You're Ready!

Everything is set up and ready for development. Start building features! 🚀

**Next Steps:**

1. Test login flow in all three apps
2. Create your first order
3. Test payment flow
4. Explore admin dashboard

---

**Need Help?** Check the troubleshooting section or review the detailed documentation files.
