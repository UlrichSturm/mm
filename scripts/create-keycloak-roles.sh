#!/bin/bash
set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALM_NAME="${REALM_NAME:-memento-mori}"

# Роли для создания
ROLES=("client" "vendor" "lawyer-notary" "admin")

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

echo "🔍 Проверка существующих ролей..."
EXISTING_ROLES=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" | python3 -c "
import sys, json
roles = json.load(sys.stdin)
realm_roles = [r['name'] for r in roles if r.get('containerId') == '${REALM_NAME}']
print(' '.join(realm_roles))
")

echo "📋 Существующие роли: ${EXISTING_ROLES:-нет}"
echo ""

echo "🔑 Создание ролей..."
for ROLE in "${ROLES[@]}"; do
  # Проверяем, существует ли роль
  ROLE_EXISTS=$(echo "$EXISTING_ROLES" | grep -q "$ROLE" && echo "true" || echo "false")
  
  if [ "$ROLE_EXISTS" = "true" ]; then
    echo "  ✅ Роль '$ROLE' уже существует"
  else
    echo "  📦 Создание роли: $ROLE"
    ROLE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"${ROLE}\", \"description\": \"Role for ${ROLE}\"}")
    
    HTTP_CODE=$(echo "$ROLE_RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" -eq 201 ]; then
      echo "    ✅ Роль '$ROLE' успешно создана"
    elif [ "$HTTP_CODE" -eq 409 ]; then
      echo "    ⚠️  Роль '$ROLE' уже существует"
    else
      echo "    ❌ Ошибка при создании роли '$ROLE'. HTTP код: $HTTP_CODE"
      echo "$ROLE_RESPONSE" | head -n -1
    fi
  fi
done

echo ""
echo "🔍 Финальный список ролей:"
FINAL_ROLES=$(curl -s -X GET "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}/roles" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" | python3 -c "
import sys, json
roles = json.load(sys.stdin)
realm_roles = [r['name'] for r in roles if r.get('containerId') == '${REALM_NAME}']
for role in sorted(realm_roles):
    print(f'  ✅ {role}')
")

echo "$FINAL_ROLES"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Настройка ролей завершена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

