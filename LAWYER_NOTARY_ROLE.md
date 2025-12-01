# Роль Адвокат/Нотариус (Lawyer/Notary)

## Обзор

Добавлена новая роль `LAWYER_NOTARY` в систему для заверения и исполнения завещаний.

## Что было добавлено

### 1. Enum ролей
- **Файл**: `apps/server/src/common/enums/role.enum.ts`
- Содержит все роли: `CLIENT`, `VENDOR`, `LAWYER_NOTARY`, `ADMIN`

### 2. Guards и Decorators
- **RolesGuard**: `apps/server/src/common/guards/roles.guard.ts` - проверяет роли пользователя
- **JwtAuthGuard**: `apps/server/src/common/guards/jwt-auth.guard.ts` - проверяет JWT токен (заглушка для будущей реализации)
- **Roles Decorator**: `apps/server/src/common/decorators/roles.decorator.ts` - декоратор для указания требуемых ролей

### 3. Модуль LawyerNotary
- **Сервис**: `apps/server/src/lawyer-notary/lawyer-notary.service.ts`
  - Управление профилями адвокатов/нотариусов
  - Статусы: PENDING, APPROVED, REJECTED
  - Поля профиля:
    - `licenseNumber` - номер лицензии
    - `licenseType` - тип: 'LAWYER', 'NOTARY', или 'BOTH'
    - `organizationName` - название организации (опционально)
    - `specialization` - специализация
    - `yearsOfExperience` - годы опыта

- **Контроллер**: `apps/server/src/lawyer-notary/lawyer-notary.controller.ts`
  - `POST /lawyer-notary` - создание профиля (только Admin)
  - `GET /lawyer-notary` - список профилей (только Admin)
  - `GET /lawyer-notary/me` - свой профиль (Lawyer/Notary или Admin)
  - `GET /lawyer-notary/:id` - профиль по ID
  - `PATCH /lawyer-notary/me` - обновление своего профиля
  - `PATCH /lawyer-notary/:id` - обновление профиля (Admin)
  - `PATCH /lawyer-notary/:id/status` - изменение статуса (Admin)
  - `DELETE /lawyer-notary/:id` - удаление профиля (Admin)

- **Модуль**: `apps/server/src/lawyer-notary/lawyer-notary.module.ts`

### 4. Обновления документации
- Обновлен `docs/SYSTEM_ARCHITECTURE.md`:
  - Добавлена роль `LAWYER_NOTARY` в список ролей
  - Добавлен раздел о LawyerNotaryModule
  - Обновлена матрица доступа
  - Добавлены эндпоинты в API summary
  - Добавлен процесс регистрации и одобрения адвокатов/нотариусов

## Права доступа

### Роль LAWYER_NOTARY может:
- Просматривать свой профиль (`GET /lawyer-notary/me`)
- Обновлять свой профиль (`PATCH /lawyer-notary/me`)
- Заверять и исполнять завещания (после одобрения администратором)

### Роль ADMIN может:
- Создавать профили адвокатов/нотариусов
- Просматривать все профили
- Одобрять/отклонять профили (изменять статус)
- Удалять профили

## Следующие шаги

Для полной реализации аутентификации необходимо:

1. Установить зависимости:
```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install -D @types/passport-jwt
```

2. Реализовать AuthModule с:
   - JWT стратегией
   - Регистрацией пользователей с ролью LAWYER_NOTARY
   - Логином и выдачей токенов

3. Подключить базу данных (Prisma) для хранения профилей

4. Реализовать модуль Wills для работы с завещаниями

## Использование

Пример использования в контроллере:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('some-endpoint')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LAWYER_NOTARY, Role.ADMIN)
export class SomeController {
  // Только адвокаты/нотариусы и админы могут использовать этот контроллер
}
```

