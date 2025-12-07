# 🪦 Memento Mori

Платформа для организации ритуальных услуг — маркетплейс, соединяющий клиентов с проверенными вендорами похоронных услуг.

[![CI](https://github.com/SturmUlrich/MM/actions/workflows/ci.yml/badge.svg)](https://github.com/SturmUlrich/MM/actions/workflows/ci.yml)
[![License: Private](https://img.shields.io/badge/License-Private-red.svg)]()

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Docker** & Docker Compose
- **npm** 10+
- **PostgreSQL** 15+ (через Docker)

### Installation

```bash
# Clone repository
git clone https://github.com/SturmUlrich/MM.git
cd MM

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start services (PostgreSQL, Redis, etc.)
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Start all development servers
npm run dev
```

### Access Points

| Service       | URL                            | Description           |
| ------------- | ------------------------------ | --------------------- |
| Client App    | http://localhost:3000          | Клиентское приложение |
| Server API    | http://localhost:3001          | Backend API           |
| Vendor Portal | http://localhost:3002          | Портал вендоров       |
| Admin Portal  | http://localhost:3003          | Админ-панель          |
| API Docs      | http://localhost:3001/api/docs | Swagger документация  |

---

## 📁 Project Structure

```
MM/
├── apps/
│   ├── server/          # NestJS Backend API
│   ├── client/          # Next.js Client App
│   ├── vendor-portal/   # Next.js Vendor Portal
│   └── admin-portal/    # Next.js Admin Portal
├── packages/
│   └── shared/          # Shared types & utilities
├── docs/                # Documentation
│   ├── user-stories/    # User stories by epic
│   └── ...
├── epics/               # Epic definitions
├── scripts/             # Utility scripts
├── docker-compose.yml   # Production Docker config
└── docker-compose.dev.yml # Development Docker config
```

---

## 🛠 Development

### Available Commands

```bash
# Development
npm run dev              # Start all services in dev mode
npm run dev:server       # Start only backend
npm run dev:client       # Start only client app
npm run dev:vendor       # Start only vendor portal
npm run dev:admin        # Start only admin portal

# Building
npm run build            # Build all services
npm run build:server     # Build backend

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:cov         # Generate coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Run Prettier

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ destructive)

# Docker
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run docker:logs      # View Docker logs
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mementomori

# Auth
JWT_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.example.com
SMTP_USER=user
SMTP_PASSWORD=password
```

See [docs/P0-006-env-variables.md](docs/user-stories/phase-0/P0-006-env-variables.md) for full list.

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## 📝 Contributing

### Branch Strategy

- `main` — production-ready code
- `develop` — integration branch
- `feature/*` — new features
- `bugfix/*` — bug fixes
- `hotfix/*` — urgent production fixes

### Workflow

1. Create feature branch from `develop`
2. Make changes following code style
3. Write/update tests
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Create Pull Request to `develop`
6. Wait for review and CI checks
7. Squash and merge

### Commit Convention

```
type(scope): description

# Examples:
feat(auth): add OAuth2 login
fix(orders): resolve payment status update
docs(readme): update installation steps
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📚 Documentation

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [User Stories](docs/user-stories/README.md)
- [API Documentation](http://localhost:3001/api/docs)
- [Development Guide](DEVELOPMENT.md)
- [Docker Setup](DOCKER_SETUP.md)

---

## 🔧 Tech Stack

### Backend

- **NestJS** — Node.js framework
- **Prisma** — ORM
- **PostgreSQL** — Database
- **Redis** — Caching & queues
- **Swagger** — API docs

### Frontend

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **React Query** — Data fetching

### Infrastructure

- **Docker** — Containerization
- **GitHub Actions** — CI/CD
- **Keycloak** — Authentication (planned)

---

## 📄 License

Private — All rights reserved.

---

## 👥 Team

- **Tech Lead**: [@SturmUlrich](https://github.com/SturmUlrich)

---

**Last updated:** December 2025
