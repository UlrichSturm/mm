# P0-004: ESLint & Prettier Configuration

**Epic:** E-000 Phase 0 - Подготовка  
**Приоритет:** 🟡 High  
**Story Points:** 2  
**Исполнитель:** Frontend Lead  
**Срок:** Day 2  
**Статус:** ⬜ Не начато

---

## Описание

Настройка единых правил линтинга и форматирования кода для всего проекта.

---

## Задачи

### 1. Корневой ESLint Config

- [ ] Создать `.eslintrc.js` в корне:

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
  ],
};
```

### 2. Backend ESLint Config

- [ ] Создать `apps/server/.eslintrc.js`:

```javascript
module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // NestJS specific
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
  },
};
```

### 3. Frontend ESLint Config

- [ ] Создать `apps/client/.eslintrc.js`:

```javascript
module.exports = {
  extends: [
    '../../.eslintrc.js',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    
    // Next.js
    '@next/next/no-html-link-for-pages': 'off',
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### 4. Prettier Config

- [ ] Создать `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "bracketSameLine": false
}
```

- [ ] Создать `.prettierignore`:

```
# Dependencies
node_modules

# Build outputs
dist
build
.next
out

# Coverage
coverage

# Logs
*.log

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Generated files
*.generated.*
prisma/migrations

# Assets
*.svg
*.ico
*.png
*.jpg
*.jpeg
*.gif
*.webp

# Config files
*.config.js
*.config.ts
```

### 5. EditorConfig

- [ ] Создать `.editorconfig`:

```ini
# EditorConfig helps maintain consistent coding styles
# https://editorconfig.org

root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

### 6. VSCode Settings

- [ ] Создать `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.wordWrap": "on"
  }
}
```

- [ ] Создать `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "formulahendry.auto-rename-tag",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "yoavbls.pretty-ts-errors",
    "christian-kohler.path-intellisense"
  ]
}
```

### 7. Install Dependencies

- [ ] Добавить зависимости в корневой `package.json`:

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.0",
    "prettier": "^3.2.0"
  }
}
```

- [ ] Для frontend apps добавить:

```json
{
  "devDependencies": {
    "eslint-config-next": "^14.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

### 8. Package.json Scripts

- [ ] Добавить scripts:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css,scss}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css,scss}\""
  }
}
```

---

## Acceptance Criteria

- [ ] ESLint работает для всех apps
- [ ] Prettier форматирует код единообразно
- [ ] VSCode автоформатирует при сохранении
- [ ] `npm run lint` проходит без ошибок
- [ ] `npm run format:check` проходит
- [ ] EditorConfig применяется
- [ ] Рекомендуемые расширения VSCode добавлены

---

## Definition of Done

- [ ] Все конфиги созданы
- [ ] Зависимости установлены
- [ ] Команды работают
- [ ] Документация обновлена

