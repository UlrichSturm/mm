#!/usr/bin/env node
/* eslint-disable */

/**
 * Keycloak Auto-Setup Script
 *
 * Automatically configures Keycloak realm, clients, roles, and test users
 *
 * Usage:
 *   node scripts/setup-keycloak.js
 *
 * Environment variables:
 *   KEYCLOAK_URL - Keycloak server URL (default: http://localhost:8080)
 *   KEYCLOAK_ADMIN_USER - Admin username (default: admin)
 *   KEYCLOAK_ADMIN_PASSWORD - Admin password (default: admin)
 */

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
const REALM_NAME = 'memento-mori';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Get admin access token
 */
async function getAdminToken() {
  info('Getting admin access token...');

  const response = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: KEYCLOAK_ADMIN_USER,
      password: KEYCLOAK_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get admin token: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make authenticated request to Keycloak Admin API
 */
async function keycloakRequest(method, path, token, body = null) {
  const url = `${KEYCLOAK_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok && response.status !== 409) {
    // 409 = already exists
    const text = await response.text();
    throw new Error(`Keycloak request failed: ${method} ${path} - ${response.status} ${text}`);
  }

  if (response.status === 204 || response.status === 409) {
    return null;
  }

  return response.json().catch(() => null);
}

/**
 * Check if Keycloak is accessible
 */
async function checkKeycloakHealth() {
  try {
    // Try health endpoint first
    const healthResponse = await fetch(`${KEYCLOAK_URL}/health`);
    if (healthResponse.ok) {
      return true;
    }
    // Fallback: check if Keycloak is responding at all
    const rootResponse = await fetch(`${KEYCLOAK_URL}/realms/master`);
    return rootResponse.ok || rootResponse.status === 404; // 404 means Keycloak is running but realm doesn't exist yet
  } catch {
    return false;
  }
}

/**
 * Create realm
 */
async function createRealm(token) {
  info('Creating realm...');

  const realm = {
    realm: REALM_NAME,
    enabled: true,
    displayName: 'Memento Mori',
    loginWithEmailAllowed: true,
    duplicateEmailsAllowed: false,
    resetPasswordAllowed: true,
    editUsernameAllowed: false,
    rememberMe: true,
    verifyEmail: false,
    accessTokenLifespan: 300, // 5 minutes
    ssoSessionIdleTimeout: 1800, // 30 minutes
    ssoSessionMaxLifespan: 36000, // 10 hours
    sslRequired: 'none',
  };

  await keycloakRequest('POST', '/admin/realms', token, realm);
  success(`Realm '${REALM_NAME}' created`);
}

/**
 * Create client
 */
async function createClient(token, clientId, clientConfig) {
  info(`Creating client '${clientId}'...`);

  const client = {
    clientId,
    enabled: true,
    publicClient: clientConfig.publicClient || false,
    standardFlowEnabled: true,
    directAccessGrantsEnabled: true,
    implicitFlowEnabled: false,
    redirectUris: clientConfig.redirectUris || [],
    webOrigins: clientConfig.webOrigins || ['+'],
    ...clientConfig,
  };

  await keycloakRequest('POST', `/admin/realms/${REALM_NAME}/clients`, token, client);
  success(`Client '${clientId}' created`);
}

/**
 * Get client by ID
 */
async function getClient(token, clientId) {
  const clients = await keycloakRequest(
    'GET',
    `/admin/realms/${REALM_NAME}/clients?clientId=${clientId}`,
    token,
  );
  return clients?.[0];
}

/**
 * Get client secret
 */
async function getClientSecret(token, clientId) {
  const client = await getClient(token, clientId);
  if (!client) {
    throw new Error(`Client '${clientId}' not found`);
  }

  const secret = await keycloakRequest(
    'GET',
    `/admin/realms/${REALM_NAME}/clients/${client.id}/client-secret`,
    token,
  );
  return secret?.value;
}

/**
 * Create role
 */
async function createRole(token, roleName) {
  info(`Creating role '${roleName}'...`);

  const role = {
    name: roleName,
    description: `Role for ${roleName} users`,
  };

  await keycloakRequest('POST', `/admin/realms/${REALM_NAME}/roles`, token, role);
  success(`Role '${roleName}' created`);
}

/**
 * Create user
 */
async function createUser(token, userData) {
  info(`Creating user '${userData.username}'...`);

  const user = {
    username: userData.username,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    enabled: true,
    emailVerified: true,
    credentials: [
      {
        type: 'password',
        value: userData.password,
        temporary: false,
      },
    ],
  };

  const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  if (response.status === 409) {
    warning(`User '${userData.username}' already exists, skipping...`);
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create user: ${response.status} ${text}`);
  }

  // Get user ID
  const location = response.headers.get('location');
  if (location) {
    const userId = location.split('/').pop();
    success(`User '${userData.username}' created (ID: ${userId})`);
    return userId;
  }

  return null;
}

/**
 * Assign role to user
 */
async function assignRoleToUser(token, userId, roleName) {
  // Get role
  const role = await keycloakRequest('GET', `/admin/realms/${REALM_NAME}/roles/${roleName}`, token);
  if (!role) {
    throw new Error(`Role '${roleName}' not found`);
  }

  // Assign role
  await keycloakRequest(
    'POST',
    `/admin/realms/${REALM_NAME}/users/${userId}/role-mappings/realm`,
    token,
    [role],
  );
  success(`Role '${roleName}' assigned to user`);
}

/**
 * Main setup function
 */
