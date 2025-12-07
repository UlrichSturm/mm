# Development Start Guide - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** Active Development Guide

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Running the Application](#running-the-application)
6. [Development Workflow](#development-workflow)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Node.js** | 20+ | Runtime environment | [nodejs.org](https://nodejs.org/) |
| **npm** | 10+ | Package manager | Comes with Node.js |
| **Docker** | 20+ | Containerization | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.0+ | Multi-container orchestration | Comes with Docker |
| **Git** | 2.30+ | Version control | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Latest | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com/) |

### Optional but Recommended

- **PostgreSQL Client:** pgAdmin, DBeaver, or TablePlus
- **Redis Client:** RedisInsight
- **API Client:** Postman or Insomnia
- **Browser Extensions:** React DevTools, Redux DevTools

### System Requirements

- **OS:** macOS, Linux, or Windows (WSL2 recommended)
- **RAM:** 8GB minimum, 16GB recommended
- **Disk Space:** 10GB free space
- **CPU:** Multi-core processor recommended

---

## Initial Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/memento-mori.git
cd memento-mori

# Checkout development branch
git checkout develop
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for all apps
npm run install:all
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# See docs/DEVELOPMENT.md for all environment variables
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mementomori

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-backend
KEYCLOAK_CLIENT_SECRET=your-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

### 4. Start Docker Services

```bash
# Start all Docker services (PostgreSQL, Redis, Keycloak, MailHog)
docker-compose -f docker-compose.dev.yml up -d

# Check services are running
docker-compose -f docker-compose.dev.yml ps
```

### 5. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 6. Keycloak Setup

```bash
# Run Keycloak setup script
./scripts/setup-keycloak.sh

# Or manually configure Keycloak
# See docs/KEYCLOAK_SETUP.md for details
```

---

## Development Environment

### VS Code Setup

#### Recommended Extensions

Install these VS Code extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "eamodio.gitlens",
    "ms-vscode.vscode-json"
  ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Development Scripts

#### Root Level Scripts

```bash
# Development
npm run dev              # Start all services in dev mode
npm run dev:server       # Start only backend
npm run dev:client       # Start only client app
npm run dev:vendor       # Start only vendor portal
npm run dev:admin        # Start only admin portal

# Building
npm run build            # Build all services
npm run build:server     # Build backend only

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:cov         # Generate coverage report

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ destructive)

# Docker
npm run docker:up        # Start Docker services
npm run docker:down       # Stop Docker services
npm run docker:logs      # View Docker logs

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Run Prettier
```

---

## Project Structure

### Directory Layout

```
MM/
├── apps/
│   ├── server/              # Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── vendors/     # Vendor management
│   │   │   ├── services/    # Service catalog
│   │   │   ├── orders/      # Order processing
│   │   │   ├── payments/    # Payment processing
│   │   │   └── ...
│   │   ├── prisma/          # Database schema & migrations
│   │   └── package.json
│   │
│   ├── client/              # Client App (Next.js)
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities & API clients
│   │   └── package.json
│   │
│   ├── vendor-portal/       # Vendor Portal (Next.js)
│   │   └── ...
│   │
│   └── admin-portal/        # Admin Portal (Next.js)
│       └── ...
│
├── packages/
│   └── shared/              # Shared code
│       ├── src/
│       │   ├── types/       # TypeScript types
│       │   ├── utils/       # Utility functions
│       │   └── components/  # Shared components
│       └── package.json
│
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── docker/                  # Docker configurations
├── docker-compose.dev.yml   # Development Docker Compose
├── package.json            # Root package.json
└── README.md               # Project README
```

### Key Files

- **`.env`** - Environment variables (not in git)
- **`.env.example`** - Environment variables template
- **`docker-compose.dev.yml`** - Development Docker configuration
- **`package.json`** - Root package.json with workspace scripts
- **`tsconfig.json`** - TypeScript configuration
- **`.eslintrc.js`** - ESLint configuration
- **`.prettierrc`** - Prettier configuration

---

## Running the Application

### Start All Services

```bash
# Start Docker services first
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready (10-15 seconds)
sleep 10

# Start all development servers
npm run dev
```

This will start:
- **Backend API:** http://localhost:3001
- **Client App:** http://localhost:3000
- **Vendor Portal:** http://localhost:3002
- **Admin Portal:** http://localhost:3003
- **API Docs (Swagger):** http://localhost:3001/api/docs

### Start Individual Services

```bash
# Backend only
npm run dev:server

# Client App only
npm run dev:client

# Vendor Portal only
npm run dev:vendor

# Admin Portal only
npm run dev:admin
```

### Verify Setup

1. **Check Backend API:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check Database:**
   ```bash
   npm run db:studio
   # Should open Prisma Studio at http://localhost:5555
   ```

3. **Check Keycloak:**
   - Open http://localhost:8080
   - Login with admin credentials

4. **Check MailHog:**
   - Open http://localhost:8025
   - View test emails

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Or use GitHub CLI
gh pr create --base develop --head feature/your-feature-name
```

### 2. Make Changes

- Write code following project conventions
- Write tests for new features
- Update documentation if needed
- Follow commit message conventions

### 3. Test Your Changes

```bash
# Run unit tests
npm run test

# Run linting
npm run lint

# Check TypeScript errors
npm run type-check
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(module): add new feature"

# Push to remote
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Create PR from feature branch to `develop`
- Fill out PR template
- Request review from team members
- Wait for CI checks to pass
- Address review comments
- Merge after approval

### Commit Message Convention

```
type(scope): description

Examples:
feat(auth): add OAuth2 login
fix(orders): resolve payment status update
docs(readme): update installation steps
refactor(services): optimize database queries
test(orders): add unit tests for order service
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Common Tasks

### Adding a New API Endpoint

1. **Create/Update Controller:**
   ```typescript
   // apps/server/src/module/module.controller.ts
   @Post('endpoint')
   @UseGuards(JwtAuthGuard)
   async createEndpoint(@Body() dto: CreateDto) {
     return this.service.create(dto);
   }
   ```

2. **Create/Update Service:**
   ```typescript
   // apps/server/src/module/module.service.ts
   async create(dto: CreateDto) {
     // Business logic
   }
   ```

3. **Create DTO:**
   ```typescript
   // apps/server/src/module/dto/create.dto.ts
   export class CreateDto {
     @IsString()
     name: string;
   }
   ```

4. **Add Swagger Documentation:**
   ```typescript
   @ApiOperation({ summary: 'Create endpoint' })
   @ApiResponse({ status: 201, description: 'Created' })
   ```

### Adding a New Frontend Page

1. **Create Page:**
   ```typescript
   // apps/client/src/app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. **Add Route (if needed):**
   - Next.js App Router automatically creates routes from file structure

3. **Add Navigation:**
   ```typescript
   // Update navigation component
   <Link href="/new-page">New Page</Link>
   ```

### Database Migration

```bash
# Create migration
npm run db:migrate:create -- --name migration_name

# Apply migration
npm run db:migrate

# Rollback (if needed)
npm run db:migrate:rollback
```

### Adding Environment Variables

1. **Add to `.env.example`:**
   ```env
   NEW_VARIABLE=default_value
   ```

2. **Add to `.env`:**
   ```env
   NEW_VARIABLE=actual_value
   ```

3. **Use in code:**
   ```typescript
   const value = process.env.NEW_VARIABLE;
   ```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev:server
```

#### 2. Database Connection Error

```bash
# Check Docker services
docker-compose -f docker-compose.dev.yml ps

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres

# Check connection string in .env
echo $DATABASE_URL
```

#### 3. Keycloak Not Working

```bash
# Check Keycloak logs
docker-compose -f docker-compose.dev.yml logs keycloak

# Restart Keycloak
docker-compose -f docker-compose.dev.yml restart keycloak

# Re-run setup script
./scripts/setup-keycloak.sh
```

#### 4. Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf apps/*/.next
```

#### 5. TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or check types manually
npm run type-check
```

### Getting Help

- **Check Documentation:** See `docs/` folder
- **Search Issues:** GitHub Issues
- **Ask Team:** Slack/Discord channel
- **Create Issue:** If bug found

---

## Next Steps

### After Setup

1. ✅ **Verify Installation:** All services running
2. ✅ **Run Tests:** `npm run test`
3. ✅ **Explore Codebase:** Read through key files
4. ✅ **Set Up IDE:** Install recommended extensions
5. ✅ **Read Documentation:** Review `docs/` folder

### Learning Resources

- **NestJS:** [docs.nestjs.com](https://docs.nestjs.com/)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs)
- **TypeScript:** [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)

### First Tasks

1. **Fix a Bug:** Pick an issue from GitHub
2. **Add a Feature:** Start with a small feature
3. **Improve Documentation:** Update docs
4. **Write Tests:** Add tests for existing code
5. **Code Review:** Review open PRs

---

## Appendix

### Related Documents

- [Complete Setup Guide](docs/COMPLETE_SETUP_GUIDE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Docker Setup](docs/DOCKER_SETUP.md)
- [Keycloak Setup](docs/KEYCLOAK_SETUP.md)
- [API Reference](docs/API_REFERENCE.md)

### Useful Commands

```bash
# View all available scripts
npm run

# Check Docker services
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Reset everything (⚠️ destructive)
npm run docker:down
docker volume prune
npm run db:reset
npm run docker:up
```

---

**Last Updated:** December 7, 2025
**Maintained by:** Development Team

