# US-007: Создание профиля поставщика

**Epic:** E-002 Vendors Management  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 2  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу создать свой профиль, чтобы размещать услуги

---

## Acceptance Criteria

- [ ] VendorProfile модель в Prisma создана
- [ ] Связь с User (1:1) через userId
- [ ] Поля: businessName, contactEmail, contactPhone, address, postalCode, description
- [ ] Профиль создается автоматически при регистрации Vendor
- [ ] Статус по умолчанию: PENDING
- [ ] Только VENDOR может иметь VendorProfile

---

## Database Schema

```prisma
model VendorProfile {
  id            String       @id @default(uuid())
  userId        String       @unique
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  businessName  String
  description   String?
  contactEmail  String?
  contactPhone  String
  address       String
  postalCode    String
  
  status        VendorStatus @default(PENDING)
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  services      Service[]
}

enum VendorStatus {
  PENDING     // Ожидает модерации
  APPROVED    // Одобрен
  REJECTED    // Отклонен
  SUSPENDED   // Приостановлен
}
```

---

## Technical Notes

- VendorProfile создается в транзакции вместе с User (US-002)
- Один User может иметь только один VendorProfile
- При удалении User удаляется и VendorProfile (CASCADE)
- Статус PENDING блокирует создание услуг

---

## Dependencies

- US-002 (Vendor registration создает профиль)

---

## Test Cases

1. ✅ VendorProfile создается при регистрации Vendor
2. ✅ Статус по умолчанию PENDING
3. ✅ Связь с User работает
4. ✅ Один User - один VendorProfile

---

## Definition of Done

- [ ] Database schema создана
- [ ] Migration применена
- [ ] Unit тесты написаны
- [ ] Code review пройден

