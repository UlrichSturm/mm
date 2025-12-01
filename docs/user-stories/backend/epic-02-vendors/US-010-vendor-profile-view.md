# US-010: Просмотр своего профиля (Vendor)

**Epic:** E-002 Vendors Management  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу видеть свой профиль, чтобы проверить статус модерации и мои данные

---

## Acceptance Criteria

- [ ] Endpoint `GET /vendors/me` доступен только VENDOR
- [ ] Возвращает профиль текущего авторизованного vendor
- [ ] Включает статус модерации
- [ ] Включает причину отклонения (если REJECTED)
- [ ] Включает статистику (количество услуг, заказов) - опционально

---

## API Specification

### Request

```http
GET /vendors/me
Authorization: Bearer <vendor-token>
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "businessName": "Ритуальные услуги АИ",
  "description": "Полный спектр ритуальных услуг",
  "contactEmail": "contact@vendor.com",
  "contactPhone": "+7 999 123-45-67",
  "address": "г. Москва, ул. Примерная, д. 1",
  "postalCode": "123456",
  "status": "APPROVED",
  "rejectionReason": null,
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-01T12:00:00Z",
  "stats": {
    "servicesCount": 5,
    "ordersCount": 12,
    "pendingOrdersCount": 2
  }
}
```

### Response (Rejected Vendor)

```json
{
  "id": "uuid",
  "businessName": "Ритуальные услуги АИ",
  "status": "REJECTED",
  "rejectionReason": "Недостаточно информации о компании",
  "message": "Ваша заявка отклонена. Пожалуйста, обновите профиль и подайте заявку повторно."
}
```

### Response (Error - 403)

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

---

## Technical Notes

- Получать vendor по userId из JWT токена
- Использовать `@Roles(Role.VENDOR)` декоратор
- Добавить статистику через агрегатные запросы
- Показывать сообщение при REJECTED статусе

---

## Implementation

```typescript
@Get('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async getMyProfile(@CurrentUser() user: User) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor profile not found');
  }
  
  // Get stats
  const [servicesCount, ordersCount, pendingOrdersCount] = await Promise.all([
    this.prisma.service.count({ where: { vendorId: vendor.id } }),
    this.prisma.order.count({ where: { service: { vendorId: vendor.id } } }),
    this.prisma.order.count({ 
      where: { service: { vendorId: vendor.id }, status: 'PENDING' } 
    }),
  ]);
  
  return {
    ...vendor,
    stats: { servicesCount, ordersCount, pendingOrdersCount },
  };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-007 (VendorProfile model)

---

## Test Cases

1. ✅ VENDOR может получить свой профиль
2. ✅ CLIENT получает 403
3. ✅ Статистика возвращается корректно
4. ✅ REJECTED vendor видит причину отклонения

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

