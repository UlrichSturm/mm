#!/bin/bash
# Создание администратора в Keycloak
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Данные администратора приложения
APP_ADMIN_EMAIL="${APP_ADMIN_EMAIL:-admin@memento-mori.com}"
APP_ADMIN_PASSWORD="${APP_ADMIN_PASSWORD:-OVrgGAAXKp2z6*qG}"
APP_ADMIN_FIRST_NAME="${APP_ADMIN_FIRST_NAME:-Admin}"
APP_ADMIN_LAST_NAME="${APP_ADMIN_LAST_NAME:-User}"

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
EXISTING_USER=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?email=${APP_ADMIN_EMAIL}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

USER_COUNT=$(echo "$EXISTING_USER" | python3 -c "import sys, json; users = json.load(sys.stdin); print(len(users))")

if [ "$USER_COUNT" -gt 0 ]; then
  echo "⚠️  Пользователь ${APP_ADMIN_EMAIL} уже существует"
  USER_ID=$(echo "$EXISTING_USER" | python3 -c "import sys, json; users = json.load(sys.stdin); print(users[0]['id'] if users else '')")
  echo "🔄 Обновляю пароль..."
  
  # Обновляем пароль
  UPDATE_PASSWORD=$(curl -s -w "\n%{http_code}" -X PUT "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users/${USER_ID}/reset-password" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"password\",\"value\":\"${APP_ADMIN_PASSWORD}\",\"temporary\":false}")
  
  HTTP_CODE=$(echo "$UPDATE_PASSWORD" | tail -1)
  if [ "$HTTP_CODE" -eq 204 ]; then
    echo "✅ Пароль обновлен"
  else
    echo "❌ Ошибка при обновлении пароля. HTTP код: $HTTP_CODE"
  fi
else
  echo "📝 Создание администратора..."
  
  # Создаем пользователя
  CREATE_USER=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${APP_ADMIN_EMAIL}\",
      \"emailVerified\": true,
      \"enabled\": true,
      \"username\": \"${APP_ADMIN_EMAIL}\",
      \"firstName\": \"${APP_ADMIN_FIRST_NAME}\",
      \"lastName\": \"${APP_ADMIN_LAST_NAME}\",
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"${APP_ADMIN_PASSWORD}\",
        \"temporary\": false
      }]
    }")
  
  HTTP_CODE=$(echo "$CREATE_USER" | tail -1)
  if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✅ Пользователь создан"
    
    # Получаем ID созданного пользователя
    USER_ID=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/users?email=${APP_ADMIN_EMAIL}" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" | python3 -c "import sys, json; users = json.load(sys.stdin); print(users[0]['id'] if users else '')")
  else
    echo "❌ Ошибка при создании пользователя. HTTP код: $HTTP_CODE"
    echo "$CREATE_USER" | sed '$d'
    exit 1
  fi
fi

# Назначаем роль admin
echo "🔐 Назначение роли admin..."
ROLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles/admin" \
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
      -d "[{\"id\":\"${ROLE_ID}\",\"name\":\"admin\"}]")
    
    HTTP_CODE=$(echo "$ASSIGN_ROLE" | tail -1)
    if [ "$HTTP_CODE" -eq 204 ]; then
      echo "✅ Роль admin назначена"
    else
      echo "⚠️  Ошибка при назначении роли. HTTP код: $HTTP_CODE"
    fi
  fi
else
  echo "⚠️  Роль admin не найдена в realm"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Администратор настроен в Keycloak!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Учетные данные:"
echo "   Email: ${APP_ADMIN_EMAIL}"
echo "   Password: ${APP_ADMIN_PASSWORD}"
echo ""
echo "🌐 Вход:"
echo "   Admin Portal: http://localhost:3003/auth/login"
echo "   Keycloak: http://localhost:8080"

