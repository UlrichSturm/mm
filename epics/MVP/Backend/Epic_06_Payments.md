# Epic 6: Payments (MVP - базовый)

**Phase:** MVP  
**Portal:** Backend  
**Module:** PaymentsModule  
**Epic ID:** E-006

---

## Описание

Базовая система платежей через Stripe. Включает интеграцию со Stripe, обработку платежей и базовую обработку транзакций. Без Escrow логики (это будет в Phase 2).

---

## Функциональность

- Интеграция со Stripe
- Создание Payment Intents
- Обработка платежей
- Подтверждение платежей
- Webhook обработка от Stripe
- История платежей
- Базовые статусы платежей

**Исключено из MVP:**
- Escrow логика (удержание средств)
- Dispute resolution
- Refunds
- Частичные платежи

---

## Зависимости

**Предшествующие эпики:**
- ✅ Epic 1: Authentication & Authorization (MUST)
- ✅ Epic 5: Orders (MUST)

**Требует завершения:**
- Epic 1 должен быть завершен (Auth)
- Epic 5 должен быть завершен (Orders для связи)

**Блокирует:**
- Epic 12: Client App - Payments
- Epic 19: Escrow Payments (Phase 2)

---

## Приоритет (MoSCoW)

**Must Have** - Критичный для MVP

Платежи - это критичная функция для монетизации платформы. Без них клиенты не могут оплатить заказы.

---

## Story Points

**Оценка:** 13 points

**Обоснование:**
- Интеграция со Stripe: 3 points
- Payment Intents: 3 points
- Webhook обработка: 3 points
- История платежей: 2 points
- Валидация и безопасность: 2 points

---

## Последовательность разработки

**Порядок:** 6 (после Epic 5)

**Последовательность:**
1. Настройка Stripe интеграции
2. Создание PaymentsModule
3. Payment Intents
4. Webhook обработка
5. История платежей
6. Интеграция с OrdersModule
7. Тестирование с Stripe test mode

---

## Параллельная разработка

**Возможна параллельная работа:**
- ✅ Frontend команда может начать работу над UI после определения API контракта
- ✅ Можно работать параллельно над webhook обработкой

**Не может быть параллельной:**
- ❌ Нужна интеграция с Epic 5 (Orders)
- ❌ Frontend не может интегрироваться без готового API

---

## Критерии готовности (Definition of Done)

- [ ] Интеграция со Stripe работает
- [ ] Payment Intents создаются
- [ ] Платежи обрабатываются
- [ ] Webhook обработка работает
- [ ] История платежей работает
- [ ] Безопасность платежей обеспечена
- [ ] Тестирование в Stripe test mode пройдено
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена
- [ ] Code review пройден

---

## User Stories (примеры)

1. **Как Client**, я хочу оплатить заказ, чтобы получить услугу
2. **Как система**, я должна обрабатывать платежи через Stripe
3. **Как система**, я должна обрабатывать webhook от Stripe
4. **Как Client**, я хочу видеть историю своих платежей

---

## Технические детали

**Технологии:**
- NestJS
- Stripe SDK
- Prisma ORM
- Webhook обработка

**API Endpoints:**
- `POST /payments/intent` - Создание Payment Intent (Client)
- `POST /payments/confirm` - Подтверждение платежа (Client)
- `GET /payments` - История платежей (Client)
- `GET /payments/:id` - Детали платежа
- `POST /payments/webhook` - Webhook от Stripe

**Database:**
- Payment model (Prisma)
- PaymentStatus enum (PENDING, PROCESSING, SUCCEEDED, FAILED)
- Связь с Order

**Stripe:**
- Payment Intents API
- Webhooks
- Test mode для разработки

---

## Риски и митигация

**Риски:**
- Сложность интеграции со Stripe
- Безопасность платежей
- Webhook обработка

**Митигация:**
- Использование официального Stripe SDK
- Security best practices
- Тщательное тестирование webhooks
- Использование Stripe test mode

---

## Примечания

Критичный эпик для MVP. Без платежей платформа не может монетизироваться. Escrow логика будет добавлена в Phase 2.

