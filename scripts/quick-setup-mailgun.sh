#!/bin/bash
# Быстрая настройка Mailgun для Keycloak
# Использование: ./scripts/quick-setup-mailgun.sh

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM_NAME="${REALM_NAME:-memento-mori}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Настройка Mailgun для Keycloak"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Запрашиваем данные у пользователя
read -p "Mailgun SMTP Username (postmaster@sandbox.xxxxx.mailgun.org): " MAILGUN_SMTP_USER
read -sp "Mailgun SMTP Password: " MAILGUN_SMTP_PASSWORD
echo ""
read -p "Email отправителя (noreply@mementomori.ru): " MAILGUN_FROM
MAILGUN_FROM="${MAILGUN_FROM:-noreply@mementomori.ru}"
read -p "Имя отправителя (Memento Mori): " MAILGUN_FROM_DISPLAY
MAILGUN_FROM_DISPLAY="${MAILGUN_FROM_DISPLAY:-Memento Mori}"

if [ -z "$MAILGUN_SMTP_USER" ] || [ -z "$MAILGUN_SMTP_PASSWORD" ]; then
  echo "❌ SMTP username и password обязательны"
  exit 1
fi

# Экспортируем переменные и вызываем основной скрипт
export MAILGUN_SMTP_USER
export MAILGUN_SMTP_PASSWORD
export MAILGUN_FROM
export MAILGUN_FROM_DISPLAY

./scripts/setup-keycloak-mailgun.sh

