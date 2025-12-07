#!/bin/bash
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Mailgun настройки (можно передать через переменные окружения)
MAILGUN_SMTP_HOST="${MAILGUN_SMTP_HOST:-smtp.mailgun.org}"
MAILGUN_SMTP_PORT="${MAILGUN_SMTP_PORT:-587}"
MAILGUN_SMTP_USER="${MAILGUN_SMTP_USER:-}"
MAILGUN_SMTP_PASSWORD="${MAILGUN_SMTP_PASSWORD:-}"
MAILGUN_FROM="${MAILGUN_FROM:-noreply@mementomori.ru}"
MAILGUN_FROM_DISPLAY="${MAILGUN_FROM_DISPLAY:-Memento Mori}"

echo "🔐 Получение токена администратора..."
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Не удалось получить токен администратора"
  exit 1
fi

echo "✅ Токен получен"
echo ""

if [ -z "$MAILGUN_SMTP_USER" ] || [ -z "$MAILGUN_SMTP_PASSWORD" ]; then
  echo "⚠️  Mailgun настройки не указаны"
  echo ""
  echo "Используйте переменные окружения:"
  echo "  MAILGUN_SMTP_USER=your-mailgun-username"
  echo "  MAILGUN_SMTP_PASSWORD=your-mailgun-password"
  echo "  MAILGUN_FROM=noreply@yourdomain.com"
  echo ""
  echo "Или укажите их в скрипте напрямую"
  exit 1
fi

echo "📧 Настройка Mailgun SMTP для Keycloak..."
echo "  Host: ${MAILGUN_SMTP_HOST}"
echo "  Port: ${MAILGUN_SMTP_PORT}"
echo "  From: ${MAILGUN_FROM_DISPLAY} <${MAILGUN_FROM}>"
echo ""

# Получаем текущие настройки realm
CURRENT_REALM=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

# Обновляем настройки email
REALM_UPDATE=$(echo "$CURRENT_REALM" | python3 -c "
import sys, json
realm = json.load(sys.stdin)
realm['smtpServer'] = {
    'host': '${MAILGUN_SMTP_HOST}',
    'port': '${MAILGUN_SMTP_PORT}',
    'from': '${MAILGUN_FROM}',
    'fromDisplayName': '${MAILGUN_FROM_DISPLAY}',
    'replyTo': '${MAILGUN_FROM}',
    'replyToDisplayName': '${MAILGUN_FROM_DISPLAY}',
    'envelopeFrom': '${MAILGUN_FROM}',
    'ssl': 'false',
    'starttls': 'true',
    'auth': 'true',
    'user': '${MAILGUN_SMTP_USER}',
    'password': '${MAILGUN_SMTP_PASSWORD}'
}
realm['emailTheme'] = 'keycloak'
# Включаем отправку email подтверждения
realm['verifyEmail'] = True
print(json.dumps(realm))
")

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$REALM_UPDATE")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 204 ]; then
  echo "✅ Настройки Mailgun успешно применены"
else
  echo "❌ Ошибка при обновлении настроек. HTTP код: $HTTP_CODE"
  echo "$UPDATE_RESPONSE" | head -n -1
  exit 1
fi

echo "✅ Настройки SMTP применены"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Mailgun настроен для Keycloak!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Теперь Keycloak будет отправлять:"
echo "  ✅ Email подтверждения регистрации"
echo "  ✅ Уведомления о сбросе пароля"
echo "  ✅ Другие системные уведомления"
echo ""
echo "Для тестирования создайте пользователя в Keycloak и включите"
echo "опцию 'Email verified' или отправьте email подтверждения."