async function setup() {
  log('\n🔐 Keycloak Auto-Setup Script\n', 'blue');

  // Check Keycloak health
  info('Checking Keycloak health...');
  const isHealthy = await checkKeycloakHealth();
  if (!isHealthy) {
    error(`Keycloak is not accessible at ${KEYCLOAK_URL}`);
    error(
      'Please ensure Keycloak is running: docker-compose -f docker-compose.dev.yml up -d keycloak',
    );
    process.exit(1);
  }
  success('Keycloak is accessible');

  // Get admin token
  let token;
  try {
    token = await getAdminToken();
    success('Admin token obtained');
  } catch (err) {
    error(`Failed to get admin token: ${err.message}`);
    error('Please check KEYCLOAK_ADMIN_USER and KEYCLOAK_ADMIN_PASSWORD');
    process.exit(1);
  }

  // Create or update realm
  try {
    await createRealm(token);
  } catch (err) {
    if (err.message.includes('409')) {
      warning('Realm already exists, updating SSL settings...');
      // Update realm to disable SSL requirement
      try {
        const currentRealm = await keycloakRequest('GET', `/admin/realms/${REALM_NAME}`, token);
        const updatedRealm = {
          ...currentRealm,
          sslRequired: 'none',
        };
        await keycloakRequest('PUT', `/admin/realms/${REALM_NAME}`, token, updatedRealm);
        success('Realm SSL settings updated to "none"');
      } catch (updateErr) {
        warning(`Failed to update realm: ${updateErr.message}`);
      }
    } else {
      throw err;
    }
  }

  // Create clients
  const clients = [
    {
      clientId: 'memento-mori-api',
      publicClient: false,
      redirectUris: [],
      webOrigins: [],
    },
    {
      clientId: 'memento-mori-client',
      publicClient: true,
      redirectUris: ['http://localhost:3000/*'],
      webOrigins: ['http://localhost:3000'],
    },
    {
      clientId: 'memento-mori-vendor',
      publicClient: true,
      redirectUris: ['http://localhost:3002/*'],
      webOrigins: ['http://localhost:3002'],
    },
    {
      clientId: 'memento-mori-admin',
      publicClient: true,
      redirectUris: ['http://localhost:3003/*'],
      webOrigins: ['http://localhost:3003'],
    },
  ];

  for (const clientConfig of clients) {
    try {
      await createClient(token, clientConfig.clientId, clientConfig);
    } catch (err) {
      if (err.message.includes('409')) {
        warning(`Client '${clientConfig.clientId}' already exists, skipping...`);
      } else {
        throw err;
      }
    }
  }

  // Get API client secret
  info('Getting API client secret...');
  let apiClientSecret;
  try {
    apiClientSecret = await getClientSecret(token, 'memento-mori-api');
    if (apiClientSecret) {
      success('API client secret obtained');
      log(`\n📝 Add this to apps/server/.env:`, 'yellow');
      log(`KEYCLOAK_CLIENT_SECRET=${apiClientSecret}\n`, 'cyan');
    }
  } catch (err) {
    warning(`Could not get API client secret: ${err.message}`);
  }

  // Create roles
  const roles = ['client', 'vendor', 'lawyer_notary', 'admin'];
  for (const roleName of roles) {
    try {
      await createRole(token, roleName);
    } catch (err) {
      if (err.message.includes('409')) {
        warning(`Role '${roleName}' already exists, skipping...`);
      } else {
        throw err;
      }
    }
  }

  // Create test users
  const users = [
    {
      id: 'e0db99c9-7e8d-4bd9-b163-854b2ce12d76',
      username: 'admin',
      email: 'admin@mementomori.de',
      firstName: 'Admin',
      lastName: 'User',
      password: 'admin123',
      role: 'admin',
    },
    {
      id: 'c637ea3b-a621-49a1-b44f-5bb26c580078',
      username: 'client1',
      email: 'client1@test.com',
      firstName: 'Hans',
      lastName: 'Mueller',
      password: 'password123',
      role: 'client',
    },
    {
      id: '13d441ed-bd32-40d7-8603-8ab7b02dcde2',
      username: 'vendor1',
      email: 'vendor1@test.com',
      firstName: 'Vendor',
      lastName: 'One',
      password: 'password123',
      role: 'vendor',
    },
    {
      id: '9ec4de0b-5d47-4c3c-b272-b850886914ee',
      username: 'lawyer1',
      email: 'lawyer1@test.com',
      firstName: 'Lawyer',
      lastName: 'One',
      password: 'password123',
      role: 'lawyer_notary',
    },
  ];

  for (const userData of users) {
    try {
      const userId = await createUser(token, userData);
      if (userId && userData.role) {
        await assignRoleToUser(token, userId, userData.role);
      }
    } catch (err) {
      warning(`Failed to create user '${userData.username}': ${err.message}`);
    }
  }

  log('\n✅ Keycloak setup completed!\n', 'green');
  log('📋 Test credentials:', 'blue');
  log('   Admin: admin@mementomori.de / admin123', 'cyan');
  log('   Client: client1@test.com / password123', 'cyan');
  log('   Vendor: vendor1@test.com / password123', 'cyan');
  log('   Lawyer: lawyer1@test.com / password123', 'cyan');
  log('\n🚀 Next steps:', 'blue');
  log('   1. Add KEYCLOAK_CLIENT_SECRET to apps/server/.env', 'cyan');
  log('   2. Start backend: npm run start:dev -w apps/server', 'cyan');
  log('   3. Start frontend apps', 'cyan');
  log('   4. Test login flow\n', 'cyan');
}

// Run setup
setup().catch(err => {
  error(`Setup failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
