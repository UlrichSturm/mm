# US-034: Управление пользователями

**Epic:** E-007 Admin Panel  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу управлять пользователями

---

## Acceptance Criteria

- [ ] Endpoint `GET /admin/users` - список пользователей
- [ ] Endpoint `PATCH /admin/users/:id` - block/unblock
- [ ] Пагинация и фильтрация
- [ ] Поиск по email

---

## API Specification

### List Users

```http
GET /admin/users?page=1&limit=10&role=CLIENT&search=ivan
Authorization: Bearer <admin-token>
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "ivan@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "role": "CLIENT",
      "isBlocked": false,
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

### Block/Unblock User

```http
PATCH /admin/users/uuid
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isBlocked": true
}
```

---

## Implementation

```typescript
@Get('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getUsers(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('role') role?: Role,
  @Query('search') search?: string,
) {
  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const [data, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count({ where }),
  ]);
  
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

@Patch('users/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async updateUser(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
) {
  return this.prisma.user.update({
    where: { id },
    data: { isBlocked: dto.isBlocked },
    select: { id: true, email: true, isBlocked: true },
  });
}
```

---

## Dependencies

- US-005 (RBAC)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

