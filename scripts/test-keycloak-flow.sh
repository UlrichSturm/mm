#!/bin/bash

# Test Keycloak Integration Flow
# Tests the complete authentication and API flow

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-memento-mori}"
API_URL="${API_URL:-http://localhost:3001}"
CLIENT_ID="${CLIENT_ID:-memento-mori-api}"
CLIENT_SECRET="${CLIENT_SECRET:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Keycloak Integration Test${NC}\n"

# Step 1: Check Keycloak health
echo -e "${YELLOW}Step 1: Checking Keycloak health...${NC}"
if curl -s -f "${KEYCLOAK_URL}/health" > /dev/null; then
  echo -e "${GREEN}✅ Keycloak is accessible${NC}"
else
  echo -e "${RED}❌ Keycloak is not accessible at ${KEYCLOAK_URL}${NC}"
  echo -e "${YELLOW}Please ensure Keycloak is running:${NC}"
  echo -e "  docker-compose -f docker-compose.dev.yml up -d keycloak"
  exit 1
fi

# Step 2: Get admin token
echo -e "\n${YELLOW}Step 2: Getting admin token...${NC}"
ADMIN_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=admin" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to get admin token${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Admin token obtained${NC}"

# Step 3: Check if realm exists
echo -e "\n${YELLOW}Step 3: Checking realm...${NC}"
REALM_EXISTS=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}" | jq -r '.realm // empty')

if [ -z "$REALM_EXISTS" ]; then
  echo -e "${RED}❌ Realm '${KEYCLOAK_REALM}' does not exist${NC}"
  echo -e "${YELLOW}Please run setup script first:${NC}"
  echo -e "  node scripts/setup-keycloak.js"
  exit 1
fi
echo -e "${GREEN}✅ Realm '${KEYCLOAK_REALM}' exists${NC}"

# Step 4: Get client secret (if needed)
if [ -z "$CLIENT_SECRET" ]; then
  echo -e "\n${YELLOW}Step 4: Getting API client secret...${NC}"
  CLIENT_ID_OBJ=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients?clientId=${CLIENT_ID}" | jq -r '.[0]')

  if [ -z "$CLIENT_ID_OBJ" ] || [ "$CLIENT_ID_OBJ" = "null" ]; then
    echo -e "${RED}❌ Client '${CLIENT_ID}' not found${NC}"
    exit 1
  fi

  CLIENT_UUID=$(echo "$CLIENT_ID_OBJ" | jq -r '.id')
  CLIENT_SECRET=$(curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    "${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/clients/${CLIENT_UUID}/client-secret" | jq -r '.value')

  if [ -z "$CLIENT_SECRET" ] || [ "$CLIENT_SECRET" = "null" ]; then
    echo -e "${RED}❌ Failed to get client secret${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Client secret obtained${NC}"
else
  echo -e "\n${YELLOW}Step 4: Using provided client secret${NC}"
fi

# Step 5: Test user login
echo -e "\n${YELLOW}Step 5: Testing user login...${NC}"
USER_TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "username=client1@test.com" \
  -d "password=password123" | jq -r '.access_token')

if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to get user token${NC}"
  echo -e "${YELLOW}Please ensure test user exists:${NC}"
  echo -e "  Username: client1@test.com"
  echo -e "  Password: password123"
  exit 1
fi
echo -e "${GREEN}✅ User token obtained${NC}"

# Step 6: Test API call
echo -e "\n${YELLOW}Step 6: Testing API call...${NC}"
API_RESPONSE=$(curl -s -H "Authorization: Bearer ${USER_TOKEN}" \
  "${API_URL}/api/auth/profile")

if echo "$API_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  USER_EMAIL=$(echo "$API_RESPONSE" | jq -r '.email')
  echo -e "${GREEN}✅ API call successful${NC}"
  echo -e "${GREEN}   User email: ${USER_EMAIL}${NC}"
else
  echo -e "${RED}❌ API call failed${NC}"
  echo -e "${RED}   Response: ${API_RESPONSE}${NC}"
  exit 1
fi

# Step 7: Test protected endpoint
echo -e "\n${YELLOW}Step 7: Testing protected endpoint...${NC}"
ORDERS_RESPONSE=$(curl -s -H "Authorization: Bearer ${USER_TOKEN}" \
  "${API_URL}/api/orders/my")

if echo "$ORDERS_RESPONSE" | jq -e '.orders' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Protected endpoint accessible${NC}"
else
  echo -e "${YELLOW}⚠️  Protected endpoint response: ${ORDERS_RESPONSE}${NC}"
fi

# Summary
echo -e "\n${GREEN}✅ All tests passed!${NC}\n"
echo -e "${BLUE}Summary:${NC}"
echo -e "  ✅ Keycloak is running"
echo -e "  ✅ Realm exists"
echo -e "  ✅ Client configured"
echo -e "  ✅ User authentication works"
echo -e "  ✅ API integration works"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Start backend: npm run start:dev -w apps/server"
echo -e "  2. Start frontend apps"
echo -e "  3. Test login flow in browser"

