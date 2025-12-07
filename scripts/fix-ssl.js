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

async function getRealm(token) {
  const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM_NAME}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to get realm: ${response.status}`);
  return response.json();
}

async function updateRealm() {
  try {
    console.log('Getting admin token...');
    const token = await getAdminToken();

    console.log(`Getting current realm settings...`);
    const currentRealm = await getRealm(token);

    console.log(`Updating realm '${REALM_NAME}' SSL settings...`);
    const updatedRealm = {
      ...currentRealm,
      sslRequired: 'none',
    };

    const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM_NAME}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRealm),
    });

    if (response.ok) {
      console.log('✅ Realm SSL settings updated to "none"');
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to update realm: ${response.status}`);
      console.error(errorText);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

updateRealm();
