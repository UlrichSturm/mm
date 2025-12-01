# US-005: RBAC система

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна разграничивать доступ по ролям (CLIENT, VENDOR, ADMIN), чтобы обеспечить безопасность

---

## Acceptance Criteria

- [ ] Role enum в модели User (CLIENT, VENDOR, ADMIN)
- [ ] `@Roles()` декоратор для указания требуемых ролей
- [ ] `RolesGuard` для проверки ролей пользователя
- [ ] 403 Forbidden для пользователей без нужной роли
- [ ] Комбинирование с JwtAuthGuard
- [ ] Поддержка множественных ролей в декораторе

---

## Implementation

### Roles Enum

```typescript
// src/auth/enums/role.enum.ts
export enum Role {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}
```

### Roles Decorator

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
}
```

### Usage Example

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles(Role.ADMIN)
  getUsers() {
    // Only ADMIN can access
  }
  
  @Get('vendors')
  @Roles(Role.ADMIN, Role.VENDOR)
  getVendors() {
    // ADMIN and VENDOR can access
  }
}
```

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

- RolesGuard должен использоваться ПОСЛЕ JwtAuthGuard
- JwtAuthGuard добавляет user в request
- RolesGuard проверяет user.role
- Можно указывать несколько ролей: `@Roles(Role.ADMIN, Role.VENDOR)`

---

## Dependencies

- US-001 (Role enum в User model)
- US-006 (JwtAuthGuard)

---

## Test Cases

1. ✅ ADMIN может доступ к @Roles(Role.ADMIN)
2. ✅ CLIENT не может доступ к @Roles(Role.ADMIN) - 403
3. ✅ VENDOR может доступ к @Roles(Role.VENDOR)
4. ✅ Множественные роли работают
5. ✅ Без @Roles() доступ разрешен всем авторизованным

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] Документация обновлена
- [ ] Code review пройден

