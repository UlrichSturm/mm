# US-033: Статистика платформы

**Epic:** E-007 Admin Panel  
**Portal:** Backend  
**Приоритет:** 🟡 Should Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Admin**, я хочу видеть базовую статистику, чтобы понимать состояние платформы

---

## Acceptance Criteria

- [ ] Endpoint `GET /admin/stats` доступен только ADMIN
- [ ] Количество: users, vendors, services, orders
- [ ] Разбивка по статусам
- [ ] Сумма платежей

---

## API Specification

### Request

```http
GET /admin/stats
Authorization: Bearer <admin-token>
```

### Response (Success - 200)

```json
{
  "users": {
    "total": 1500,
    "clients": 1400,
    "vendors": 95,
    "admins": 5
  },
  "vendors": {
    "total": 95,
    "pending": 10,
    "approved": 80,
    "rejected": 5
  },
  "services": {
    "total": 250,
    "active": 230,
    "inactive": 20
  },
  "orders": {
    "total": 500,
    "pending": 20,
    "confirmed": 30,
    "inProgress": 15,
    "completed": 420,
    "cancelled": 15
  },
  "payments": {
    "totalAmount": 15000000,
    "completedCount": 420
  }
}
```

---

## Implementation

```typescript
@Get('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getStats() {
  const [users, vendors, services, orders, payments] = await Promise.all([
    this.prisma.user.groupBy({ by: ['role'], _count: true }),
    this.prisma.vendorProfile.groupBy({ by: ['status'], _count: true }),
    this.prisma.service.groupBy({ by: ['status'], _count: true }),
    this.prisma.order.groupBy({ by: ['status'], _count: true }),
    this.prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    }),
  ]);
  
  return {
    users: this.formatUserStats(users),
    vendors: this.formatVendorStats(vendors),
    services: this.formatServiceStats(services),
    orders: this.formatOrderStats(orders),
    payments: {
      totalAmount: payments._sum.amount?.toNumber() || 0,
      completedCount: payments._count,
    },
  };
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

