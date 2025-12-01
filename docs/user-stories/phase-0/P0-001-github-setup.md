# P0-001: GitHub Repository Setup

**Epic:** E-000 Phase 0 - Подготовка  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Исполнитель:** Tech Lead  
**Срок:** Day 1  
**Статус:** ⬜ Не начато

---

## Описание

Настройка GitHub репозитория с правильной структурой, защитой веток и шаблонами для эффективной командной работы.

---

## Задачи

### 1. Структура репозитория

- [ ] Создать/настроить monorepo структуру:
  ```
  MM/
  ├── apps/
  │   ├── server/          # NestJS Backend
  │   ├── client/          # Next.js Client App
  │   ├── vendor-portal/   # Next.js Vendor Portal
  │   └── admin-portal/    # Next.js Admin Portal
  ├── packages/
  │   └── shared/          # Shared types & utilities
  ├── docs/                # Documentation
  ├── scripts/             # Utility scripts
  └── docker/              # Docker configs
  ```

### 2. Branch Protection Rules

- [ ] Настроить защиту для `main` ветки:
  - [ ] Require pull request reviews before merging (min 1)
  - [ ] Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Require linear history
  - [ ] Include administrators in restrictions

- [ ] Настроить защиту для `develop` ветки:
  - [ ] Require pull request reviews (min 1)
  - [ ] Require status checks to pass

### 3. CODEOWNERS

- [ ] Создать файл `.github/CODEOWNERS`:

```
# Default owners
* @tech-lead

# Backend
/apps/server/ @backend-lead @tech-lead

# Frontend
/apps/client/ @frontend-lead
/apps/vendor-portal/ @frontend-lead
/apps/admin-portal/ @frontend-lead

# Shared packages
/packages/ @tech-lead

# Documentation
/docs/ @tech-lead

# CI/CD
/.github/ @tech-lead @devops

# Docker
/docker/ @devops @tech-lead
docker-compose*.yml @devops @tech-lead
```

### 4. Issue Templates

- [ ] Создать `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Описание бага
Краткое описание проблемы.

## Шаги воспроизведения
1. Перейти на '...'
2. Нажать на '...'
3. Увидеть ошибку

## Ожидаемое поведение
Что должно было произойти.

## Скриншоты
Если применимо, добавьте скриншоты.

## Окружение
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

## Дополнительный контекст
Любая другая информация о проблеме.
```

- [ ] Создать `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Описание функции
Краткое описание предлагаемой функции.

## Проблема
Какую проблему это решает?

## Предлагаемое решение
Как вы видите реализацию?

## Альтернативы
Рассматривали ли вы альтернативные решения?

## Дополнительный контекст
Любая другая информация или скриншоты.
```

- [ ] Создать `.github/ISSUE_TEMPLATE/task.md`:

```markdown
---
name: Task
about: A task to be completed
title: '[TASK] '
labels: task
assignees: ''
---

## Описание
Что нужно сделать.

## Acceptance Criteria
- [ ] Критерий 1
- [ ] Критерий 2
- [ ] Критерий 3

## Связанные задачи
- #123

## Story Points
Оценка: X SP
```

### 5. Pull Request Template

- [ ] Создать `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Описание
<!-- Краткое описание изменений -->

## Тип изменений
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 📝 Documentation
- [ ] 🎨 Style/UI
- [ ] ♻️ Refactoring
- [ ] 🔧 Configuration
- [ ] ✅ Tests

## Связанные issues
Closes #

## Checklist
- [ ] Код следует стилю проекта
- [ ] Self-review выполнен
- [ ] Комментарии добавлены где необходимо
- [ ] Документация обновлена
- [ ] Тесты добавлены/обновлены
- [ ] Все тесты проходят
- [ ] Нет новых warnings

## Screenshots (если применимо)

## Дополнительные заметки
```

### 6. README.md

- [ ] Создать/обновить README.md:

```markdown
# 🪦 Memento Mori

Платформа для организации ритуальных услуг.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm 10+

### Installation

\`\`\`bash
# Clone repository
git clone https://github.com/SturmUlrich/MM.git
cd MM

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development servers
npm run dev
\`\`\`

## 📁 Project Structure

\`\`\`
apps/
├── server/          # NestJS Backend (port 3001)
├── client/          # Next.js Client App (port 3000)
├── vendor-portal/   # Next.js Vendor Portal (port 3002)
└── admin-portal/    # Next.js Admin Portal (port 3003)
\`\`\`

## 🛠 Development

### Commands
- \`npm run dev\` - Start all services in development mode
- \`npm run build\` - Build all services
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linter
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:seed\` - Seed database

### API Documentation
Swagger UI available at: http://localhost:3001/api/docs

## 🧪 Testing

\`\`\`bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage report
\`\`\`

## 📝 Contributing

1. Create feature branch from \`develop\`
2. Make changes following code style
3. Write/update tests
4. Create Pull Request
5. Wait for review and CI checks

## 📄 License

Private - All rights reserved
\`\`\`

### 7. Labels Setup

- [ ] Создать labels в GitHub:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | #d73a4a | Something isn't working |
| `enhancement` | #a2eeef | New feature or request |
| `documentation` | #0075ca | Documentation improvements |
| `good first issue` | #7057ff | Good for newcomers |
| `help wanted` | #008672 | Extra attention is needed |
| `priority: critical` | #b60205 | Critical priority |
| `priority: high` | #d93f0b | High priority |
| `priority: medium` | #fbca04 | Medium priority |
| `priority: low` | #0e8a16 | Low priority |
| `backend` | #5319e7 | Backend related |
| `frontend` | #1d76db | Frontend related |
| `devops` | #006b75 | DevOps related |
| `wontfix` | #ffffff | This will not be worked on |

---

## Acceptance Criteria

- [ ] Monorepo структура создана
- [ ] Branch protection настроена для main и develop
- [ ] CODEOWNERS файл добавлен
- [ ] Issue templates работают
- [ ] PR template работает
- [ ] README.md содержит инструкции по запуску
- [ ] Labels настроены
- [ ] Все члены команды добавлены с правильными правами

---

## Definition of Done

- [ ] Все задачи выполнены
- [ ] Команда может создавать issues и PR
- [ ] Branch protection работает
- [ ] Документация актуальна

