#!/bin/bash
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"
CLIENT_ID="${CLIENT_ID:-memento-mori-backend}"

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

# Проверяем существование клиента
echo "🔍 Проверка существования клиента '${CLIENT_ID}'..."
CLIENT_DATA=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

CLIENT_EXISTS=$(echo "$CLIENT_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); print('true' if data and len(data) > 0 else 'false')")

if [ "$CLIENT_EXISTS" = "true" ]; then
  echo "✅ Клиент '${CLIENT_ID}' уже существует"
  CLIENT_UUID=$(echo "$CLIENT_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')")
  
  # Проверяем настройки клиента
  echo "🔧 Проверка настроек клиента..."
  CLIENT_AUTH=$(echo "$CLIENT_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0].get('clientAuthenticatorType', '') if data else '')")
  
  if [ "$CLIENT_AUTH" != "client-secret" ]; then
    echo "⚠️  Client authentication не включен. Обновляем..."
    curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$(echo "$CLIENT_DATA" | python3 -c "
import sys, json
data = json.load(sys.stdin)[0]
data['clientAuthenticatorType'] = 'client-secret'
data['publicClient'] = False
data['serviceAccountsEnabled'] = True
print(json.dumps(data))
")" > /dev/null
    echo "✅ Client authentication включен"
  else
    echo "✅ Client authentication уже включен"
  fi
else
  echo "📦 Создание клиента '${CLIENT_ID}'..."
  CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"clientId\": \"${CLIENT_ID}\",
      \"enabled\": true,
      \"clientAuthenticatorType\": \"client-secret\",
      \"redirectUris\": [\"http://localhost:3001/*\"],
      \"webOrigins\": [\"http://localhost:3000\", \"http://localhost:3002\", \"http://localhost:3003\"],
      \"standardFlowEnabled\": true,
      \"directAccessGrantsEnabled\": true,
      \"serviceAccountsEnabled\": true,
      \"publicClient\": false,
      \"protocol\": \"openid-connect\"
    }")
  
  HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
  if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Клиент создан"
    CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID}" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')")
  else
    echo "❌ Ошибка при создании клиента. HTTP код: $HTTP_CODE"
    exit 1
  fi
fi

echo ""
echo "🔐 Получение Client Secret..."
SECRET_RESPONSE=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/client-secret" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

CLIENT_SECRET=$(echo "$SECRET_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('value', ''))")

if [ -z "$CLIENT_SECRET" ]; then
  echo "⚠️  Client Secret не найден. Генерируем новый..."
  SECRET_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/client-secret" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json")
  CLIENT_SECRET=$(echo "$SECRET_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('value', ''))")
fi

if [ -z "$CLIENT_SECRET" ]; then
  echo "❌ Не удалось получить Client Secret"
  exit 1
fi

echo "✅ Client Secret получен: ${CLIENT_SECRET:0:20}..."
echo ""

# Обновляем docker-compose.dev.yml
echo "📝 Обновление docker-compose.dev.yml..."
DOCKER_COMPOSE_FILE="docker-compose.dev.yml"

if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "❌ Файл $DOCKER_COMPOSE_FILE не найден"
  exit 1
fi

# Обновляем KEYCLOAK_CLIENT_SECRET
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|KEYCLOAK_CLIENT_SECRET=.*|KEYCLOAK_CLIENT_SECRET=${CLIENT_SECRET}|g" "$DOCKER_COMPOSE_FILE"
else
  # Linux
  sed -i "s|KEYCLOAK_CLIENT_SECRET=.*|KEYCLOAK_CLIENT_SECRET=${CLIENT_SECRET}|g" "$DOCKER_COMPOSE_FILE"
fi

echo "✅ docker-compose.dev.yml обновлен"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Настройка завершена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Client Secret: ${CLIENT_SECRET}"
echo ""
echo "🔄 Перезапустите контейнер server для применения изменений:"
echo "   docker-compose -f docker-compose.dev.yml restart server"
echo ""

