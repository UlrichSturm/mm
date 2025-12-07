#!/bin/bash
# Создание тестового пользователя vendor в Keycloak
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Данные vendor пользователя
VENDOR_EMAIL="${VENDOR_EMAIL:-vendor@mementomori.com}"
VENDOR_PASSWORD="${VENDOR_PASSWORD:-vendor123456}"
VENDOR_FIRST_NAME="${VENDOR_FIRST_NAME:-Vendor}"
VENDOR_LAST_NAME="${VENDOR_LAST_NAME:-Test}"
VENDOR_ROLE="${VENDOR_ROLE:-vendor}"

echo "🔐 Получение токена администратора Keycloak..."
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASSWORD}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Не удалось получить токен администратора Keycloak"
  exit 1
fi

echo "✅ Токен получен"
echo ""

# Проверяем, существует ли пользователь
echo "🔍 Проверка существования пользователя..."
EXISTING_USER=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?email=${VENDOR_EMAIL}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

USER_COUNT=$(echo "$EXISTING_USER" | python3 -c "import sys, json; users = json.load(sys.stdin); print(len(users))")

if [ "$USER_COUNT" -gt 0 ]; then
  echo "⚠️  Пользователь ${VENDOR_EMAIL} уже существует"
  USER_ID=$(echo "$EXISTING_USER" | python3 -c "import sys, json; users = json.load(sys.stdin); print(users[0]['id'] if users else '')")
  echo "🔄 Обновляю пароль..."

  # Обновляем пароль
  UPDATE_PASSWORD=$(curl -s -w "\n%{http_code}" -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/${USER_ID}/reset-password" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"password\",\"value\":\"${VENDOR_PASSWORD}\",\"temporary\":false}")

  HTTP_CODE=$(echo "$UPDATE_PASSWORD" | tail -1)
  if [ "$HTTP_CODE" -eq 204 ]; then
    echo "✅ Пароль обновлен"
  else
    echo "❌ Ошибка при обновлении пароля. HTTP код: $HTTP_CODE"
  fi
else
  echo "📝 Создание vendor пользователя..."

  # Создаем пользователя
  CREATE_USER=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${VENDOR_EMAIL}\",
      \"emailVerified\": true,
      \"enabled\": true,
      \"username\": \"${VENDOR_EMAIL}\",
      \"firstName\": \"${VENDOR_FIRST_NAME}\",
      \"lastName\": \"${VENDOR_LAST_NAME}\",
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"${VENDOR_PASSWORD}\",
        \"temporary\": false
      }]
    }")

  HTTP_CODE=$(echo "$CREATE_USER" | tail -1)
  if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Пользователь создан"

    # Получаем ID созданного пользователя
    USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?email=${VENDOR_EMAIL}" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" | python3 -c "import sys, json; users = json.load(sys.stdin); print(users[0]['id'] if users else '')")
  else
    echo "❌ Ошибка при создании пользователя. HTTP код: $HTTP_CODE"
    echo "$CREATE_USER" | sed '$d'
    exit 1
  fi
fi

# Назначаем роль vendor
echo "🔐 Назначение роли ${VENDOR_ROLE}..."
ROLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles/${VENDOR_ROLE}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$ROLE_RESPONSE" | tail -1)
if [ "$HTTP_CODE" -eq 200 ]; then
  ROLE_DATA=$(echo "$ROLE_RESPONSE" | sed '$d')
  ROLE_ID=$(echo "$ROLE_DATA" | python3 -c "import sys, json; role = json.load(sys.stdin); print(role.get('id', ''))")

  if [ -n "$ROLE_ID" ]; then
    ASSIGN_ROLE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/${USER_ID}/role-mappings/realm" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "[{\"id\":\"${ROLE_ID}\",\"name\":\"${VENDOR_ROLE}\"}]")

    HTTP_CODE=$(echo "$ASSIGN_ROLE" | tail -1)
    if [ "$HTTP_CODE" -eq 204 ]; then
      echo "✅ Роль ${VENDOR_ROLE} назначена"
    else
      echo "⚠️  Ошибка при назначении роли. HTTP код: $HTTP_CODE"
    fi
  fi
else
  echo "⚠️  Роль ${VENDOR_ROLE} не найдена в realm"
  echo "   Доступные роли можно проверить в Keycloak Admin Console"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Vendor пользователь настроен в Keycloak!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Учетные данные:"
echo "   Email: ${VENDOR_EMAIL}"
echo "   Password: ${VENDOR_PASSWORD}"
echo ""
echo "🌐 Вход:"
echo "   Vendor Portal: http://localhost:3002/auth/login"



