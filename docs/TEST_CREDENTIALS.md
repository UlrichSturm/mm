# Test Credentials

This document contains test credentials for the development environment.

> ⚠️ **Warning**: These credentials are for development and testing only. Never use these in production!

## Quick Start

```bash
# Seed the database with test data
cd apps/server
npm run db:seed

# Reset and reseed database
npm run db:reset
```

---

## Admin Account

| Email                | Password    | Role  |
| -------------------- | ----------- | ----- |
| admin@mementomori.de | password123 | ADMIN |

---

## Client Accounts

| Email            | Password    | Name          |
| ---------------- | ----------- | ------------- |
| client1@test.com | password123 | Hans Mueller  |
| client2@test.com | password123 | Anna Schmidt  |
| client3@test.com | password123 | Klaus Weber   |
| client4@test.com | password123 | Maria Fischer |

---

## Vendor Accounts

### Approved Vendors

| Email            | Password    | Business Name            | Category         |
| ---------------- | ----------- | ------------------------ | ---------------- |
| vendor1@test.com | password123 | Bestattungen Becker GmbH | Funeral Services |
| vendor2@test.com | password123 | Hoffmann Blumen & Kränze | Flowers          |
| vendor3@test.com | password123 | Wolf Transport Services  | Transportation   |

### Pending Vendors

| Email            | Password    | Business Name                 |
| ---------------- | ----------- | ----------------------------- |
| vendor4@test.com | password123 | Koch Steinmetz Meisterbetrieb |

---

## Lawyer / Notary Accounts

| Email            | Password    | Organization              | Type   |
| ---------------- | ----------- | ------------------------- | ------ |
| lawyer1@test.com | password123 | Kanzlei Richter & Partner | LAWYER |
| notary1@test.com | password123 | Notariat Braun            | NOTARY |

---

## Test Data Summary

After running `npm run db:seed`, you will have:

- **1** Admin user
- **4** Client users
- **4** Vendor users (3 approved, 1 pending)
- **2** Lawyer/Notary users
- **7** Service categories
- **12** Services (from approved vendors)
- **6** Orders (with various statuses)
- **~2-3** Completed payments

---

## Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (development)
npm run db:migrate:dev

# Run migrations (production)
npm run db:migrate

# Push schema changes (no migration)
npm run db:push

# Seed database
npm run db:seed

# Reset database (deletes all data!)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

## Environments

### Local Development

- **API URL**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555

### Staging

- **API URL**: https://api-staging.mementomori.de
- Use Keycloak authentication (no password-based login)

### Production

- **API URL**: https://api.mementomori.de
- Use Keycloak authentication only

---

## Notes

1. All test accounts use the same password: `password123`
2. Passwords are hashed with bcrypt (10 rounds)
3. Vendor ratings and review counts are pre-populated for approved vendors
4. Orders have random statuses and multiple order items
5. Completed orders include payment records with fee calculations

---

**Last updated:** December 2025
