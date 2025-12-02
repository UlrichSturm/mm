/* eslint-disable */
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || 'admin';
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
const REALM_NAME = 'memento-mori';

async function getAdminToken() {
  const response = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: KEYCLOAK_ADMIN_USER,
      password: KEYCLOAK_ADMIN_PASSWORD,
    }),
  });
  if (!response.ok) throw new Error(`Failed to get token: ${response.status}`);
  return (await response.json()).access_token;
}

async function updateRealm() {
  try {
    console.log('Getting admin token...');
    const token = await getAdminToken();

    console.log(`Updating realm '${REALM_NAME}' SSL settings...`);
    const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM_NAME}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sslRequired: 'none',
      }),
    });

    if (response.ok) {
      console.log('✅ Realm SSL settings updated to "none"');
    } else {
      console.error(`❌ Failed to update realm: ${response.status}`);
      console.error(await response.text());
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateRealm();
