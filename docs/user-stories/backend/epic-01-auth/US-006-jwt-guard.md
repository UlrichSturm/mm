# US-006: Keycloak Guard защита endpoints

**Epic:** E-001 Authentication & Authorization
**Portal:** Backend
**Приоритет:** 🔴 Must Have
**Story Points:** 2
**Статус:** ✅ Выполнено

---

## User Story

**Как система**, я должна защищать endpoints от неавторизованного доступа используя Keycloak токены

---

## Acceptance Criteria

- [ ] AuthGuard из nest-keycloak-connect проверяет наличие и валидность Keycloak токена
- [ ] Токен передается в Authorization header: `Bearer <token>`
- [ ] При валидном токене user добавляется в request
- [ ] 401 Unauthorized для невалидных/отсутствующих токенов
- [ ] Keycloak валидирует токен используя публичный ключ realm
- [ ] @UseGuards(AuthGuard) декоратор для защиты endpoints
- [ ] @Public() декоратор для публичных endpoints

---

## Implementation

### Keycloak Module Configuration

```typescript
// src/auth/keycloak.config.ts
import { KeycloakConnectOptions } from 'nest-keycloak-connect';

export const keycloakConfig: KeycloakConnectOptions = {
  authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'memento-mori',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'memento-mori-api',
  secret: process.env.KEYCLOAK_CLIENT_SECRET,
};
```

### Auth Module Setup

```typescript
// src/auth/auth.module.ts
import { Module, Global } from '@nestjs/common';
import { KeycloakConnectModule, AuthGuard, RoleGuard } from 'nest-keycloak-connect';
import { keycloakConfig } from './keycloak.config';

@Global()
@Module({
  imports: [KeycloakConnectModule.register(keycloakConfig)],
  providers: [
    {
      provide: AuthGuard,
      useClass: AuthGuard,
    },
    {
      provide: RoleGuard,
      useClass: RoleGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
```

### Usage Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { AuthGuard, Roles, Resource, Public } from 'nest-keycloak-connect';

@Controller('profile')
@Resource('profile')
export class ProfileController {
  @Get()
  @Roles({ roles: ['client', 'vendor', 'admin'] })
  @UseGuards(AuthGuard)
  getProfile(@Request() req) {
    // req.user содержит данные из Keycloak токена
    return req.user;
  }

  @Get('public')
  @Public()
  getPublicData() {
    // Публичный endpoint, не требует авторизации
    return { message: 'Public data' };
  }
}
```

---

## API Response (401)

```json
{
  "statusCode": 401,
  "message": "Invalid or missing token",
  "error": "Unauthorized"
}
```

---

## Technical Notes

- Keycloak автоматически валидирует токены используя публичный ключ realm
- Token expiration управляется в Keycloak (обычно 5 минут для access token, 30 минут для refresh token)
- Payload структура из Keycloak: `{ sub: userId, email, preferred_username, realm_access: { roles: [...] } }`
- `req.user` содержит данные из Keycloak токена
- `@Public()` декоратор для публичных endpoints
- `@Resource()` декоратор для указания ресурса
- `@Roles()` декоратор для указания требуемых ролей

---

## Environment Variables

```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=memento-mori
KEYCLOAK_CLIENT_ID=memento-mori-api
KEYCLOAK_CLIENT_SECRET=your-client-secret
```

---

## Dependencies

- `nest-keycloak-connect`
- `keycloak-connect`

---

## Test Cases

1. ✅ Запрос с валидным Keycloak токеном - доступ разрешен
2. ✅ Запрос без токена - 401
3. ✅ Запрос с невалидным токеном - 401
4. ✅ Запрос с expired токеном - 401
5. ✅ User доступен через req.user
6. ✅ User содержит правильные данные из Keycloak токена
7. ✅ Публичные endpoints доступны без токена (@Public())
8. ✅ Роли проверяются корректно (@Roles())

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] Документация обновлена
- [ ] Code review пройден
