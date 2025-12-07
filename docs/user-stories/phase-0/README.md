# 🔧 Phase 0: Подготовка к разработке

## Обзор

Phase 0 включает все подготовительные задачи, которые необходимо завершить до начала разработки MVP.

**Продолжительность:** 5 дней
**Story Points:** 21
**Приоритет:** 🔴 Критический

---

## 📋 Задачи

| ID                                    | Название                | SP  | Приоритет | День | Статус |
| ------------------------------------- | ----------------------- | :-: | :-------: | :--: | :----: |
| [P0-001](P0-001-github-setup.md)      | GitHub Repository Setup |  2  |  🔴 Must  |  1   |   ✅   |
| [P0-002](P0-002-cicd-pipeline.md)     | CI/CD Pipeline          |  3  |  🔴 Must  | 1-2  |   ✅   |
| [P0-003](P0-003-docker-setup.md)      | Docker Setup            |  3  |  🔴 Must  |  2   |   ✅   |
| [P0-004](P0-004-linting-config.md)    | ESLint & Prettier       |  2  |  🟡 High  |  2   |   ✅   |
| [P0-005](P0-005-git-hooks.md)         | Husky & Commitlint      |  2  |  🟡 High  |  2   |   ✅   |
| [P0-006](P0-006-env-variables.md)     | Environment Variables   |  1  |  🔴 Must  |  1   |   ✅   |
| [P0-007](P0-007-database-schema.md)   | Database Schema         |  3  |  🔴 Must  |  3   |   ✅   |
| [P0-008](P0-008-swagger-setup.md)     | Swagger Setup           |  2  |  🟡 High  |  3   |   ✅   |
| [P0-009](P0-009-seed-data.md)         | Seed Data               |  2  |  🟡 High  |  4   |   ✅   |
| [P0-010](P0-010-external-services.md) | External Services       |  3  |  🟡 High  | 4-5  |   ✅   |

---

## 📅 Timeline

```
День 1  ─────────────────────────────────────────────────────
        ├── P0-001: GitHub Repository Setup
        ├── P0-006: Environment Variables
        └── P0-002: CI/CD Pipeline (start)

День 2  ─────────────────────────────────────────────────────
        ├── P0-002: CI/CD Pipeline (finish)
        ├── P0-003: Docker Setup
        ├── P0-004: ESLint & Prettier
        └── P0-005: Husky & Commitlint

День 3  ─────────────────────────────────────────────────────
        ├── P0-007: Database Schema
        └── P0-008: Swagger Setup

День 4  ─────────────────────────────────────────────────────
        ├── P0-009: Seed Data
        └── P0-010: External Services (start)

День 5  ─────────────────────────────────────────────────────
        ├── P0-010: External Services (finish)
        └── Final Testing & Documentation Review
```

---

## 🔗 Зависимости

```
P0-001 GitHub Setup
   │
   ├──► P0-002 CI/CD Pipeline
   │
   └──► P0-006 Env Variables
           │
           └──► P0-003 Docker Setup
                   │
                   ├──► P0-007 Database Schema
                   │       │
                   │       └──► P0-009 Seed Data
                   │
                   └──► P0-010 External Services

P0-004 Linting ──► P0-005 Git Hooks

P0-007 Database ──► P0-008 Swagger
```

---

## ✅ Definition of Done для Phase 0

Phase 0 считается завершенной когда:

- [ ] Все разработчики могут клонировать репозиторий
- [ ] `docker-compose up` запускает все сервисы
- [ ] CI pipeline проходит успешно на main
- [ ] Swagger документация доступна на /api/docs
- [ ] База данных создается и заполняется seed данными
- [ ] Все внешние сервисы настроены (test mode)
- [ ] README содержит полные инструкции по запуску
- [ ] Все конфигурационные файлы в репозитории

---

## 🚀 Quick Start после Phase 0

```bash
# 1. Clone repository
git clone https://github.com/SturmUlrich/MM.git
cd MM

# 2. Install dependencies
npm install

# 3. Copy environment
cp .env.example .env

# 4. Start services
docker-compose -f docker-compose.dev.yml up -d

# 5. Run migrations
npm run db:migrate

# 6. Seed database
npm run db:seed

# 7. Start development
npm run dev
```

**Доступные сервисы:**

- Client: http://localhost:3000
- Server API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs
- Vendor Portal: http://localhost:3002
- Admin Portal: http://localhost:3003
- Mailhog: http://localhost:8025
- MinIO Console: http://localhost:9001

---

## 📁 Структура файлов после Phase 0

```
MM/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── dependabot.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── apps/
│   ├── server/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   └── Dockerfile
│   ├── client/
│   ├── vendor-portal/
│   └── admin-portal/
├── docker/
│   └── postgres/
│       └── init.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── EXTERNAL_SERVICES.md
│   └── TEST_CREDENTIALS.md
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .editorconfig
├── commitlint.config.js
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
└── README.md
```

---

## 👥 Рекомендуемое распределение

| Роль              | Задачи                         |
| ----------------- | ------------------------------ |
| **Tech Lead**     | P0-001, P0-002, P0-005, P0-006 |
| **Backend Lead**  | P0-007, P0-008, P0-009         |
| **DevOps**        | P0-002, P0-003, P0-010         |
| **Frontend Lead** | P0-004                         |

---

**Epic файл:** [Epic_00_Phase0_Preparation.md](../../../epics/MVP/Epic_00_Phase0_Preparation.md)
