# P0-005: Husky & Commitlint Setup

**Epic:** E-000 Phase 0 - Подготовка
**Приоритет:** 🟡 High
**Story Points:** 2
**Исполнитель:** Tech Lead
**Срок:** Day 2
**Статус:** ✅ Выполнено

---

## Описание

Настройка Git hooks для автоматической проверки кода перед коммитом и валидации commit messages.

---

## Задачи

### 1. Install Dependencies

- [ ] Установить зависимости:

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 2. Initialize Husky

- [ ] Инициализировать Husky:

```bash
npx husky init
```

### 3. Pre-commit Hook

- [ ] Создать `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run typecheck
```

### 4. Commit-msg Hook

- [ ] Создать `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

### 5. Pre-push Hook (Optional)

- [ ] Создать `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run tests before push
npm run test
```

### 6. Lint-staged Config

- [ ] Создать `.lintstagedrc.js`:

```javascript
module.exports = {
  // TypeScript & JavaScript
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON, YAML, Markdown
  '*.{json,yml,yaml,md}': ['prettier --write'],

  // CSS, SCSS
  '*.{css,scss}': ['prettier --write'],

  // Prisma
  '*.prisma': ['npx prisma format'],
};
```

### 7. Commitlint Config

- [ ] Создать `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Code style (formatting, semicolons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or dependencies
        'ci', // CI/CD configuration
        'chore', // Other changes (maintenance)
        'revert', // Revert previous commit
        'wip', // Work in progress
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope
    'scope-enum': [
      1,
      'always',
      ['server', 'client', 'vendor', 'admin', 'shared', 'docs', 'ci', 'docker', 'deps'],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // Subject
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 72],
    'subject-full-stop': [2, 'never', '.'],

    // Body
    'body-max-line-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],

    // Footer
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  prompt: {
    questions: {
      type: {
        description: 'Select the type of change you are committing',
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📝',
          },
          style: {
            description: 'Code style changes (formatting, semicolons, etc)',
            title: 'Styles',
            emoji: '🎨',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '♻️',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance',
            emoji: '⚡️',
          },
          test: {
            description: 'Adding or updating tests',
            title: 'Tests',
            emoji: '✅',
          },
          build: {
            description: 'Build system or external dependencies',
            title: 'Builds',
            emoji: '📦',
          },
          ci: {
            description: 'CI/CD configuration changes',
            title: 'CI',
            emoji: '👷',
          },
          chore: {
            description: 'Other changes that do not modify src or test files',
            title: 'Chores',
            emoji: '🔧',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '⏪',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g. server, client)',
      },
      subject: {
        description: 'Write a short, imperative mood description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please describe the breaking changes',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please describe the changes',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "closes #456")',
      },
    },
  },
};
```

### 8. Package.json Scripts

- [ ] Добавить scripts в `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "commit": "npx cz"
  }
}
```

### 9. Commitizen (Optional)

- [ ] Установить Commitizen для интерактивных коммитов:

```bash
npm install -D commitizen cz-conventional-changelog
```

- [ ] Добавить в `package.json`:

```json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

---

## Примеры правильных commit messages

```
feat(server): add user registration endpoint
fix(client): resolve login form validation error
docs: update API documentation
style(shared): format code with prettier
refactor(vendor): simplify order processing logic
perf(server): optimize database queries for services list
test(client): add unit tests for cart component
build: update dependencies
ci: add deployment workflow for staging
chore: clean up unused imports
```

## Примеры неправильных commit messages

```
❌ Updated code
❌ Fixed bug
❌ WIP
❌ feat: Add user registration endpoint (uppercase)
❌ feat(server) add user registration (missing colon)
```

---

## Acceptance Criteria

- [ ] Pre-commit hook запускает lint-staged
- [ ] Commit-msg hook валидирует сообщения
- [ ] Неправильные commit messages отклоняются
- [ ] `npm run commit` запускает интерактивный коммит
- [ ] Документация по commit convention создана

---

## Definition of Done

- [ ] Husky настроен и работает
- [ ] Lint-staged работает
- [ ] Commitlint работает
- [ ] Команда обучена правилам коммитов
