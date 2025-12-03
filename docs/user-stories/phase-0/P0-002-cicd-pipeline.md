# P0-002: CI/CD Pipeline

**Epic:** E-000 Phase 0 - Подготовка
**Приоритет:** 🔴 Must Have
**Story Points:** 3
**Исполнитель:** Tech Lead / DevOps
**Срок:** Day 1-2
**Статус:** ✅ Выполнено

---

## Описание

Настройка GitHub Actions для автоматической проверки кода, тестирования и деплоя.

---

## Задачи

### 1. CI Pipeline (Continuous Integration)

- [ ] Создать `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  # ===== LINT =====
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  # ===== TYPE CHECK =====
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

  # ===== UNIT TESTS =====
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  # ===== BUILD =====
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build all apps
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            apps/*/dist
            apps/*/.next
          retention-days: 7

  # ===== SECURITY SCAN =====
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 2. Deploy Pipeline (Staging)

- [ ] Создать `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

env:
  NODE_VERSION: '20'

jobs:
  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: memento-mori-server-staging

  deploy-client:
    name: Deploy Client App
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_CLIENT }}
          working-directory: ./apps/client

  deploy-vendor:
    name: Deploy Vendor Portal
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_VENDOR }}
          working-directory: ./apps/vendor-portal

  deploy-admin:
    name: Deploy Admin Portal
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_ADMIN }}
          working-directory: ./apps/admin-portal
```

### 3. Deploy Pipeline (Production)

- [ ] Создать `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN_PROD }}
          service: memento-mori-server-prod

  deploy-client:
    name: Deploy Client App
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_CLIENT }}
          vercel-args: '--prod'
          working-directory: ./apps/client
```

### 4. PR Check Workflow

- [ ] Создать `.github/workflows/pr-check.yml`:

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-title:
    name: PR Title Check
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            test
            chore
            ci
            perf
            revert
          requireScope: false
          subjectPattern: ^[a-z].+$
          subjectPatternError: |
            The subject "{subject}" found in the pull request title "{title}"
            doesn't match the configured pattern. Please use lowercase.

  size-label:
    name: Add Size Label
    runs-on: ubuntu-latest
    steps:
      - name: Add size label
        uses: codelytv/pr-size-labeler@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          xs_label: 'size/xs'
          xs_max_size: 10
          s_label: 'size/s'
          s_max_size: 100
          m_label: 'size/m'
          m_max_size: 500
          l_label: 'size/l'
          l_max_size: 1000
          xl_label: 'size/xl'
          fail_if_xl: false
```

### 5. Dependabot Configuration

- [ ] Создать `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        patterns:
          - '*'
        exclude-patterns:
          - '@types/*'
          - 'eslint*'
          - 'prettier*'
          - 'jest*'
          - 'typescript'
      dev-dependencies:
        patterns:
          - '@types/*'
          - 'eslint*'
          - 'prettier*'
          - 'jest*'
          - 'typescript'
    labels:
      - 'dependencies'
      - 'automated'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'
      - 'github-actions'

  # Docker
  - package-ecosystem: 'docker'
    directory: '/apps/server'
    schedule:
      interval: 'weekly'
    labels:
      - 'dependencies'
      - 'automated'
      - 'docker'
```

### 6. GitHub Secrets Setup

- [ ] Добавить secrets в репозиторий:

| Secret                     | Description                  |
| -------------------------- | ---------------------------- |
| `CODECOV_TOKEN`            | Codecov integration token    |
| `SNYK_TOKEN`               | Snyk security scan token     |
| `VERCEL_TOKEN`             | Vercel deployment token      |
| `VERCEL_ORG_ID`            | Vercel organization ID       |
| `VERCEL_PROJECT_ID_CLIENT` | Vercel project ID for client |
| `VERCEL_PROJECT_ID_VENDOR` | Vercel project ID for vendor |
| `VERCEL_PROJECT_ID_ADMIN`  | Vercel project ID for admin  |
| `RAILWAY_TOKEN`            | Railway deployment token     |
| `RAILWAY_TOKEN_PROD`       | Railway production token     |

---

## Package.json Scripts

- [ ] Добавить scripts в корневой `package.json`:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "turbo run typecheck",
    "db:migrate": "npm run -w apps/server db:migrate",
    "db:seed": "npm run -w apps/server db:seed",
    "db:reset": "npm run -w apps/server db:reset"
  }
}
```

---

## Acceptance Criteria

- [ ] CI workflow запускается на push и PR
- [ ] Lint job проверяет код
- [ ] Test job запускает тесты
- [ ] Build job собирает все приложения
- [ ] Security scan работает
- [ ] Deploy to staging работает на develop
- [ ] Deploy to production работает на main
- [ ] PR checks работают
- [ ] Dependabot настроен
- [ ] Все secrets добавлены

---

## Definition of Done

- [ ] Все workflows созданы и работают
- [ ] CI проходит на тестовом PR
- [ ] Deploy работает на staging
- [ ] Документация обновлена
