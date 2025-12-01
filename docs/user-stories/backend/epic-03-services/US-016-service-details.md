# US-016: Детали услуги

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу видеть детали услуги, чтобы принять решение о заказе

---

## Acceptance Criteria

- [ ] Endpoint `GET /services/:id` публичный
- [ ] Возвращает полную информацию об услуге
- [ ] Включает данные поставщика (businessName, contactPhone, address)
- [ ] Включает категорию
- [ ] 404 если услуга не найдена
- [ ] 404 если услуга INACTIVE или vendor не APPROVED

---

## API Specification

### Request

```http
GET /services/uuid
```

### Response (Success - 200)

```json
{
  "id": "uuid",
  "name": "Организация похорон под ключ",
  "description": "Полный комплекс ритуальных услуг включая транспорт, оформление документов и поминальный обед. В стоимость входит: гроб стандарт, венок, транспорт до 30 км, оформление документов в ЗАГСе.",
  "price": 45000,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-01T10:00:00Z",
  "vendor": {
    "id": "uuid",
    "businessName": "Ритуальные услуги АИ",
    "contactPhone": "+7 999 123-45-67",
    "address": "г. Москва, ул. Примерная, д. 1",
    "description": "Работаем с 2010 года"
  },
  "category": {
    "id": "uuid",
    "name": "Ритуальные услуги",
    "description": "Услуги по организации похорон"
  }
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

## Technical Notes

- Проверять status услуги = ACTIVE
- Проверять vendor.status = APPROVED
- Если любое условие не выполнено - 404 (не раскрывать причину)
- Include vendor с нужными полями (без sensitive data)

---

## Implementation

```typescript
@Get(':id')
async getService(@Param('id') id: string) {
  const service = await this.prisma.service.findFirst({
    where: {
      id,
      status: 'ACTIVE',
      vendor: { status: 'APPROVED' },
    },
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          contactPhone: true,
          address: true,
          description: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });
  
  if (!service) {
    throw new NotFoundException('Service not found');
  }
  
  return service;
}
```

---

## Dependencies

- US-012 (Service model)
- US-007 (VendorProfile)

---

## Test Cases

1. ✅ Существующая ACTIVE услуга возвращается
2. ✅ INACTIVE услуга - 404
3. ✅ Услуга не-APPROVED vendor - 404
4. ✅ Несуществующий ID - 404
5. ✅ Vendor data включена
6. ✅ Category data включена

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

