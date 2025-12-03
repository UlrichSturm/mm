# US-005: RBAC система

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ✅ Выполнено

---

## User Story

**Как система**, я должна разграничивать доступ по ролям (client, vendor, admin) через Keycloak, чтобы обеспечить безопасность

---

## Acceptance Criteria

- [ ] Роли созданы в Keycloak realm (client, vendor, admin)
- [ ] `@Roles()` декоратор из nest-keycloak-connect для указания требуемых ролей
- [ ] `RoleGuard` из nest-keycloak-connect проверяет роли пользователя
- [ ] 403 Forbidden для пользователей без нужной роли
- [ ] Комбинирование с AuthGuard из nest-keycloak-connect
- [ ] Поддержка множественных ролей в декораторе
- [ ] Роли синхронизируются между Keycloak и локальной БД

---

## Implementation

### Keycloak Roles Setup

Роли создаются в Keycloak realm `memento-mori`:

- `client` - для обычных пользователей
- `vendor` - для поставщиков услуг
- `admin` - для администраторов

### Usage Example

```typescript
import { Controller, Get } from '@nestjs/common';
import { AuthGuard, RoleGuard, Roles, Resource } from 'nest-keycloak-connect';

@Controller('admin')
@Resource('admin')
@UseGuards(AuthGuard, RoleGuard)
export class AdminController {
  @Get('users')
  @Roles({ roles: ['admin'] })
  getUsers() {
    // Only admin role can access
  }

  @Get('vendors')
  @Roles({ roles: ['admin', 'vendor'] })
  getVendors() {
    // admin and vendor roles can access
  }
}
```

### Role Mapping

Keycloak роли автоматически проверяются через `nest-keycloak-connect`:

- Роли извлекаются из токена: `token.realm_access.roles`
- `RoleGuard` проверяет наличие требуемых ролей
- Локальная БД синхронизируется с Keycloak при логине

---

## API Response (403)

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## Technical Notes

- RoleGuard должен использоваться ПОСЛЕ AuthGuard
- AuthGuard добавляет user в request из Keycloak токена
- RoleGuard проверяет роли из `token.realm_access.roles`
- Можно указывать несколько ролей: `@Roles({ roles: ['admin', 'vendor'] })`
- Роли управляются в Keycloak, не в коде

---

## Dependencies

- US-006 (Keycloak AuthGuard)
- Keycloak realm с настроенными ролями

---

## Test Cases

1. ✅ admin роль может доступ к @Roles({ roles: ['admin'] })
2. ✅ client роль не может доступ к @Roles({ roles: ['admin'] }) - 403
3. ✅ vendor роль может доступ к @Roles({ roles: ['vendor'] })
4. ✅ Множественные роли работают: @Roles({ roles: ['admin', 'vendor'] })
5. ✅ Без @Roles() доступ разрешен всем авторизованным
6. ✅ Роли извлекаются из Keycloak токена корректно

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] Документация обновлена
- [ ] Code review пройден
