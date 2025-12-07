# Test Credentials for All Services

> ⚠️ **Warning**: These credentials are for development and testing only. Never use these in production!

---

## 🔐 Admin Portal

**URL:** http://localhost:3003/auth/login

| Email | Password | Role |
|-------|----------|------|
| `admin@mementomori.com` | `admin123456` | ADMIN |

**Alternative (from setup script):**
- Email: `admin@memento-mori.com`
- Password: `OVrgGAAXKp2z6*qG`

---

## 🏪 Vendor Portal

**URL:** http://localhost:3002/auth/login

| Email | Password | Role |
|-------|----------|------|
| `vendor@mementomori.com` | `vendor123456` | VENDOR |

**Alternative test vendors (from seed):**
- `vendor1@test.com` / `password123`
- `vendor2@test.com` / `password123`
- `vendor3@test.com` / `password123`

---

## 👤 Client Portal

**URL:** http://localhost:3000

| Email | Password | Role |
|-------|----------|------|
| `client1@test.com` | `password123` | CLIENT |

**Additional test clients:**
- `client2@test.com` / `password123`
- `client3@test.com` / `password123`
- `client4@test.com` / `password123`

---

## ⚖️ Lawyer/Notary Accounts

**URL:** http://localhost:3002/auth/login (Vendor Portal)

| Email | Password | Type |
|-------|----------|------|
| `lawyer1@test.com` | `password123` | LAWYER |
| `notary1@test.com` | `password123` | NOTARY |

---

## 🔑 Keycloak Admin Console

**URL:** http://localhost:8080

| Username | Password |
|----------|----------|
| `admin` | `admin` |

**Realm:** `memento-mori`

---

## 📝 Notes

1. **All users are managed by Keycloak** - passwords are stored in Keycloak, not in the application database
2. **To create new test users**, use the setup scripts:
   - `scripts/create-admin-in-keycloak.sh` - Create admin user
   - `scripts/create-vendor-in-keycloak.sh` - Create vendor user
3. **To seed database with test data** (users must exist in Keycloak first):
   ```bash
   cd apps/server
   npm run db:seed
   ```
4. **Domain note**: Use `.com` domain for logins (not `.ru`)

---

## 🚀 Quick Test

### Test Admin Portal Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mementomori.com","password":"admin123456"}'
```

### Test Vendor Portal Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@mementomori.com","password":"vendor123456"}'
```

### Test Client Portal Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@test.com","password":"password123"}'
```

---

**Last Updated:** 2025-12-02
