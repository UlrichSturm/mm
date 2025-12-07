#!/bin/bash
# Настройка Mailgun через API
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Mailgun API настройки
MAILGUN_API_KEY="${MAILGUN_API_KEY:-}"
MAILGUN_DOMAIN="${MAILGUN_DOMAIN:-}"
MAILGUN_FROM="${MAILGUN_FROM:-noreply@mementomori.ru}"
MAILGUN_FROM_DISPLAY="${MAILGUN_FROM_DISPLAY:-Memento Mori}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Настройка Mailgun через API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$MAILGUN_API_KEY" ]; then
  echo "⚠️  Mailgun API Key не указан"
  echo ""
  echo "Для получения API Key:"
  echo "1. Войдите в Mailgun Dashboard: https://app.mailgun.com"
  echo "2. Перейдите в Settings → API Keys"
  echo "3. Скопируйте Private API key"
  echo ""
  echo "Использование:"
  echo "  export MAILGUN_API_KEY='your-api-key'"
  echo "  export MAILGUN_DOMAIN='sandbox.xxxxx.mailgun.org'"
  echo "  ./scripts/setup-mailgun-via-api.sh"
  echo ""
  exit 1
fi

if [ -z "$MAILGUN_DOMAIN" ]; then
  echo "🔍 Получение списка доменов из Mailgun..."
  DOMAINS=$(curl -s --user "api:${MAILGUN_API_KEY}" \
    "https://api.mailgun.net/v3/domains" | \
    python3 -c "import sys, json; data = json.load(sys.stdin); \
    domains = data.get('items', []); \
    print('\\n'.join([d['name'] for d in domains[:5]]))" 2>/dev/null || echo "")
  
  if [ -z "$DOMAINS" ]; then
    echo "❌ Не удалось получить список доменов"
    echo "Проверьте API ключ и попробуйте указать домен вручную:"
    echo "  export MAILGUN_DOMAIN='sandbox.xxxxx.mailgun.org'"
    exit 1
  fi
  
  echo "Найденные домены:"
  echo "$DOMAINS" | while read domain; do
    echo "  - $domain"
  done
  
  FIRST_DOMAIN=$(echo "$DOMAINS" | head -n1)
  MAILGUN_DOMAIN="$FIRST_DOMAIN"
  echo ""
  echo "Используется домен: $MAILGUN_DOMAIN"
  echo "(Для использования другого домена: export MAILGUN_DOMAIN='your-domain')"
  echo ""
fi

echo "📧 Получение SMTP credentials для домена: $MAILGUN_DOMAIN"
echo ""

# Получаем SMTP credentials через API
SMTP_CREDS=$(curl -s --user "api:${MAILGUN_API_KEY}" \
  "https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}/credentials" | \
  python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    if items:
        cred = items[0]
        print(f\"{cred.get('login', '')}\")
        print(f\"{cred.get('password', '')}\")
    else:
        print('ERROR: No SMTP credentials found')
        print('Create SMTP credentials in Mailgun Dashboard first')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null)

if echo "$SMTP_CREDS" | grep -q "ERROR"; then
  echo "❌ $SMTP_CREDS"
  echo ""
  echo "Создайте SMTP credentials в Mailgun Dashboard:"
  echo "1. Sending → Domain Settings → $MAILGUN_DOMAIN"
  echo "2. SMTP credentials → Create SMTP credentials"
  exit 1
fi

SMTP_USER=$(echo "$SMTP_CREDS" | head -n1)
SMTP_PASSWORD=$(echo "$SMTP_CREDS" | tail -n1)

if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASSWORD" ]; then
  echo "❌ Не удалось получить SMTP credentials"
  exit 1
fi

echo "✅ SMTP credentials получены:"
echo "   User: $SMTP_USER"
echo "   Password: ***"
echo ""

# Теперь настраиваем Keycloak
echo "🔧 Настройка Keycloak..."
export MAILGUN_SMTP_USER="$SMTP_USER"
export MAILGUN_SMTP_PASSWORD="$SMTP_PASSWORD"
export MAILGUN_FROM="$MAILGUN_FROM"
export MAILGUN_FROM_DISPLAY="$MAILGUN_FROM_DISPLAY"

./scripts/fix-keycloak-mailgun.sh

