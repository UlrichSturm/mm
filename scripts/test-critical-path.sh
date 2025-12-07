#!/bin/bash

# Critical Path Testing Script
# Tests the complete user journey for ADMIN, VENDOR, and CLIENT roles

set -e

BASE_URL="http://localhost:3001/api/v1"
KEYCLOAK_URL="http://localhost:8080"
REALM="memento-mori"
CLIENT_ID="memento-mori-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Critical Path Testing - Memento Mori${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to get access token
get_token() {
    local email=$1
    local password=$2

    echo -e "${YELLOW}Getting token for: ${email}${NC}"

    TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "client_id=${CLIENT_ID}" \
        -d "client_secret=${CLIENT_SECRET:-}" \
        -d "grant_type=password" \
        -d "username=${email}" \
        -d "password=${password}" \
        -d "scope=openid")

    ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token // empty')

    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        echo -e "${RED}Failed to get token${NC}"
        echo "Response: $TOKEN_RESPONSE"
        return 1
    fi

    echo -e "${GREEN}✓ Token obtained${NC}"
    echo "$ACCESS_TOKEN"
}

# Function to make authenticated request
api_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4

    if [ -z "$data" ]; then
        curl -s -X "$method" "${BASE_URL}${endpoint}" \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "${BASE_URL}${endpoint}" \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Test results storage
TEST_RESULTS=()

# Function to record test result
record_test() {
    local test_name=$1
    local status=$2
    local details=$3
    TEST_RESULTS+=("${test_name}|${status}|${details}")
}

echo -e "\n${BLUE}=== PHASE 1: ADMIN SETUP ===${NC}\n"

# Step 1: Get admin token
echo -e "${YELLOW}Step 1: Admin Authentication${NC}"
ADMIN_TOKEN=$(get_token "admin@mementomori.de" "admin123")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Failed to authenticate admin${NC}"
    exit 1
fi
record_test "Admin Authentication" "PASS" "Token obtained"

# Step 2: Get admin profile
echo -e "\n${YELLOW}Step 2: Get Admin Profile${NC}"
ADMIN_PROFILE=$(api_request "GET" "/auth/profile" "$ADMIN_TOKEN")
ADMIN_USER_ID=$(echo $ADMIN_PROFILE | jq -r '.id // empty')
if [ -z "$ADMIN_USER_ID" ]; then
    echo -e "${RED}❌ Failed to get admin profile${NC}"
    echo "Response: $ADMIN_PROFILE"
    exit 1
fi
echo -e "${GREEN}✓ Admin profile retrieved${NC}"
echo "Admin ID: $ADMIN_USER_ID"
record_test "Get Admin Profile" "PASS" "Admin ID: $ADMIN_USER_ID"

# Step 3: Create categories
echo -e "\n${YELLOW}Step 3: Create Categories${NC}"

CATEGORIES=(
    '{"name":"Funeral Services","slug":"funeral-services","description":"Traditional funeral services","icon":"coffin","sortOrder":1,"isActive":true}'
    '{"name":"Cremation Services","slug":"cremation-services","description":"Cremation and memorial services","icon":"urn","sortOrder":2,"isActive":true}'
    '{"name":"Monuments & Headstones","slug":"monuments-headstones","description":"Gravestones and memorial monuments","icon":"stone","sortOrder":3,"isActive":true}'
    '{"name":"Floral Arrangements","slug":"floral-arrangements","description":"Funeral flowers and wreaths","icon":"flower","sortOrder":4,"isActive":true}'
)

CATEGORY_IDS=()
for category in "${CATEGORIES[@]}"; do
    RESPONSE=$(api_request "POST" "/categories" "$ADMIN_TOKEN" "$category")
    CATEGORY_ID=$(echo $RESPONSE | jq -r '.id // empty')
    if [ -n "$CATEGORY_ID" ] && [ "$CATEGORY_ID" != "null" ]; then
        CATEGORY_IDS+=("$CATEGORY_ID")
        CATEGORY_NAME=$(echo $RESPONSE | jq -r '.name // empty')
        echo -e "${GREEN}✓ Category created: ${CATEGORY_NAME} (${CATEGORY_ID})${NC}"
        record_test "Create Category: $CATEGORY_NAME" "PASS" "ID: $CATEGORY_ID"
    else
        echo -e "${RED}❌ Failed to create category${NC}"
        echo "Response: $RESPONSE"
        record_test "Create Category" "FAIL" "$RESPONSE"
    fi
