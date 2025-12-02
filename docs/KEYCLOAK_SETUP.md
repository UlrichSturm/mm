# Keycloak Setup Guide

## Overview

Memento Mori uses **Keycloak** as Identity Provider (IdP) for authentication and user management.

- ✅ No custom password storage
- ✅ Centralized user management
- ✅ MFA out of the box
- ✅ Social login (Google, Facebook, etc.)
- ✅ OAuth 2.0 / OpenID Connect

---

## Quick Start (Development)

### 1. Start Keycloak

Keycloak is already configured in `docker-compose.dev.yml`:

```bash
docker-compose -f docker-compose.dev.yml up -d keycloak
```

**Keycloak Admin Console:** http://localhost:8080  
**Admin Credentials:** `admin` / `admin`

---

### 2. Create Realm

1. Open http://localhost:8080
2. Login with `admin` / `admin`
3. Click dropdown "master" → "Create Realm"
4. **Realm name:** `memento-mori`
5. Click "Create"

---

### 3. Create Client (Backend API)

1. Go to **Clients** → "Create client"
2. **Client ID:** `memento-mori-api`
3. **Client type:** OpenID Connect
4. Click "Next"
5. **Client authentication:** ON
6. **Authorization:** OFF
7. **Authentication flow:**
   - ✅ Standard flow
   - ✅ Direct access grants
8. Click "Save"
9. Go to **Credentials** tab
10. Copy **Client secret** → add to `.env`:

```env
KEYCLOAK_CLIENT_SECRET=your-secret-here
```

11. Go to **Settings** tab
12. **Valid redirect URIs:**
   - `http://localhost:3000/*`
   - `http://localhost:3002/*`
   - `http://localhost:3003/*`
13. **Web origins:** `+`
14. Click "Save"

---

### 4. Create Roles

Go to **Realm roles** → "Create role"

Create these roles:

| Role | Description |
|------|-------------|
| `client` | Regular client users |
| `vendor` | Funeral service vendors |
| `lawyer_notary` | Lawyers and notaries |
| `admin` | Platform administrators |

---

### 5. Create Test Users

#### Admin User

1. Go to **Users** → "Create user"
2. **Username:** `admin`
3. **Email:** `admin@mementomori.de`
4. **Email verified:** ON
5. Click "Create"
6. Go to **Credentials** tab
7. Click "Set password"
8. **Password:** `admin123`
9. **Temporary:** OFF
10. Click "Save"
11. Go to **Role mapping** tab
12. Click "Assign role"
13. Select `admin` role
14. Click "Assign"

#### Client User

Repeat for client user:

- **Username:** `client1`
- **Email:** `client1@test.com`
- **Password:** `password123`
- **Role:** `client`

#### Vendor User

- **Username:** `vendor1`
- **Email:** `vendor1@test.com`
- **Password:** `password123`
- **Role:** `vendor`

#### Lawyer User

- **Username:** `lawyer1`
- **Email:** `lawyer1@test.com`
- **Password:** `password123`
- **Role:** `lawyer_notary`

---

### 6. Configure Realm Settings

Go to **Realm settings**:

#### General

- **User registration:** ON (allow self-registration)
- **Forgot password:** ON
- **Remember me:** ON
- **Login with email:** ON

#### Login

- **Require SSL:** None (for development)

#### Tokens

- **Access Token Lifespan:** 5 minutes
- **SSO Session Idle:** 30 minutes
- **SSO Session Max:** 10 hours
- **Offline Session Idle:** 30 days

---

## Frontend Integration

### Client App (Next.js)

```bash
npm install keycloak-js
```

```typescript
// lib/keycloak.ts
import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'memento-mori',
  clientId: 'memento-mori-client',
});

export async function initKeycloak() {
  const authenticated = await keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  });

  if (authenticated) {
    // Save token
    localStorage.setItem('authToken', keycloak.token || '');
  }

  return authenticated;
}

export function login() {
  keycloak.login({
    redirectUri: window.location.origin + '/dashboard',
  });
}

export function logout() {
  keycloak.logout({
    redirectUri: window.location.origin,
  });
}

export function getToken() {
  return keycloak.token;
}

export function isAuthenticated() {
  return keycloak.authenticated;
}

// Auto-refresh token
keycloak.onTokenExpired = () => {
  keycloak.updateToken(30).catch(() => {
    keycloak.login();
  });
};
```

