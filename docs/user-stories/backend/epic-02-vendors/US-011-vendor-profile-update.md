# US-011: Обновление профиля (Vendor)

**Epic:** E-002 Vendors Management  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу обновить свой профиль, чтобы изменить контактные данные или информацию о бизнесе

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /vendors/me` доступен только VENDOR
- [ ] Можно обновить: businessName, description, contactEmail, contactPhone, address, postalCode
- [ ] Валидация данных
- [ ] При статусе REJECTED обновление сбрасывает на PENDING (повторная модерация)
- [ ] Нельзя изменить status напрямую

---

## API Specification

### Request

```http
PATCH /vendors/me
Authorization: Bearer <vendor-token>
Content-Type: application/json

{
  "businessName": "Новое название компании",
  "description": "Обновленное описание услуг",
  "contactPhone": "+7 999 999-99-99"
}
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "businessName": "Новое название компании",
  "description": "Обновленное описание услуг",
  "contactPhone": "+7 999 999-99-99",
  "status": "APPROVED",
  "updatedAt": "2025-12-01T14:00:00Z",
  "message": "Профиль успешно обновлен"
}
```

### Response (Re-moderation Required)

```json
{
  "id": "uuid",
  "businessName": "Новое название компании",
  "status": "PENDING",
  "message": "Профиль обновлен и отправлен на повторную модерацию"
}
```

---

## Update DTO

```typescript
export class UpdateVendorProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  businessName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(5, 10)
  postalCode?: string;
}
```

---

## Technical Notes

- Использовать partial update (только переданные поля)
- Если vendor был REJECTED и обновляет профиль - статус → PENDING
- Логировать изменения
- Не позволять изменять status через этот endpoint

---

## Implementation

```typescript
@Patch('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async updateMyProfile(
  @CurrentUser() user: User,
  @Body() dto: UpdateVendorProfileDto,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor profile not found');
  }
  
  // If rejected, resubmit for moderation
  const needsRemoderation = vendor.status === 'REJECTED';
  
  const updated = await this.prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      ...dto,
      status: needsRemoderation ? 'PENDING' : vendor.status,
      rejectionReason: needsRemoderation ? null : vendor.rejectionReason,
    },
  });
  
  return {
    ...updated,
    message: needsRemoderation 
      ? 'Профиль обновлен и отправлен на повторную модерацию'
      : 'Профиль успешно обновлен',
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

1. ✅ VENDOR может обновить профиль
2. ✅ CLIENT получает 403
3. ✅ Частичное обновление работает
4. ✅ REJECTED vendor переходит в PENDING
5. ✅ Валидация данных работает
6. ✅ Status нельзя изменить напрямую

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

