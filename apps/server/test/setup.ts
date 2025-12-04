// Global test setup
// This file runs before all tests

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/memento_mori_test';
process.env.KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
process.env.KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'memento-mori';
process.env.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || 'test-key';
process.env.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'test.mailgun.org';

// Increase timeout for integration tests
jest.setTimeout(30000);
