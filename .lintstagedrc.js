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