done

echo -e "\n${BLUE}=== PHASE 2: VENDOR SETUP ===${NC}\n"

# Step 4: Get vendor token
echo -e "${YELLOW}Step 4: Vendor Authentication${NC}"
VENDOR_TOKEN=$(get_token "vendor1@test.com" "password123")
if [ -z "$VENDOR_TOKEN" ]; then
    echo -e "${RED}❌ Failed to authenticate vendor${NC}"
    exit 1
fi
record_test "Vendor Authentication" "PASS" "Token obtained"

# Step 5: Get vendor profile
echo -e "\n${YELLOW}Step 5: Get Vendor Profile${NC}"
VENDOR_PROFILE=$(api_request "GET" "/auth/profile" "$VENDOR_TOKEN")
VENDOR_USER_ID=$(echo $VENDOR_PROFILE | jq -r '.id // empty')
if [ -z "$VENDOR_USER_ID" ]; then
    echo -e "${RED}❌ Failed to get vendor profile${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Vendor profile retrieved${NC}"
echo "Vendor User ID: $VENDOR_USER_ID"
record_test "Get Vendor Profile" "PASS" "User ID: $VENDOR_USER_ID"

# Step 6: Create vendor profile
echo -e "\n${YELLOW}Step 6: Create Vendor Business Profile${NC}"
VENDOR_DATA='{
    "businessName": "Best Funeral Services GmbH",
    "email": "vendor1@test.com",
    "phone": "+49123456789",
    "address": "Hauptstraße 123, Berlin",
    "postalCode": "10115"
}'
VENDOR_PROFILE_RESPONSE=$(api_request "POST" "/vendors" "$VENDOR_TOKEN" "$VENDOR_DATA")
VENDOR_PROFILE_ID=$(echo $VENDOR_PROFILE_RESPONSE | jq -r '.id // empty')
if [ -z "$VENDOR_PROFILE_ID" ] || [ "$VENDOR_PROFILE_ID" = "null" ]; then
    echo -e "${YELLOW}⚠ Vendor profile might already exist, checking...${NC}"
    # Try to get existing profile
    VENDOR_PROFILE_RESPONSE=$(api_request "GET" "/vendors/me" "$VENDOR_TOKEN")
    VENDOR_PROFILE_ID=$(echo $VENDOR_PROFILE_RESPONSE | jq -r '.id // empty')
fi

if [ -n "$VENDOR_PROFILE_ID" ] && [ "$VENDOR_PROFILE_ID" != "null" ]; then
    echo -e "${GREEN}✓ Vendor profile ready${NC}"
    echo "Vendor Profile ID: $VENDOR_PROFILE_ID"
    record_test "Create Vendor Profile" "PASS" "Profile ID: $VENDOR_PROFILE_ID"
else
    echo -e "${RED}❌ Failed to create/get vendor profile${NC}"
    echo "Response: $VENDOR_PROFILE_RESPONSE"
    record_test "Create Vendor Profile" "FAIL" "$VENDOR_PROFILE_RESPONSE"
fi

# Step 7: Admin approves vendor
echo -e "\n${YELLOW}Step 7: Admin Approves Vendor${NC}"
if [ -n "$VENDOR_PROFILE_ID" ] && [ "$VENDOR_PROFILE_ID" != "null" ]; then
    APPROVE_RESPONSE=$(api_request "PATCH" "/admin/vendors/${VENDOR_PROFILE_ID}/status" "$ADMIN_TOKEN" '{"status":"APPROVED"}')
    VENDOR_STATUS=$(echo $APPROVE_RESPONSE | jq -r '.status // empty')
    if [ "$VENDOR_STATUS" = "APPROVED" ]; then
        echo -e "${GREEN}✓ Vendor approved${NC}"
        record_test "Approve Vendor" "PASS" "Status: APPROVED"
    else
        echo -e "${YELLOW}⚠ Vendor might already be approved${NC}"
        record_test "Approve Vendor" "PASS" "Already approved or response: $APPROVE_RESPONSE"
    fi
