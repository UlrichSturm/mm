#!/bin/bash

# Configuration
KEYCLOAK_URL="http://localhost:8080"
API_URL="http://localhost:3001"
REALM="memento-mori"
CLIENT_ID="memento-mori-api"
CLIENT_SECRET="9PiiV2MW5BQnVn7y6ai8PNYnjuky1FKK" # From previous steps

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Starting Authorization Verification..."

# Function to get token
get_token() {
    local username=$1
    local password=$2

    response=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=$CLIENT_ID" \
        -d "client_secret=$CLIENT_SECRET" \
        -d "username=$username" \
        -d "password=$password")

    echo $response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
}

# Function to test endpoint
test_endpoint() {
    local name=$1
    local token=$2
    local endpoint=$3
    local expected_status=$4

    echo -n "Testing $name ($endpoint)... "

    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$API_URL$endpoint")

    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}OK ($status)${NC}"
        return 0
    else
        echo -e "${RED}FAILED (Expected $expected_status, got $status)${NC}"
        return 1
    fi
}

# 1. Test Client Authorization
echo -e "\n👤 Testing Client Authorization..."
CLIENT_TOKEN=$(get_token "client1@test.com" "password123")

if [ -z "$CLIENT_TOKEN" ]; then
    echo -e "${RED}Failed to get Client token${NC}"
else
    # Test protected client endpoint (assuming /api/orders/my exists and requires auth)
    # Note: If no orders exist, it might return 200 with empty list, which is fine for auth check
    test_endpoint "Client Orders" "$CLIENT_TOKEN" "/api/orders/my" 200
fi

# 2. Test Vendor Authorization
echo -e "\n🏪 Testing Vendor Authorization..."
VENDOR_TOKEN=$(get_token "vendor1@test.com" "password123")

if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}Failed to get Vendor token${NC}"
else
    # Test protected vendor endpoint
    test_endpoint "Vendor Services" "$VENDOR_TOKEN" "/api/services/vendor/my" 200
fi

# 3. Test Admin Authorization
echo -e "\n🛡️ Testing Admin Authorization..."
ADMIN_TOKEN=$(get_token "admin@mementomori.de" "admin123")

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to get Admin token${NC}"
else
    # Test protected admin endpoint
    test_endpoint "Admin Stats" "$ADMIN_TOKEN" "/api/admin/stats" 200
fi

# 4. Test Lawyer Authorization
echo -e "\n⚖️ Testing Lawyer Authorization..."
LAWYER_TOKEN=$(get_token "lawyer1@test.com" "password123")

if [ -z "$LAWYER_TOKEN" ]; then
    echo -e "${RED}Failed to get Lawyer token${NC}"
else
    # Test protected lawyer endpoint
    test_endpoint "Lawyer Profile" "$LAWYER_TOKEN" "/api/lawyer-notary/me" 200
fi

echo -e "\n✅ Verification Complete"
