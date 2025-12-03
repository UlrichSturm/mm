# Epic 1: Authentication & Authorization (MVP)

**Phase:** MVP
**Portal:** Backend
**Module:** AuthModule
**Epic ID:** E-001

---

## Описание

Реализация базовой системы аутентификации и авторизации для платформы с использованием **Keycloak** как Identity Provider (IdP). Включает регистрацию пользователей (Client, Vendor), логин/логаут через Keycloak, и базовую RBAC систему.

---

## Функциональность

- Регистрация Client пользователей (через Keycloak Admin API)
- Регистрация Vendor пользователей (через Keycloak Admin API)
- Логин/Logout через Keycloak Direct Access Grants
- Keycloak токены (access tokens, refresh tokens)
- RBAC (Role-Based Access Control) через Keycloak роли
- Защита endpoints через Keycloak Guards

**Исключено из MVP:**

- Password reset (управляется Keycloak)
- Email verification (управляется Keycloak)
- OAuth интеграции (кроме базовой Keycloak)

---

## Зависимости

**Предшествующие эпики:** Нет (стартовый эпик)

**Требует завершения:**

- Нет

**Блокирует:**

- Epic 2: Vendors Management
- Epic 9: Client App - Authentication
- Epic 13: Vendor Portal - Authentication
- Epic 16: Admin Portal - Authentication

---

## Приоритет (MoSCoW)

**Must Have** - Критичный для MVP

Без аутентификации невозможно работать с платформой. Это основа для всех остальных модулей.

---

## Story Points

**Оценка:** 13 points

**Обоснование:**

- Регистрация (Client + Vendor): 3 points
- Логин/Logout: 2 points
- Keycloak интеграция: 3 points
- RBAC система через Keycloak: 3 points
- Guards и декораторы: 2 points

---

## Последовательность разработки

**Порядок:** 1 (первый эпик)

**Последовательность:**

1. Настройка Keycloak сервера и realm
2. Настройка AuthModule с Keycloak интеграцией
3. Регистрация Client пользователей (через Keycloak Admin API)
4. Регистрация Vendor пользователей (через Keycloak Admin API)
5. Логин/Logout через Keycloak Direct Access Grants
6. RBAC система через Keycloak роли
7. Guards и декораторы (nest-keycloak-connect)

---

## Параллельная разработка

**Возможна параллельная работа:**

- ✅ Frontend команда может начать работу над UI после определения API контракта
- ✅ Можно работать параллельно над Client и Vendor регистрацией

**Не может быть параллельной:**

- ❌ Другие backend модули не могут начаться без Auth
- ❌ Frontend не может интегрироваться без готового API

---

## Критерии готовности (Definition of Done)

- [ ] Keycloak сервер настроен и работает
- [ ] Keycloak realm и clients созданы
- [ ] Регистрация Client пользователей работает (через Keycloak Admin API)
- [ ] Регистрация Vendor пользователей работает (через Keycloak Admin API)
- [ ] Логин/Logout работает через Keycloak Direct Access Grants
- [ ] Keycloak токены валидируются на backend
- [ ] RBAC система работает через Keycloak роли (client, vendor, admin)
- [ ] Guards защищают endpoints (nest-keycloak-connect)
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена
- [ ] Code review пройден

---

## User Stories (примеры)

1. **Как Client**, я хочу зарегистрироваться на платформе, чтобы получить доступ к услугам
2. **Как Vendor**, я хочу зарегистрироваться на платформе, чтобы размещать свои услуги
3. **Как пользователь**, я хочу войти в систему, чтобы получить доступ к моему профилю
4. **Как система**, я должна защищать endpoints от неавторизованного доступа

---

## Технические детали

**Технологии:**

- NestJS
- nest-keycloak-connect
- keycloak-connect
- Keycloak (Identity Provider)
- axios (для Keycloak Admin API)

**API Endpoints:**

- `POST /auth/register` - Регистрация Client (создает в Keycloak)
- `POST /auth/login` - Логин через Keycloak Direct Access Grants
- `GET /auth/profile` - Получить профиль текущего пользователя
- `PATCH /auth/profile` - Обновить профиль

**Keycloak:**

- Realm: `memento-mori`
- Clients: `memento-mori-api` (confidential), `memento-mori-client`, `memento-mori-vendor`, `memento-mori-admin`
- Roles: `client`, `vendor`, `admin`

**Database:**

- User model (Prisma) - синхронизируется с Keycloak
- Пароли НЕ хранятся в базе (управляются Keycloak)

---

## Риски и митигация

**Риски:**

- Сложность настройки Keycloak
- Зависимость от внешнего сервиса (Keycloak)
- Синхронизация данных между Keycloak и локальной БД

**Митигация:**

- Использование Docker для локальной разработки
- Автоматизированный скрипт настройки Keycloak
- Синхронизация пользователей при логине
- Раннее определение API контракта
- Security review

---

## Примечания

Это критичный эпик, который блокирует все остальные. Рекомендуется начать с него и завершить как можно раньше.
