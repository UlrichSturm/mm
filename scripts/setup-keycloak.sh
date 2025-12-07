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
  -d "client_id=admin-cli" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Не удалось получить токен администратора"
  exit 1
fi

echo "✅ Токен получен"

echo ""
echo "🔍 Проверка существования realm '${REALM_NAME}'..."
EXISTING_REALM=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" | grep -o '"realm":"[^"]*"' | head -1)

if [ ! -z "$EXISTING_REALM" ]; then
  echo "⚠️  Realm '${REALM_NAME}' уже существует"
  read -p "Удалить и пересоздать? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Удаление существующего realm..."
    curl -s -X DELETE "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json"
    echo "✅ Realm удален"
  else
    echo "ℹ️  Используем существующий realm"
    exit 0
  fi
fi

echo ""
echo "📦 Создание realm '${REALM_NAME}'..."
REALM_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"realm\": \"${REALM_NAME}\",
    \"enabled\": true,
    \"displayName\": \"Memento Mori\",
    \"loginTheme\": \"keycloak\",
    \"accountTheme\": \"keycloak\",
    \"adminTheme\": \"keycloak\",
    \"emailTheme\": \"keycloak\"
  }")

HTTP_CODE=$(echo "$REALM_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
  echo "✅ Realm '${REALM_NAME}' создан"
else
  echo "❌ Ошибка при создании realm. HTTP код: $HTTP_CODE"
  echo "$REALM_RESPONSE" | head -n -1
  exit 1
fi

echo ""
echo "🔑 Создание ролей..."
ROLES=("client" "vendor" "lawyer-notary" "admin")
for ROLE in "${ROLES[@]}"; do
  echo "  Создание роли: $ROLE"
  ROLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${ROLE}\"}")
  
  HTTP_CODE=$(echo "$ROLE_RESPONSE" | tail -n1)
  if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
    echo "    ✅ Роль '$ROLE' создана"
  else
    echo "    ⚠️  Роль '$ROLE' уже существует или ошибка (HTTP: $HTTP_CODE)"
  fi
done

echo ""
echo "🔧 Создание клиента '${CLIENT_ID}'..."
CLIENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"${CLIENT_ID}\",
    \"enabled\": true,
    \"clientAuthenticatorType\": \"client-secret\",
    \"secret\": \"\",
    \"redirectUris\": [\"http://localhost:3001/*\"],
    \"webOrigins\": [\"http://localhost:3000\", \"http://localhost:3002\", \"http://localhost:3003\"],
    \"standardFlowEnabled\": true,
    \"directAccessGrantsEnabled\": true,
    \"serviceAccountsEnabled\": true,
    \"publicClient\": false,
    \"protocol\": \"openid-connect\"
  }")

HTTP_CODE=$(echo "$CLIENT_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 409 ]; then
  echo "✅ Клиент '${CLIENT_ID}' создан"
  
  # Получаем ID клиента
  CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ ! -z "$CLIENT_UUID" ]; then
    echo ""
    echo "🔐 Получение Client Secret..."
    CLIENT_SECRET=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/client-secret" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" | grep -o '"value":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$CLIENT_SECRET" ]; then
      echo "✅ Client Secret получен:"
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📋 Добавьте в docker-compose.dev.yml:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  KEYCLOAK_CLIENT_SECRET=${CLIENT_SECRET}"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
    fi
  fi
else
  echo "⚠️  Клиент уже существует или ошибка (HTTP: $HTTP_CODE)"
  # Попробуем получить secret существующего клиента
  CLIENT_UUID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients?clientId=${CLIENT_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ ! -z "$CLIENT_UUID" ]; then
    CLIENT_SECRET=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/clients/${CLIENT_UUID}/client-secret" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" | grep -o '"value":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$CLIENT_SECRET" ]; then
      echo "✅ Client Secret получен:"
      echo "  KEYCLOAK_CLIENT_SECRET=${CLIENT_SECRET}"
    fi
  fi
fi

echo ""
echo "✅ Настройка Keycloak завершена!"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Обновите KEYCLOAK_CLIENT_SECRET в docker-compose.dev.yml"
echo "  2. Перезапустите контейнер server: docker-compose -f docker-compose.dev.yml restart server"
echo "  3. Создайте тестовых пользователей через Keycloak Admin Console"

