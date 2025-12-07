#!/bin/bash
# Добавление получателя в Mailgun Authorized Recipients
set -e

MAILGUN_API_KEY="${MAILGUN_API_KEY:-7fa63ce06f7128c988766061ead6e0b1-235e4bb2-02f19f14}"
MAILGUN_DOMAIN="${MAILGUN_DOMAIN:-sandboxe001d498458247eb9510fd6af0bdd3d7.mailgun.org}"
RECIPIENT_EMAIL="${1:-}"

if [ -z "$RECIPIENT_EMAIL" ]; then
  echo "Использование: ./scripts/add-mailgun-recipient.sh <email>"
  echo ""
  echo "Пример:"
  echo "  ./scripts/add-mailgun-recipient.sh ulrichsturm@icloud.com"
  exit 1
fi

echo "📧 Добавление получателя в Mailgun Authorized Recipients..."
echo "  Email: $RECIPIENT_EMAIL"
echo "  Domain: $MAILGUN_DOMAIN"
echo ""

RESPONSE=$(curl -s --user "api:${MAILGUN_API_KEY}" \
  -X POST "https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}/authorized_recipients" \
  -F "address=${RECIPIENT_EMAIL}")

echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'message' in data:
        print('✅', data['message'])
        if 'recipient' in data:
            recipient = data['recipient']
            print(f'   Email: {recipient.get(\"address\", \"не указан\")}')
            print(f'   Статус: {recipient.get(\"status\", \"не указан\")}')
    elif 'error' in data:
        print('❌ Ошибка:', data.get('message', data.get('error', 'Unknown error')))
    else:
        print('Response:', data)
except Exception as e:
    print('Ошибка:', e)
    print('Raw response:', sys.stdin.read())
"

