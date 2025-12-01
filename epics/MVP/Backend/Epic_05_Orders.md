# Epic 5: Orders (MVP)

**Phase:** MVP  
**Portal:** Backend  
**Module:** OrdersModule  
**Epic ID:** E-005

---

## Описание

Система обработки заказов на платформе. Включает создание заказов, базовые статусы заказов и историю заказов.

---

## Функциональность

- Создание заказов (Client)
- Базовые статусы заказов (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
- История заказов
- Просмотр заказов (Client, Vendor, Admin)
- Обновление статусов заказов (Vendor)
- Email уведомления о статусах

**Исключено из MVP:**
- Сложные workflow
- Частичные заказы
- Возвраты и refunds
- Dispute resolution

---

## Зависимости

**Предшествующие эпики:**
- ✅ Epic 1: Authentication & Authorization (MUST)
- ✅ Epic 2: Vendors Management (MUST)
- ✅ Epic 3: Services Catalog (MUST)

**Требует завершения:**
- Epic 1 должен быть завершен (Auth)
- Epic 2 должен быть завершен (Vendors)
- Epic 3 должен быть завершен (Services)

**Блокирует:**
- Epic 6: Payments (платежи связаны с заказами)
- Epic 11: Client App - Orders
- Epic 15: Vendor Portal - Orders
- Epic 23: Reviews & Ratings (отзывы после заказов)

---

## Приоритет (MoSCoW)

**Must Have** - Критичный для MVP

Заказы - это основной бизнес-процесс платформы. Без них платформа не работает.

---

## Story Points

**Оценка:** 13 points

**Обоснование:**
- Создание заказов: 3 points
- Статусы и workflow: 3 points
- История заказов: 2 points
- Email уведомления: 2 points
- Валидация: 2 points
- Интеграция с Services и Vendors: 1 point

---

## Последовательность разработки

**Порядок:** 5 (после Epic 1, 2, 3)

**Последовательность:**
1. Создание OrdersModule
2. Модель Order (Prisma)
3. Создание заказов
4. Статусы и workflow
5. История заказов
6. Email уведомления
7. Интеграция с ServicesModule и VendorsModule

---

## Параллельная разработка

**Возможна параллельная работа:**
- ✅ Frontend команда может начать работу над UI после определения API контракта
- ✅ Email уведомления могут разрабатываться параллельно

**Не может быть параллельной:**
- ❌ Epic 6 (Payments) не может начаться без этого эпика
- ❌ Frontend не может интегрироваться без готового API

---

## Критерии готовности (Definition of Done)

- [ ] Создание заказов работает
- [ ] Статусы заказов работают
- [ ] История заказов работает
- [ ] Email уведомления отправляются
- [ ] Валидация данных работает
- [ ] Интеграция с Services и Vendors работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена
- [ ] Code review пройден

---

## User Stories (примеры)

1. **Как Client**, я хочу создать заказ, чтобы получить услугу
2. **Как Vendor**, я хочу видеть свои заказы, чтобы их обработать
3. **Как Vendor**, я хочу обновить статус заказа, чтобы информировать клиента
4. **Как система**, я должна отправлять email уведомления при изменении статуса

---

## Технические детали

**Технологии:**
- NestJS
- Prisma ORM
- EmailModule

**API Endpoints:**
- `POST /orders` - Создание заказа (Client)
- `GET /orders` - Список заказов (Client/Vendor/Admin)
- `GET /orders/:id` - Детали заказа
- `PATCH /orders/:id/status` - Обновление статуса (Vendor)
- `GET /orders/my` - Мои заказы (Client/Vendor)

**Database:**
- Order model (Prisma)
- OrderStatus enum (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
- OrderItem model (связь с Service)

---

## Риски и митигация

**Риски:**
- Сложность workflow
- Интеграция с EmailModule

**Митигация:**
- Простой workflow на старте
- Использование готового EmailModule

---

## Примечания

Критичный эпик для MVP. Это основа для платежей и основной бизнес-процесс.

