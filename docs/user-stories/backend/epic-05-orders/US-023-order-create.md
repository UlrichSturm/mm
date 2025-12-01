# US-023: Создание заказа

**Epic:** E-005 Orders  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Client**, я хочу создать заказ, чтобы получить услугу

---

## Acceptance Criteria

- [ ] Endpoint `POST /orders` доступен только CLIENT
- [ ] Поля: serviceId, quantity, notes (опционально)
- [ ] Статус по умолчанию: PENDING
- [ ] Расчет totalPrice = service.price * quantity
- [ ] Проверка что услуга ACTIVE и vendor APPROVED
- [ ] Связь с Client и Service

---

## API Specification

### Request

```http
POST /orders
Authorization: Bearer <client-token>
Content-Type: application/json

{
  "serviceId": "uuid",
  "quantity": 1,
  "notes": "Нужна доставка до 12:00"
}
```

### Response (Success - 201)

```json
{
  "id": "uuid",
  "clientId": "uuid",
  "serviceId": "uuid",
  "quantity": 1,
  "totalPrice": 45000,
  "notes": "Нужна доставка до 12:00",
  "status": "PENDING",
  "createdAt": "2025-12-01T10:00:00Z",
  "service": {
    "id": "uuid",
    "name": "Организация похорон под ключ",
    "price": 45000
  }
}
```

---

## Database Schema

```prisma
model Order {
  id         String      @id @default(uuid())
  clientId   String
  client     User        @relation("ClientOrders", fields: [clientId], references: [id])
  serviceId  String
  service    Service     @relation(fields: [serviceId], references: [id])
  
  quantity   Int         @default(1)
  totalPrice Decimal     @db.Decimal(10, 2)
  notes      String?
  
  status     OrderStatus @default(PENDING)
  
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  payment    Payment?
}

enum OrderStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## Implementation

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
async createOrder(
  @CurrentUser() user: User,
  @Body() dto: CreateOrderDto,
) {
  const service = await this.prisma.service.findFirst({
    where: {
      id: dto.serviceId,
      status: 'ACTIVE',
      vendor: { status: 'APPROVED' },
    },
  });
  
  if (!service) {
    throw new NotFoundException('Service not found or not available');
  }
  
  const totalPrice = service.price.toNumber() * dto.quantity;
  
  return this.prisma.order.create({
    data: {
      clientId: user.id,
      serviceId: dto.serviceId,
      quantity: dto.quantity,
      totalPrice,
      notes: dto.notes,
    },
    include: {
      service: { select: { id: true, name: true, price: true } },
    },
  });
}
```

---

## Dependencies

- US-005 (RBAC)
- US-012 (Service model)

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена
- [ ] Code review пройден

