# Prisma Setup Guide

This guide explains how to set up Prisma with PostgreSQL for the Memento Mori project.

## Prerequisites

- PostgreSQL installed locally or running in Docker
- Node.js and npm installed

## Setup Steps

### 1. Database Configuration

The project uses PostgreSQL. You can either:

**Option A: Use Docker PostgreSQL (Recommended)**
```bash
docker-compose up -d postgres
```

**Option B: Use Local PostgreSQL**
- Install PostgreSQL locally
- Create a database: `createdb memento_mori`
- Update `DATABASE_URL` in `apps/server/.env`

### 2. Environment Variables

Create or update `apps/server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memento_mori?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

For Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/memento_mori?schema=public"
```

### 3. Generate Prisma Client

```bash
cd apps/server
npx prisma generate
```

### 4. Run Migrations

```bash
cd apps/server
npx prisma migrate dev --name init
```

This will:
- Create the database schema
- Generate migration files
- Apply migrations to the database

### 5. Create Initial Admin User

After migrations, create the admin user:

```bash
cd apps/server
node scripts/create-admin.js
```

Or use Prisma Studio to manually create a user:
```bash
npx prisma studio
```

## Database Schema

The schema includes:

- **User**: All users (CLIENT, VENDOR, LAWYER_NOTARY, ADMIN)
- **LawyerNotaryProfile**: Lawyer/Notary professional information
- **VendorProfile**: Vendor business information

## Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client after schema changes
npx prisma generate
```

## Docker Setup

When running in Docker, the database is automatically set up:

```bash
docker-compose up -d postgres
docker-compose exec server npx prisma migrate deploy
docker-compose exec server node scripts/create-admin.js
```

## Troubleshooting

### Connection Issues

- Check that PostgreSQL is running: `docker ps` or `pg_isready`
- Verify `DATABASE_URL` is correct
- Check network connectivity between services

### Migration Issues

- If migrations fail, check the database connection
- Use `npx prisma migrate reset` to start fresh (WARNING: deletes data)
- Check Prisma logs for detailed error messages

