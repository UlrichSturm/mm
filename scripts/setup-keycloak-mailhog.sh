#!/bin/bash
# Настройка MailHog для Keycloak
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# MailHog настройки
MAILHOG_HOST="${MAILHOG_HOST:-mailhog}"
MAILHOG_PORT="${MAILHOG_PORT:-1025}"
MAILHOG_FROM="${MAILHOG_FROM:-noreply@mementomori.ru}"
MAILHOG_FROM_DISPLAY="${MAILHOG_FROM_DISPLAY:-Memento Mori}"

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

echo "📧 Настройка MailHog SMTP для Keycloak..."
echo "  Host: ${MAILHOG_HOST}"
echo "  Port: ${MAILHOG_PORT}"
echo "  From: ${MAILHOG_FROM_DISPLAY} <${MAILHOG_FROM}>"
echo ""

# Получаем текущие настройки realm
CURRENT_REALM=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

# Обновляем настройки email и SMTP
REALM_UPDATE=$(echo "$CURRENT_REALM" | python3 -c "
import sys, json
realm = json.load(sys.stdin)

# Настраиваем MailHog SMTP (без аутентификации)
# Удаляем старые настройки auth, если они есть
if 'smtpServer' in realm:
    old_smtp = realm['smtpServer']
    # Удаляем поля, которые не нужны для MailHog
    for key in ['user', 'password', 'auth', 'ssl', 'starttls']:
        old_smtp.pop(key, None)

realm['smtpServer'] = {
    'host': '${MAILHOG_HOST}',
    'port': '${MAILHOG_PORT}',
    'from': '${MAILHOG_FROM}',
    'fromDisplayName': '${MAILHOG_FROM_DISPLAY}',
    'replyTo': '${MAILHOG_FROM}',
    'replyToDisplayName': '${MAILHOG_FROM_DISPLAY}',
    'envelopeFrom': '${MAILHOG_FROM}'
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
  echo "✅ Настройки MailHog успешно применены"
  echo "✅ Verify email включен"
else
  echo "❌ Ошибка при обновлении настроек. HTTP код: $HTTP_CODE"
  echo "$UPDATE_RESPONSE" | head -n -1
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MailHog настроен для Keycloak!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 MailHog Web UI: http://localhost:8025"
echo "   Все письма будут перехвачены и показаны здесь"
echo ""
echo "✅ Преимущества MailHog:"
echo "   - Не требует настройки получателей"
echo "   - Все письма видны в веб-интерфейсе"
echo "   - Идеально для разработки"
echo ""
echo "🧪 Тестирование:"
echo "   1. Зарегистрируйте пользователя: http://localhost:3000/auth/register"
echo "   2. Откройте MailHog UI: http://localhost:8025"
echo "   3. Письмо будет там!"

