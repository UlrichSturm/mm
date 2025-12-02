# Frontend Keycloak Integration Guide

## ✅ Integration Complete!

All three frontend applications are now integrated with Keycloak:

- ✅ **Client App** (`apps/client`)
- ✅ **Vendor Portal** (`apps/vendor-portal`)
- ✅ **Admin Portal** (`apps/admin-portal`)

---

## 📦 What Was Installed

```bash
# All three apps now have:
npm install keycloak-js
```

---

## 🔧 Configuration

### Environment Variables

Each app needs these environment variables (add to `.env.local`):

#### Client App (`apps/client/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-client
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Vendor Portal (`apps/vendor-portal/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-vendor
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Admin Portal (`apps/admin-portal/.env.local`)

```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=memento-mori
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=memento-mori-admin
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🏗️ Architecture

### Keycloak Integration Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User clicks "Login"
       ▼
┌─────────────────────┐
│  Frontend App       │
│  (Next.js)          │
│  - KeycloakProvider │
│  - keycloak.login() │
└──────┬──────────────┘
       │
       │ 2. Redirect to Keycloak
       ▼
┌─────────────────────┐
│  Keycloak Server    │
│  - Login Page       │
│  - User enters      │
│    credentials      │
└──────┬──────────────┘
       │
       │ 3. Redirect with token
       ▼
┌─────────────────────┐
│  Frontend App       │
│  - Save token       │
│  - Update state     │
└──────┬──────────────┘
       │
       │ 4. API Request with token
       ▼
┌─────────────────────┐
│  Backend API        │
│  - Validate token   │
│  - Extract user     │
│  - Return data      │
└─────────────────────┘
```

---

## 📁 File Structure

### Client App

```
apps/client/
├── src/
│   ├── lib/
│   │   ├── keycloak.ts          # Keycloak config & init
│   │   ├── auth.ts              # Auth utilities (updated)
│   │   └── api.ts               # API client (updated)
│   ├── components/
│   │   └── auth/
│   │       └── KeycloakProvider.tsx  # React context provider
│   └── app/
│       ├── layout.tsx           # Wrapped with KeycloakProvider
│       └── auth/
│           ├── signin/
│           │   └── page.tsx    # Uses Keycloak login
│           └── register/
│               └── page.tsx    # Uses Keycloak register
└── public/
    └── silent-check-sso.html    # SSO check page
```

### Vendor Portal

```
apps/vendor-portal/
├── src/
│   ├── lib/
│   │   └── keycloak.ts          # Keycloak config
│   ├── components/
│   │   └── auth/
│   │       └── KeycloakProvider.tsx
│   └── app/
│       └── layout.tsx           # Wrapped with KeycloakProvider
└── public/
    └── silent-check-sso.html
```

### Admin Portal

```
apps/admin-portal/
├── src/
│   ├── lib/
│   │   └── keycloak.ts          # Keycloak config
│   ├── components/
│   │   └── auth/
│   │       └── KeycloakProvider.tsx
│   └── app/
│       ├── layout.tsx           # Wrapped with KeycloakProvider
│       └── auth/
│           └── login/
│               └── page.tsx    # Uses Keycloak login
└── public/
    └── silent-check-sso.html
```

---

## 🔑 Key Features

### 1. Automatic Token Refresh

Tokens are automatically refreshed 30 seconds before expiration:

```typescript
keycloak.onTokenExpired = () => {
  keycloak.updateToken(30).then((refreshed) => {
    if (refreshed && keycloak.token) {
      localStorage.setItem('authToken', keycloak.token);
    }
  });
};
```

### 2. Silent SSO Check

On page load, Keycloak silently checks if user is already authenticated:

```typescript
keycloak.init({
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
});
```

### 3. React Context Provider

All apps use a `KeycloakProvider` that provides:

- `isAuthenticated` - boolean
- `isLoading` - boolean
- `user` - user info from token
- `login()` - redirect to Keycloak login
- `logout()` - redirect to Keycloak logout

### 4. API Integration

All API requests automatically include the Keycloak token:

```typescript
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken(); // From Keycloak
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
```

---

## 🚀 Usage Examples

### Using Keycloak in Components

```typescript
'use client';

import { useKeycloak } from '@/components/auth/KeycloakProvider';

export function MyComponent() {
  const { isAuthenticated, user, login, logout } = useKeycloak();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```typescript
'use client';

import { useKeycloak } from '@/components/auth/KeycloakProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>Protected Content</div>;
}
```

### Making Authenticated API Calls

```typescript
import { getAuthToken } from '@/lib/auth';

async function fetchUserData() {
  const token = getAuthToken();
  
  const response = await fetch('http://localhost:3001/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

---

## 🔐 Role-Based Access

Check user roles:

```typescript
import { hasRole, getUserRoles } from '@/lib/keycloak';

// Check if user has specific role
if (hasRole('admin')) {
  // Show admin features
}

// Get all user roles
const roles = getUserRoles();
// ['client', 'vendor', 'admin', ...]
```

---

## 🧪 Testing

### 1. Start Keycloak

```bash
docker-compose -f docker-compose.dev.yml up -d keycloak
```

### 2. Configure Keycloak

Follow [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) to:
- Create realm `memento-mori`
- Create clients:
  - `memento-mori-client` (for Client App)
  - `memento-mori-vendor` (for Vendor Portal)
  - `memento-mori-admin` (for Admin Portal)
- Create roles: `client`, `vendor`, `lawyer_notary`, `admin`
- Create test users

### 3. Start Frontend Apps

```bash
# Client App
cd apps/client
npm run dev

# Vendor Portal
cd apps/vendor-portal
npm run dev

# Admin Portal
cd apps/admin-portal
npm run dev
```

### 4. Test Login Flow

1. Open http://localhost:3000 (Client App)
2. Click "Sign In"
3. Redirected to Keycloak login
4. Enter credentials
5. Redirected back with token
6. User is authenticated

---

## 🐛 Troubleshooting

### Error: "Invalid redirect URI"

**Solution:** Add redirect URI to Keycloak client settings:
- `http://localhost:3000/*` (Client App)
- `http://localhost:3002/*` (Vendor Portal)
- `http://localhost:3003/*` (Admin Portal)

### Error: "Client not found"

**Solution:** Verify client ID in `.env.local` matches Keycloak client configuration.

### Token not refreshing

**Solution:** Check browser console for errors. Ensure `silent-check-sso.html` is accessible.

### CORS errors

**Solution:** Add web origins in Keycloak client settings:
- `http://localhost:3000`
- `http://localhost:3002`
- `http://localhost:3003`

---

## 📝 Next Steps

1. ✅ Keycloak integration complete
2. ⏱️ Configure Keycloak realm and clients
3. ⏱️ Create test users
4. ⏱️ Test full authentication flow
5. ⏱️ Update API calls to use Keycloak tokens

---

**All frontend apps are ready for Keycloak!** 🎉