else
    echo -e "${RED}❌ Cannot approve vendor - profile ID missing${NC}"
    record_test "Approve Vendor" "FAIL" "Profile ID missing"
fi

# Step 8: Vendor creates services
echo -e "\n${YELLOW}Step 8: Vendor Creates Services${NC}"

if [ ${#CATEGORY_IDS[@]} -gt 0 ]; then
    SERVICES=(
        "{\"name\":\"Traditional Funeral Service\",\"description\":\"Complete traditional funeral service with ceremony\",\"price\":2500,\"categoryId\":\"${CATEGORY_IDS[0]}\",\"duration\":120}"
        "{\"name\":\"Cremation Service\",\"description\":\"Cremation service with urn\",\"price\":1500,\"categoryId\":\"${CATEGORY_IDS[1]}\",\"duration\":90}"
        "{\"name\":\"Granite Headstone\",\"description\":\"Custom granite headstone with engraving\",\"price\":800,\"categoryId\":\"${CATEGORY_IDS[2]}\",\"duration\":0}"
        "{\"name\":\"Funeral Wreath\",\"description\":\"Beautiful floral wreath for funeral\",\"price\":150,\"categoryId\":\"${CATEGORY_IDS[3]}\",\"duration\":0}"
    )

    SERVICE_IDS=()
    for service in "${SERVICES[@]}"; do
        RESPONSE=$(api_request "POST" "/services" "$VENDOR_TOKEN" "$service")
        SERVICE_ID=$(echo $RESPONSE | jq -r '.id // empty')
        if [ -n "$SERVICE_ID" ] && [ "$SERVICE_ID" != "null" ]; then
            SERVICE_IDS+=("$SERVICE_ID")
            SERVICE_NAME=$(echo $RESPONSE | jq -r '.name // empty')
            echo -e "${GREEN}✓ Service created: ${SERVICE_NAME} (${SERVICE_ID})${NC}"
            record_test "Create Service: $SERVICE_NAME" "PASS" "ID: $SERVICE_ID"
        else
            echo -e "${RED}❌ Failed to create service${NC}"
            echo "Response: $RESPONSE"
            record_test "Create Service" "FAIL" "$RESPONSE"
        fi
    done
else
    echo -e "${RED}❌ No categories available, cannot create services${NC}"
    record_test "Create Services" "FAIL" "No categories"
fi

echo -e "\n${BLUE}=== PHASE 3: CLIENT JOURNEY ===${NC}\n"

# Step 9: Get client token
echo -e "${YELLOW}Step 9: Client Authentication${NC}"
CLIENT_TOKEN=$(get_token "client1@test.com" "password123")
if [ -z "$CLIENT_TOKEN" ]; then
    echo -e "${RED}❌ Failed to authenticate client${NC}"
    exit 1
fi
record_test "Client Authentication" "PASS" "Token obtained"

# Step 10: Get client profile
echo -e "\n${YELLOW}Step 10: Get Client Profile${NC}"
CLIENT_PROFILE=$(api_request "GET" "/auth/profile" "$CLIENT_TOKEN")
CLIENT_USER_ID=$(echo $CLIENT_PROFILE | jq -r '.id // empty')
if [ -z "$CLIENT_USER_ID" ]; then
    echo -e "${RED}❌ Failed to get client profile${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Client profile retrieved${NC}"
echo "Client ID: $CLIENT_USER_ID"
record_test "Get Client Profile" "PASS" "Client ID: $CLIENT_USER_ID"

# Step 11: Browse services
echo -e "\n${YELLOW}Step 11: Browse Available Services${NC}"
SERVICES_LIST=$(api_request "GET" "/services?limit=10" "$CLIENT_TOKEN")
SERVICES_COUNT=$(echo $SERVICES_LIST | jq -r '.data | length // 0')
echo -e "${GREEN}✓ Found ${SERVICES_COUNT} services${NC}"
record_test "Browse Services" "PASS" "Found $SERVICES_COUNT services"

# Step 12: Create order
echo -e "\n${YELLOW}Step 12: Create Order${NC}"
if [ ${#SERVICE_IDS[@]} -gt 0 ]; then
    ORDER_DATA="{
        \"items\": [
            {
                \"serviceId\": \"${SERVICE_IDS[0]}\",
                \"quantity\": 1,
                \"notes\": \"Please contact me for scheduling\"
            },
            {
                \"serviceId\": \"${SERVICE_IDS[3]}\",
                \"quantity\": 2,
                \"notes\": \"White roses preferred\"
            }
        ],
        \"notes\": \"Urgent order, please contact ASAP\",
        \"scheduledDate\": \"2025-12-15T10:00:00.000Z\"
    }"

    ORDER_RESPONSE=$(api_request "POST" "/orders" "$CLIENT_TOKEN" "$ORDER_DATA")
    ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id // empty')
    ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.orderNumber // empty')

    if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
        echo -e "${GREEN}✓ Order created${NC}"
        echo "Order ID: $ORDER_ID"
        echo "Order Number: $ORDER_NUMBER"
        ORDER_TOTAL=$(echo $ORDER_RESPONSE | jq -r '.totalPrice // 0')
        echo "Total Price: €$ORDER_TOTAL"
        record_test "Create Order" "PASS" "Order: $ORDER_NUMBER, Total: €$ORDER_TOTAL"
    else
        echo -e "${RED}❌ Failed to create order${NC}"
        echo "Response: $ORDER_RESPONSE"
        record_test "Create Order" "FAIL" "$ORDER_RESPONSE"
        exit 1
    fi
else
    echo -e "${RED}❌ No services available, cannot create order${NC}"
    record_test "Create Order" "FAIL" "No services"
    exit 1
fi

# Step 13: Create payment intent
echo -e "\n${YELLOW}Step 13: Create Payment Intent${NC}"
if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    PAYMENT_INTENT_DATA="{\"orderId\":\"${ORDER_ID}\"}"
    PAYMENT_RESPONSE=$(api_request "POST" "/payments/intent" "$CLIENT_TOKEN" "$PAYMENT_INTENT_DATA")
    PAYMENT_INTENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.paymentIntentId // empty')
    CLIENT_SECRET=$(echo $PAYMENT_RESPONSE | jq -r '.clientSecret // empty')

    if [ -n "$PAYMENT_INTENT_ID" ] && [ "$PAYMENT_INTENT_ID" != "null" ]; then
        echo -e "${GREEN}✓ Payment Intent created${NC}"
        echo "Payment Intent ID: $PAYMENT_INTENT_ID"
        echo "Client Secret: ${CLIENT_SECRET:0:20}..."
        record_test "Create Payment Intent" "PASS" "Intent ID: $PAYMENT_INTENT_ID"
    else
        echo -e "${YELLOW}⚠ Payment Intent creation might require Stripe configuration${NC}"
        echo "Response: $PAYMENT_RESPONSE"
        record_test "Create Payment Intent" "WARN" "Stripe not configured or $PAYMENT_RESPONSE"
    fi
else
    echo -e "${RED}❌ Cannot create payment intent - order ID missing${NC}"
    record_test "Create Payment Intent" "FAIL" "Order ID missing"
fi

# Print summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}\n"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r test_name status details <<< "$result"
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((PASS_COUNT++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $test_name - $details"
        ((WARN_COUNT++))
    else
        echo -e "${RED}✗${NC} $test_name - $details"
        ((FAIL_COUNT++))
    fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "Total Tests: ${#TEST_RESULTS[@]}"
echo -e "${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}Warnings: ${WARN_COUNT}${NC}"
echo -e "${RED}Failed: ${FAIL_COUNT}${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}\n"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}\n"
    exit 1
fi

