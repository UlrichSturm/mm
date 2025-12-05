#!/bin/bash

# Step-by-step Critical Path Testing
# This script tests each step individually with detailed output

set -e

BASE_URL="http://localhost:3001/api"
KEYCLOAK_URL="http://localhost:8080"
REALM="memento-mori"
CLIENT_ID="memento-mori-api"
CLIENT_SECRET="J4rBRZuKYLMSy8mGvFjw9DI0SUjRf32P"

echo "=========================================="
echo "Critical Path Testing - Step by Step"
echo "=========================================="
echo ""

# Step 1: Admin Authentication
echo "STEP 1: Admin Authentication"
echo "---------------------------"
ADMIN_TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "grant_type=password" \
  -d "username=admin@mementomori.de" \
  -d "password=admin123" \
  -d "scope=openid")

ADMIN_TOKEN=$(echo $ADMIN_TOKEN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo "❌ FAILED: Cannot get admin token"
    echo "Response: $ADMIN_TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Admin token obtained: ${ADMIN_TOKEN:0:30}..."
echo ""

# Step 2: Get Admin Profile
echo "STEP 2: Get Admin Profile"
echo "---------------------------"
ADMIN_PROFILE=$(curl -s -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

ADMIN_USER_ID=$(echo $ADMIN_PROFILE | jq -r '.id // empty')
ADMIN_EMAIL=$(echo $ADMIN_PROFILE | jq -r '.email // empty')
ADMIN_ROLE=$(echo $ADMIN_PROFILE | jq -r '.role // empty')

if [ -z "$ADMIN_USER_ID" ]; then
    echo "❌ FAILED: Cannot get admin profile"
    echo "Response: $ADMIN_PROFILE"
    exit 1
fi

echo "✅ Admin Profile:"
echo "   ID: $ADMIN_USER_ID"
echo "   Email: $ADMIN_EMAIL"
echo "   Role: $ADMIN_ROLE"
echo ""

# Step 3: Create Categories
echo "STEP 3: Create Categories"
echo "---------------------------"

CATEGORY_1='{"name":"Funeral Services","slug":"funeral-services","description":"Traditional funeral services","icon":"coffin","sortOrder":1,"isActive":true}'
CATEGORY_1_RESPONSE=$(curl -s -X POST "${BASE_URL}/categories" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$CATEGORY_1")

CATEGORY_1_ID=$(echo $CATEGORY_1_RESPONSE | jq -r '.id // empty')
if [ -n "$CATEGORY_1_ID" ] && [ "$CATEGORY_1_ID" != "null" ]; then
    echo "✅ Category 1 created: Funeral Services (ID: $CATEGORY_1_ID)"
else
    echo "⚠️  Category 1 might already exist or error: $CATEGORY_1_RESPONSE"
    # Try to get existing category
    CATEGORIES_LIST=$(curl -s -X GET "${BASE_URL}/categories?includeInactive=true" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}")
    CATEGORY_1_ID=$(echo $CATEGORIES_LIST | jq -r '.data[] | select(.slug=="funeral-services") | .id' | head -1)
    if [ -n "$CATEGORY_1_ID" ]; then
        echo "✅ Using existing category: $CATEGORY_1_ID"
    fi
fi

CATEGORY_2='{"name":"Cremation Services","slug":"cremation-services","description":"Cremation and memorial services","icon":"urn","sortOrder":2,"isActive":true}'
CATEGORY_2_RESPONSE=$(curl -s -X POST "${BASE_URL}/categories" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$CATEGORY_2")

CATEGORY_2_ID=$(echo $CATEGORY_2_RESPONSE | jq -r '.id // empty')
if [ -z "$CATEGORY_2_ID" ] || [ "$CATEGORY_2_ID" = "null" ]; then
    CATEGORIES_LIST=$(curl -s -X GET "${BASE_URL}/categories?includeInactive=true" \
      -H "Authorization: Bearer ${ADMIN_TOKEN}")
    CATEGORY_2_ID=$(echo $CATEGORIES_LIST | jq -r '.data[] | select(.slug=="cremation-services") | .id' | head -1)
fi
if [ -n "$CATEGORY_2_ID" ]; then
    echo "✅ Category 2 created/found: Cremation Services (ID: $CATEGORY_2_ID)"
fi

echo ""

# Step 4: Vendor Authentication
echo "STEP 4: Vendor Authentication"
echo "---------------------------"
VENDOR_TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "grant_type=password" \
  -d "username=vendor1@test.com" \
  -d "password=password123" \
  -d "scope=openid")

VENDOR_TOKEN=$(echo $VENDOR_TOKEN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$VENDOR_TOKEN" ] || [ "$VENDOR_TOKEN" = "null" ]; then
    echo "❌ FAILED: Cannot get vendor token"
    echo "Response: $VENDOR_TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Vendor token obtained: ${VENDOR_TOKEN:0:30}..."
echo ""

# Step 5: Get/Create Vendor Profile
echo "STEP 5: Get/Create Vendor Profile"
echo "---------------------------"
VENDOR_PROFILE=$(curl -s -X GET "${BASE_URL}/auth/profile" \
  -H "Authorization: Bearer ${VENDOR_TOKEN}")

VENDOR_USER_ID=$(echo $VENDOR_PROFILE | jq -r '.id // empty')
echo "✅ Vendor User ID: $VENDOR_USER_ID"

# Check if vendor profile exists
VENDOR_PROFILE_DATA=$(curl -s -X GET "${BASE_URL}/vendors/me" \
  -H "Authorization: Bearer ${VENDOR_TOKEN}")

VENDOR_PROFILE_ID=$(echo $VENDOR_PROFILE_DATA | jq -r '.id // empty')

if [ -z "$VENDOR_PROFILE_ID" ] || [ "$VENDOR_PROFILE_ID" = "null" ]; then
    echo "Creating vendor profile..."
    VENDOR_CREATE_DATA='{
        "businessName": "Best Funeral Services GmbH",
        "email": "vendor1@test.com",
        "phone": "+49123456789",
        "address": "Hauptstraße 123, Berlin",
        "postalCode": "10115"
    }'

    VENDOR_CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/vendors" \
      -H "Authorization: Bearer ${VENDOR_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$VENDOR_CREATE_DATA")

    VENDOR_PROFILE_ID=$(echo $VENDOR_CREATE_RESPONSE | jq -r '.id // empty')
fi

if [ -n "$VENDOR_PROFILE_ID" ] && [ "$VENDOR_PROFILE_ID" != "null" ]; then
    echo "✅ Vendor Profile ID: $VENDOR_PROFILE_ID"
else
    echo "❌ FAILED: Cannot create/get vendor profile"
    exit 1
fi
echo ""

# Step 6: Admin Approves Vendor
echo "STEP 6: Admin Approves Vendor"
echo "---------------------------"
APPROVE_RESPONSE=$(curl -s -X PATCH "${BASE_URL}/admin/vendors/${VENDOR_PROFILE_ID}/status" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}')

VENDOR_STATUS=$(echo $APPROVE_RESPONSE | jq -r '.status // empty')
if [ "$VENDOR_STATUS" = "APPROVED" ]; then
    echo "✅ Vendor approved successfully"
else
    echo "⚠️  Vendor status: $VENDOR_STATUS (might already be approved)"
fi
echo ""

# Step 7: Vendor Creates Services
echo "STEP 7: Vendor Creates Services"
echo "---------------------------"

if [ -n "$CATEGORY_1_ID" ] && [ -n "$CATEGORY_2_ID" ]; then
    SERVICE_1='{"name":"Traditional Funeral Service","description":"Complete traditional funeral service with ceremony","price":2500,"categoryId":"'${CATEGORY_1_ID}'","duration":120}'
    SERVICE_1_RESPONSE=$(curl -s -X POST "${BASE_URL}/services" \
      -H "Authorization: Bearer ${VENDOR_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$SERVICE_1")

    SERVICE_1_ID=$(echo $SERVICE_1_RESPONSE | jq -r '.id // empty')
    if [ -n "$SERVICE_1_ID" ] && [ "$SERVICE_1_ID" != "null" ]; then
        echo "✅ Service 1 created: Traditional Funeral Service (ID: $SERVICE_1_ID)"
    else
        echo "⚠️  Service 1 creation: $SERVICE_1_RESPONSE"
    fi

    SERVICE_2='{"name":"Funeral Wreath","description":"Beautiful floral wreath for funeral","price":150,"categoryId":"'${CATEGORY_2_ID}'","duration":0}'
    SERVICE_2_RESPONSE=$(curl -s -X POST "${BASE_URL}/services" \
      -H "Authorization: Bearer ${VENDOR_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$SERVICE_2")

    SERVICE_2_ID=$(echo $SERVICE_2_RESPONSE | jq -r '.id // empty')
    if [ -n "$SERVICE_2_ID" ] && [ "$SERVICE_2_ID" != "null" ]; then
        echo "✅ Service 2 created: Funeral Wreath (ID: $SERVICE_2_ID)"
    else
        echo "⚠️  Service 2 creation: $SERVICE_2_RESPONSE"
    fi
else
    echo "❌ Cannot create services - categories missing"
fi
echo ""

# Step 8: Client Authentication
echo "STEP 8: Client Authentication"
echo "---------------------------"
CLIENT_TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "grant_type=password" \
  -d "username=client1@test.com" \
  -d "password=password123" \
  -d "scope=openid")

CLIENT_TOKEN=$(echo $CLIENT_TOKEN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$CLIENT_TOKEN" ] || [ "$CLIENT_TOKEN" = "null" ]; then
    echo "❌ FAILED: Cannot get client token"
    exit 1
fi

echo "✅ Client token obtained: ${CLIENT_TOKEN:0:30}..."
echo ""

# Step 9: Browse Services
echo "STEP 9: Client Browses Services"
echo "---------------------------"
SERVICES_LIST=$(curl -s -X GET "${BASE_URL}/services?limit=10" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}")

SERVICES_COUNT=$(echo $SERVICES_LIST | jq -r '.data | length // 0')
echo "✅ Found $SERVICES_COUNT services"
echo ""

# Step 10: Create Order
echo "STEP 10: Client Creates Order"
echo "---------------------------"

if [ -n "$SERVICE_1_ID" ] && [ -n "$SERVICE_2_ID" ]; then
    ORDER_DATA='{
        "items": [
            {
                "serviceId": "'${SERVICE_1_ID}'",
                "quantity": 1,
                "notes": "Please contact me for scheduling"
            },
            {
                "serviceId": "'${SERVICE_2_ID}'",
                "quantity": 2,
                "notes": "White roses preferred"
            }
        ],
        "notes": "Urgent order, please contact ASAP",
        "scheduledDate": "2025-12-15T10:00:00.000Z"
    }'

    ORDER_RESPONSE=$(curl -s -X POST "${BASE_URL}/orders" \
      -H "Authorization: Bearer ${CLIENT_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$ORDER_DATA")

    ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id // empty')
    ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.orderNumber // empty')
    ORDER_TOTAL=$(echo $ORDER_RESPONSE | jq -r '.totalPrice // 0')

    if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
        echo "✅ Order created successfully:"
        echo "   Order ID: $ORDER_ID"
        echo "   Order Number: $ORDER_NUMBER"
        echo "   Total Price: €$ORDER_TOTAL"
    else
        echo "❌ FAILED: Cannot create order"
        echo "Response: $ORDER_RESPONSE"
        exit 1
    fi
else
    echo "❌ Cannot create order - services missing"
    exit 1
fi
echo ""

# Step 11: Create Payment Intent
echo "STEP 11: Create Payment Intent"
echo "---------------------------"
PAYMENT_INTENT_DATA='{"orderId":"'${ORDER_ID}'"}'
PAYMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/payments/intent" \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYMENT_INTENT_DATA")

PAYMENT_INTENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.paymentIntentId // empty')

if [ -n "$PAYMENT_INTENT_ID" ] && [ "$PAYMENT_INTENT_ID" != "null" ]; then
    echo "✅ Payment Intent created:"
    echo "   Payment Intent ID: $PAYMENT_INTENT_ID"
    CLIENT_SECRET=$(echo $PAYMENT_RESPONSE | jq -r '.clientSecret // empty')
    echo "   Client Secret: ${CLIENT_SECRET:0:30}..."
else
    echo "⚠️  Payment Intent creation: $PAYMENT_RESPONSE"
    echo "   (This might require Stripe configuration)"
fi

echo ""
echo "=========================================="
echo "✅ Critical Path Testing Complete!"
echo "=========================================="

