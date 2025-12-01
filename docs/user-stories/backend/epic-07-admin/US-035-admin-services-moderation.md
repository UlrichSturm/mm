# US-035: Модерация услуг

**Epic:** E-007 Admin Panel  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу модерировать услуги

---

## Acceptance Criteria

- [ ] Endpoint `GET /admin/services` - список услуг
- [ ] Endpoint `PATCH /admin/services/:id/status` - изменение статуса
- [ ] Фильтрация по статусам
- [ ] Включает данные vendor

---

## API Specification

### List Services

```http
GET /admin/services?status=PENDING_REVIEW&page=1&limit=10
Authorization: Bearer <admin-token>
```

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Организация похорон",
      "price": 45000,
      "status": "PENDING_REVIEW",
      "vendor": {
        "businessName": "Ритуальные услуги АИ"
      },
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],
  "meta": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### Update Status

```http
PATCH /admin/services/uuid/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

---

## Implementation

```typescript
@Get('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getServices(
  @Query('status') status?: ServiceStatus,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  const where: Prisma.ServiceWhereInput = {};
  if (status) where.status = status;
  
  const [data, total] = await Promise.all([
    this.prisma.service.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { vendor: { select: { businessName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.service.count({ where }),
  ]);
  
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

@Patch('services/:id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async updateServiceStatus(
  @Param('id') id: string,
  @Body() dto: UpdateServiceStatusDto,
) {
  const service = await this.prisma.service.update({
    where: { id },
    data: { status: dto.status },
  });
  
  return { ...service, message: 'Статус услуги обновлен' };
}
```

---

## Dependencies

- US-005 (RBAC)
- US-012 (Service model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

