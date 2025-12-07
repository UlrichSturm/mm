#!/bin/bash
# Исправление настроек Mailgun в Keycloak
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Mailgun настройки
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
  echo "  MAILGUN_SMTP_USER=postmaster@sandbox.xxxxx.mailgun.org"
  echo "  MAILGUN_SMTP_PASSWORD=your-smtp-password"
  echo "  MAILGUN_FROM=noreply@mementomori.ru"
  echo ""
  exit 1
fi

echo "📧 Исправление настроек Mailgun для Keycloak..."
echo "  Host: ${MAILGUN_SMTP_HOST}"
echo "  Port: ${MAILGUN_SMTP_PORT}"
echo "  From: ${MAILGUN_FROM_DISPLAY} <${MAILGUN_FROM}>"
echo "  User: ${MAILGUN_SMTP_USER}"
echo ""

# Получаем текущие настройки realm
CURRENT_REALM=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

# Обновляем настройки email и SMTP
REALM_UPDATE=$(echo "$CURRENT_REALM" | python3 -c "
import sys, json
realm = json.load(sys.stdin)

# Исправляем SMTP настройки
realm['smtpServer'] = {
    'host': '${MAILGUN_SMTP_HOST}',
    'port': '${MAILGUN_SMTP_PORT}',
    'from': '${MAILGUN_FROM}',
    'fromDisplayName': '${MAILGUN_FROM_DISPLAY}',
    'replyTo': '${MAILGUN_FROM}',
    'replyToDisplayName': '${MAILGUN_FROM_DISPLAY}',
    'envelopeFrom': '${MAILGUN_FROM}',
    'ssl': 'false',  # Для порта 587 используем StartTLS, не SSL
    'starttls': 'true',
    'auth': 'true',
    'user': '${MAILGUN_SMTP_USER}',
    'password': '${MAILGUN_SMTP_PASSWORD}'
}

# Включаем отправку email подтверждения
realm['verifyEmail'] = True
realm['emailTheme'] = 'keycloak'

print(json.dumps(realm))
")

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$REALM_UPDATE")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 204 ]; then
  echo "✅ Настройки Mailgun успешно исправлены"
  echo "✅ Verify email включен"
else
  echo "❌ Ошибка при обновлении настроек. HTTP код: $HTTP_CODE"
  echo "$UPDATE_RESPONSE" | head -n -1
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Mailgun настройки исправлены!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Исправлено:"
echo "  ✅ Email отправителя: ${MAILGUN_FROM}"
echo "  ✅ SMTP User: ${MAILGUN_SMTP_USER}"
echo "  ✅ SSL отключен, StartTLS включен (для порта 587)"
echo "  ✅ Verify email включен"
echo ""
echo "Теперь Keycloak будет отправлять email подтверждения при регистрации."

