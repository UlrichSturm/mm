# US-006: JWT Guard защита endpoints

**Epic:** E-001 Authentication & Authorization  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна защищать endpoints от неавторизованного доступа

---

## Acceptance Criteria

- [ ] JwtAuthGuard проверяет наличие и валидность JWT токена
- [ ] Токен передается в Authorization header: `Bearer <token>`
- [ ] При валидном токене user добавляется в request
- [ ] 401 Unauthorized для невалидных/отсутствующих токенов
- [ ] JwtStrategy извлекает payload из токена
- [ ] @UseGuards(JwtAuthGuard) декоратор для защиты endpoints

---

## Implementation

### JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
```

### JWT Auth Guard

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
```

### Current User Decorator

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Usage Example

```typescript
@Controller('profile')
export class ProfileController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return user;
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

- JWT_SECRET должен быть в .env (минимум 32 символа)
- Token expiration: 24h для MVP
- Payload структура: `{ sub: userId, email, role }`
- `@CurrentUser()` декоратор для удобного доступа к user

---

## Environment Variables

```env
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRATION=24h
```

---

## Dependencies

- `@nestjs/passport`
- `@nestjs/jwt`
- `passport-jwt`

---

## Test Cases

1. ✅ Запрос с валидным токеном - доступ разрешен
2. ✅ Запрос без токена - 401
3. ✅ Запрос с невалидным токеном - 401
4. ✅ Запрос с expired токеном - 401
5. ✅ User доступен через @CurrentUser()
6. ✅ User содержит правильные данные из токена

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] Документация обновлена
- [ ] Code review пройден

