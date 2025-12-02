# Keycloak Auto-Setup Guide

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

Run the setup script to automatically configure Keycloak:

```bash
# Make sure Keycloak is running
docker-compose -f docker-compose.dev.yml up -d keycloak

# Wait for Keycloak to be ready (30-60 seconds)
sleep 30

# Run setup script
node scripts/setup-keycloak.js
```

The script will:
- ✅ Create realm `memento-mori`
- ✅ Create 4 clients (api, client, vendor, admin)
- ✅ Create 4 roles (client, vendor, lawyer_notary, admin)
- ✅ Create 4 test users
- ✅ Display API client secret (add to `.env`)

### Option 2: Manual Setup

Follow the step-by-step guide in [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md).

---

## 📋 What Gets Created

### Realm
- **Name:** `memento-mori`
- **Display Name:** Memento Mori
- **Settings:**
  - Login with email: ✅
  - User registration: ✅
  - Remember me: ✅
  - Access token lifespan: 5 minutes
  - SSO session idle: 30 minutes

### Clients

| Client ID | Type | Redirect URIs | Web Origins |
|-----------|------|---------------|-------------|
| `memento-mori-api` | Confidential | - | - |
| `memento-mori-client` | Public | `http://localhost:3000/*` | `http://localhost:3000` |
| `memento-mori-vendor` | Public | `http://localhost:3002/*` | `http://localhost:3002` |
| `memento-mori-admin` | Public | `http://localhost:3003/*` | `http://localhost:3003` |

### Roles

- `client` - Regular users
- `vendor` - Service vendors
- `lawyer_notary` - Lawyers and notaries
- `admin` - Platform administrators

### Test Users

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `admin` | admin@mementomori.de | admin123 | admin |
| `client1` | client1@test.com | password123 | client |
| `vendor1` | vendor1@test.com | password123 | vendor |
| `lawyer1` | lawyer1@test.com | password123 | lawyer_notary |

---

## 🔧 Environment Variables

After running the setup script, add the API client secret to your `.env`:

```env
# apps/server/.env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=<secret-from-script-output>
```

---

## 🧪 Testing

### Test Keycloak Setup

```bash
# Run test script
./scripts/test-keycloak-flow.sh
```

The test script will:
1. ✅ Check Keycloak health
2. ✅ Verify realm exists
3. ✅ Get client secret
4. ✅ Test user login
5. ✅ Test API authentication
6. ✅ Test protected endpoints

### Manual Testing

#### 1. Get Access Token

```bash
curl -X POST http://localhost:8080/realms/memento-mori/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=memento-mori-api" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=password" \
  -d "username=client1@test.com" \
  -d "password=password123"
```

#### 2. Use Token in API Request

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

---

## 🔄 Re-running Setup

The script is idempotent - you can run it multiple times safely:

- Existing realms/clients/roles/users are skipped
- Only missing items are created
- No data is deleted

To reset everything:

1. Delete realm in Keycloak Admin Console
2. Run setup script again

---

## 🐛 Troubleshooting

### Error: "Keycloak is not accessible"

**Solution:**
```bash
# Check if Keycloak is running
docker ps | grep keycloak

# Start Keycloak
docker-compose -f docker-compose.dev.yml up -d keycloak

# Wait for it to be ready
sleep 30
```

### Error: "Failed to get admin token"

**Solution:**
- Check `KEYCLOAK_ADMIN_USER` and `KEYCLOAK_ADMIN_PASSWORD`
- Default: `admin` / `admin`
- Verify in Keycloak Admin Console

### Error: "Client secret not found"

**Solution:**
- Ensure client `memento-mori-api` exists
- Check if client is configured as "Confidential" (not Public)
- Manually get secret from Keycloak Admin Console:
  1. Go to Clients → memento-mori-api
  2. Click "Credentials" tab
  3. Copy "Client secret"

### Error: "User already exists"

**Solution:**
- This is normal - script skips existing users
- To recreate user, delete in Keycloak Admin Console first

---

## 📝 Script Options

### Custom Environment Variables

```bash
KEYCLOAK_URL=http://localhost:8080 \
KEYCLOAK_ADMIN_USER=admin \
KEYCLOAK_ADMIN_PASSWORD=admin \
node scripts/setup-keycloak.js
```

### Production Setup

For production, use environment variables:

```bash
export KEYCLOAK_URL=https://auth.mementomori.de
export KEYCLOAK_ADMIN_USER=admin
export KEYCLOAK_ADMIN_PASSWORD=<secure-password>
node scripts/setup-keycloak.js
```

---

## ✅ Verification Checklist

After running the setup script, verify:

- [ ] Realm `memento-mori` exists
- [ ] 4 clients created
- [ ] 4 roles created
- [ ] 4 test users created
- [ ] API client secret obtained
- [ ] Test script passes
- [ ] Can login via Keycloak
- [ ] API accepts Keycloak tokens

---

**Ready to test!** 🎉

