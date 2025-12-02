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
      [
        'server',
        'client',
        'vendor',
        'admin',
        'shared',
        'docs',
        'ci',
        'docker',
        'deps',
        'lint',
        'infra',
        'auth',
        'db',
        'api',
        'ui',
        'github',
      ],
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
};

