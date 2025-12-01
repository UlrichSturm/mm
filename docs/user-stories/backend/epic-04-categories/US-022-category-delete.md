# US-022: Удаление категории

**Epic:** E-004 Categories  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу удалить категорию, чтобы убрать её из списка

---

## Acceptance Criteria

- [ ] Endpoint `DELETE /categories/:id` доступен только ADMIN
- [ ] Нельзя удалить если есть связанные услуги
- [ ] 404 если категория не найдена
- [ ] 400 если есть связанные услуги

---

## API Specification

### Request

```http
DELETE /categories/uuid
Authorization: Bearer <admin-token>
```

### Response (Success - 200)

```json
{
  "message": "Категория успешно удалена",
  "id": "uuid"
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": "Cannot delete category with associated services",
  "error": "Bad Request"
}
```

---

## Implementation

```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async deleteCategory(@Param('id') id: string) {
  const category = await this.prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { services: true } } },
  });
  
  if (!category) {
    throw new NotFoundException('Category not found');
  }
  
  if (category._count.services > 0) {
    throw new BadRequestException('Cannot delete category with associated services');
  }
  
  await this.prisma.category.delete({ where: { id } });
  
  return { message: 'Категория успешно удалена', id };
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-019 (Category model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны
- [ ] API документация обновлена
- [ ] Code review пройден

