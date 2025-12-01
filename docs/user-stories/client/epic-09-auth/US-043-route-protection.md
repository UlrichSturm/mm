# US-043: Защита роутов

**Epic:** E-009 Client Authentication  
**Portal:** Client App  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна защищать приватные страницы

---

## Acceptance Criteria

- [ ] Middleware для проверки auth
- [ ] Redirect на /login если не авторизован
- [ ] Сохранение redirect URL для возврата
- [ ] Защищенные страницы: /profile, /orders, /cart

---

## Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile', '/orders', '/cart', '/payments'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/orders/:path*', '/cart/:path*', '/payments/:path*'],
};
```

---

## Alternative: Client-side Protection

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${window.location.pathname}`);
    }
  }, [user, isLoading, router]);
  
  if (isLoading) return <div>Загрузка...</div>;
  if (!user) return null;
  
  return <>{children}</>;
}
```

---

## Dependencies

- US-040 (Login page)

---

## Definition of Done

- [ ] Middleware/protection работает
- [ ] Redirect на login работает
- [ ] Redirect back после логина работает
- [ ] Code review пройден