---

### Create Frontend Client in Keycloak

1. **Clients** → "Create client"
2. **Client ID:** `memento-mori-client`
3. **Client type:** OpenID Connect
4. Click "Next"
5. **Client authentication:** OFF (public client)
6. **Standard flow:** ON
7. **Direct access grants:** ON
8. Click "Save"
9. **Valid redirect URIs:**
   - `http://localhost:3000/*`
10. **Web origins:** `+`
11. Click "Save"

Repeat for:
- `memento-mori-vendor` (port 3002)
- `memento-mori-admin` (port 3003)

---

## API Authentication Flow

### 1. Client Login (Frontend)

```typescript
// User clicks "Login" button
keycloak.login({ redirectUri: 'http://localhost:3000/dashboard' });

// Keycloak redirects to login page
// User enters credentials
// Keycloak redirects back with token
// Frontend saves token
```

### 2. API Request (Frontend → Backend)

```http
GET /api/orders/my HTTP/1.1
Host: localhost:3001
Authorization: Bearer <keycloak_access_token>
```

### 3. Token Validation (Backend)

```typescript
// nest-keycloak-connect automatically:
// 1. Validates token signature
// 2. Checks expiration
// 3. Extracts user info (sub, email, roles)
// 4. Injects into req.user

// AuthController.getProfile()
const keycloakId = req.user.sub;
const user = await this.authService.findByKeycloakId(keycloakId);
```

---

## Role Mapping

| Keycloak Role | Application Role | Description |
|---------------|------------------|-------------|
| `client` | `CLIENT` | Regular users |
| `vendor` | `VENDOR` | Service vendors |
| `lawyer_notary` | `LAWYER_NOTARY` | Legal professionals |
| `admin` | `ADMIN` | Platform administrators |

---

## Testing Keycloak

### Get Access Token (Direct Access Grant)

```bash
curl -X POST http://localhost:8080/realms/memento-mori/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=memento-mori-api" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=client1@test.com" \
  -d "password=password123"
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

### Use Token in API Request

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

---

## Troubleshooting

### Error: "Invalid redirect URI"

**Solution:** Add redirect URI to client settings in Keycloak Admin Console.

### Error: "Client not found"

**Solution:** Verify client ID and realm name in `.env` match Keycloak configuration.

### Error: "Invalid token"

**Solution:**
- Check token hasn't expired (default: 5 minutes)
- Verify realm and client configuration
- Ensure backend KEYCLOAK_URL is correct

### CORS Issues

**Solution:** Add web origins in Keycloak client settings:
- For development: `http://localhost:3000`
- Or use `+` to allow all valid redirect URIs

---

## Production Setup

### Managed Keycloak (Recommended)

Consider using managed Keycloak services:

- **Red Hat SSO** (official)
- **Cloud-IAM**
- **Auth0** (alternative)

### Self-Hosted

1. Use official Keycloak Docker image
2. Configure PostgreSQL database
3. Enable HTTPS
4. Configure email (SMTP)
5. Set up regular backups
6. Monitor logs and performance

### Environment Variables (Production)

```env
KEYCLOAK_URL=https://auth.mementomori.de
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=<production-secret>
```

---

## Migration from JWT

The migration is already complete! ✅

**What was changed:**

1. ❌ Removed `@nestjs/jwt`, `@nestjs/passport`, `bcrypt`
2. ✅ Installed `nest-keycloak-connect`
3. ✅ Replaced JWT guards with Keycloak guards
4. ✅ Updated AuthService to sync users from Keycloak
5. ✅ Removed password hashing from seed scripts
6. ✅ Updated all controllers to use Keycloak decorators

**Frontend changes needed:**

- Replace custom login forms with Keycloak redirect
- Use `keycloak-js` library
- Remove password storage
- Use Keycloak token refresh

---

## Next Steps

1. ✅ Start Keycloak: `docker-compose -f docker-compose.dev.yml up -d keycloak`
2. ✅ Create realm `memento-mori`
3. ✅ Create client `memento-mori-api`
4. ✅ Create roles (`client`, `vendor`, `lawyer_notary`, `admin`)
5. ✅ Create test users
6. ⏱️ Test API with Keycloak token
7. ⏱️ Integrate frontend with Keycloak

---

**Ready to proceed with Keycloak setup!** 🔐

