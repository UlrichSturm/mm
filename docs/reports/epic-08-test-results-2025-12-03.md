# Epic 8: Email Notifications - Результаты тестирования

**Дата:** 2025-12-03
**SMTP:** MailHog (localhost:1025)
**MailHog UI:** http://localhost:8025

---

## 🧪 Тестовые сценарии

### Тест 1: Welcome Email (Регистрация пользователя) ✅

**Endpoint:** `POST /api/auth/register`

**Шаги:**
1. ✅ Swagger UI открыт: http://localhost:3001/api/docs
2. ✅ Выполнен `POST /api/auth/register`:
   ```json
   {
     "email": "test-email@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```
3. ⏳ Проверка логов сервера
4. ⏳ Проверка MailHog UI

**Ожидаемый результат:**
- ✅ Email отправлен успешно
- ✅ Лог: "Email sent to test-email@example.com: Welcome to Memento Mori"
- ✅ Письмо видно в MailHog UI

---

### Тест 2: Order Confirmation (Создание заказа) ⏳

**Endpoint:** `POST /api/orders`

**Статус:** Ожидает выполнения

---

### Тест 3: Order Status Update (Изменение статуса заказа) ⏳

**Endpoint:** `PATCH /api/orders/:id/status`

**Статус:** Ожидает выполнения

---

### Тест 4: Payment Confirmation (Успешная оплата) ⏳

**Endpoint:** `POST /payments/confirm`

**Статус:** Ожидает выполнения

---

### Тест 5: Payment Failed (Неудачная оплата) ⏳

**Статус:** Ожидает выполнения

---

### Тест 6: Vendor Approval (Одобрение поставщика) ⏳

**Endpoint:** `PATCH /api/vendors/:id/status`

**Статус:** Ожидает выполнения

---

### Тест 7: Vendor Rejection (Отклонение поставщика) ⏳

**Статус:** Ожидает выполнения

---

### Тест 8: Service Status Update (Модерация услуги) ⏳

**Endpoint:** `PATCH /services/:id/status`

**Статус:** Ожидает выполнения

---

## 📊 Чек-лист тестирования

- [x] Тест 1: Welcome Email - В процессе
- [ ] Тест 2: Order Confirmation
- [ ] Тест 3: Order Status Update
- [ ] Тест 4: Payment Confirmation
- [ ] Тест 5: Payment Failed
- [ ] Тест 6: Vendor Approval
- [ ] Тест 7: Vendor Rejection
- [ ] Тест 8: Service Status Update

---

## 🔍 Логи сервера

```bash
# Просмотр всех логов email
docker-compose logs -f server | grep -i email

# Просмотр логов отправки
docker-compose logs -f server | grep -i "Email sent"

# Просмотр ошибок
docker-compose logs -f server | grep -i "Failed to send email"
```

---

## 📧 MailHog UI

**URL:** http://localhost:8025

**Статус:** ✅ Доступен

---

**Последнее обновление:** 2025-12-03

