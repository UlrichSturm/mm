# US-018: Удаление услуги

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу удалить услугу, чтобы убрать её из каталога

---

## Acceptance Criteria

- [ ] Endpoint `DELETE /services/:id` доступен только VENDOR
- [ ] Только владелец может удалить услугу
- [ ] Soft delete (status → DELETED) вместо hard delete
- [ ] Нельзя удалить если есть активные заказы
- [ ] 404 если услуга не найдена
- [ ] 403 если не владелец

---

## API Specification

### Request

```http
DELETE /services/uuid
Authorization: Bearer <vendor-token>
```

### Response (Success - 200)

```json
{
  "message": "Услуга успешно удалена",
  "id": "uuid"
}
```

### Response (Error - 400 - Has Active Orders)

```json
{
  "statusCode": 400,
  "message": "Cannot delete service with active orders",
  "error": "Bad Request"
}
```

### Response (Error - 403)

```json
{
  "statusCode": 403,
  "message": "You can only delete your own services",
  "error": "Forbidden"
}
```

---

## Technical Notes

- Soft delete: изменить status на DELETED
- Проверить наличие активных заказов (status != COMPLETED, CANCELLED)
- Deleted услуги не показываются в каталоге
- Можно восстановить через Admin (Phase 2)

---

## Database Schema Update

```prisma
enum ServiceStatus {
  ACTIVE
  INACTIVE
  PENDING_REVIEW
  DELETED  // Add this
}
```

---

## Implementation

```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async deleteService(
  @Param('id') id: string,
  @CurrentUser() user: User,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor profile not found');
  }
  
  const service = await this.prisma.service.findUnique({
    where: { id },
    include: {
      orders: {
        where: {
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      },
    },
  });
  
  if (!service) {
    throw new NotFoundException('Service not found');
  }
  
  if (service.vendorId !== vendor.id) {
    throw new ForbiddenException('You can only delete your own services');
  }
  
  if (service.orders.length > 0) {
    throw new BadRequestException('Cannot delete service with active orders');
  }
  
  // Soft delete
  await this.prisma.service.update({
    where: { id },
    data: { status: 'DELETED' },
  });
  
  return { message: 'Услуга успешно удалена', id };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-012 (Service model)
- US-023 (Orders - для проверки активных заказов)

---

## Test Cases

1. ✅ Владелец может удалить услугу без заказов
2. ✅ Услуга с активными заказами - ошибка
3. ✅ Не-владелец получает 403
4. ✅ CLIENT получает 403
5. ✅ Несуществующая услуга - 404
6. ✅ Удаленная услуга не показывается в каталоге

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

