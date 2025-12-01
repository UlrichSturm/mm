# US-009: Модерация поставщика

**Epic:** E-002 Vendors Management  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу одобрить/отклонить поставщика, чтобы контролировать качество платформы

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /admin/vendors/:id/status` доступен только ADMIN
- [ ] Можно изменить статус: PENDING → APPROVED / REJECTED
- [ ] При отклонении можно указать причину (rejectionReason)
- [ ] Email уведомление поставщику при изменении статуса
- [ ] История изменений статуса (опционально для MVP)
- [ ] Валидация переходов статусов

---

## API Specification

### Request (Approve)

```http
PATCH /admin/vendors/uuid/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "APPROVED"
}
```

### Request (Reject)

```http
PATCH /admin/vendors/uuid/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "REJECTED",
  "rejectionReason": "Недостаточно информации о компании. Пожалуйста, добавьте описание услуг."
}
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "businessName": "Ритуальные услуги АИ",
  "status": "APPROVED",
  "updatedAt": "2025-12-01T12:00:00Z",
  "message": "Статус поставщика успешно обновлен"
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": "Invalid status transition: APPROVED → PENDING",
  "error": "Bad Request"
}
```

---

## Status Transitions

```
PENDING → APPROVED ✅
PENDING → REJECTED ✅
APPROVED → SUSPENDED ✅
SUSPENDED → APPROVED ✅
REJECTED → PENDING ✅ (повторная заявка)
```

---

## Technical Notes

- Валидировать переходы статусов
- При REJECTED требуется rejectionReason
- Отправлять email через EmailModule (интеграция с Epic 8)
- Логировать все изменения статусов

---

## Implementation

```typescript
@Patch('vendors/:id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async updateVendorStatus(
  @Param('id') id: string,
  @Body() dto: UpdateVendorStatusDto,
  @CurrentUser() admin: User,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor not found');
  }
  
  // Validate status transition
  this.validateStatusTransition(vendor.status, dto.status);
  
  // Require reason for rejection
  if (dto.status === 'REJECTED' && !dto.rejectionReason) {
    throw new BadRequestException('Rejection reason is required');
  }
  
  const updated = await this.prisma.vendorProfile.update({
    where: { id },
    data: { 
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    },
  });
  
  // Send email notification
  await this.emailService.sendVendorStatusEmail(vendor.user.email, dto.status, dto.rejectionReason);
  
  return { ...updated, message: 'Статус поставщика успешно обновлен' };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-007 (VendorProfile model)
- US-037 (Email при изменении статуса - Epic 8)

---

## Test Cases

1. ✅ ADMIN может одобрить vendor
2. ✅ ADMIN может отклонить vendor с причиной
3. ✅ Отклонение без причины - ошибка
4. ✅ CLIENT получает 403
5. ✅ Невалидный переход статуса - ошибка
6. ✅ Email отправляется при изменении статуса

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден
- [ ] Email интеграция работает

