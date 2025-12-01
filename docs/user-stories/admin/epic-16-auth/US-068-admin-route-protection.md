# US-068: Защита Admin роутов

**Epic:** E-016 Admin Authentication  
**Portal:** Admin Portal  
**Приоритет:** 🟡 Should Have  
**Story Points:** 1  
**Статус:** ⬜ Не начато

---

## User Story

**Как система**, я должна защищать Admin портал

---

## Acceptance Criteria

- [ ] Middleware для проверки ADMIN роли
- [ ] 403 для не-админов
- [ ] Redirect на login без токена

---

## Dependencies

- US-005 (RBAC)

---

## Definition of Done

- [ ] Защита работает
- [ ] Только ADMIN имеет доступ
- [ ] Code review пройден

