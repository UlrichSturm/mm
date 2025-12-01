# US-017: Редактирование услуги

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу редактировать услугу, чтобы обновить информацию

---

## Acceptance Criteria

- [ ] Endpoint `PATCH /services/:id` доступен только VENDOR
- [ ] Только владелец может редактировать услугу
- [ ] Можно обновить: name, description, price, categoryId, images, status
- [ ] Валидация данных
- [ ] 404 если услуга не найдена
- [ ] 403 если не владелец

---

## API Specification

### Request

```http
PATCH /services/uuid
Authorization: Bearer <vendor-token>
Content-Type: application/json

{
  "name": "Обновленное название услуги",
  "price": 50000,
  "status": "INACTIVE"
}
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "name": "Обновленное название услуги",
  "description": "Полный комплекс ритуальных услуг...",
  "price": 50000,
  "status": "INACTIVE",
  "updatedAt": "2025-12-01T14:00:00Z",
  "message": "Услуга успешно обновлена"
}
```

### Response (Error - 403)

```json
{
  "statusCode": 403,
  "message": "You can only edit your own services",
  "error": "Forbidden"
}
```

### Response (Error - 404)

```json
{
  "statusCode": 404,
  "message": "Service not found",
  "error": "Not Found"
}
```

---

## Update DTO

```typescript
export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
```

---

## Technical Notes

- Получить vendorId из JWT и проверить владение
- Partial update (только переданные поля)
- Валидировать categoryId если указан
- Логировать изменения

---

## Implementation

```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async updateService(
  @Param('id') id: string,
  @CurrentUser() user: User,
  @Body() dto: UpdateServiceDto,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor profile not found');
  }
  
  const service = await this.prisma.service.findUnique({
    where: { id },
  });
  
  if (!service) {
    throw new NotFoundException('Service not found');
  }
  
  if (service.vendorId !== vendor.id) {
    throw new ForbiddenException('You can only edit your own services');
  }
  
  // Validate category if provided
  if (dto.categoryId) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }
  
  const updated = await this.prisma.service.update({
    where: { id },
    data: dto,
  });
  
  return { ...updated, message: 'Услуга успешно обновлена' };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-012 (Service model)

---

## Test Cases

1. ✅ Владелец может редактировать услугу
2. ✅ Не-владелец получает 403
3. ✅ CLIENT получает 403
4. ✅ Несуществующая услуга - 404
5. ✅ Partial update работает
6. ✅ Валидация данных работает

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

