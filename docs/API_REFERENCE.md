# API Reference

**Base URL (Development):** `http://localhost:3001/api`  
**Base URL (Production):** `https://api.mementomori.de/api`

**Swagger UI:** `http://localhost:3001/api/docs`

---

## Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

Get token by logging in via `/auth/login` endpoint.

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Orders](#orders-endpoints)
3. [Payments](#payments-endpoints)
4. [Services](#services-endpoints)
5. [Categories](#categories-endpoints)
6. [Vendors](#vendors-endpoints)
7. [Lawyers & Notaries](#lawyers--notaries-endpoints)
8. [Admin](#admin-endpoints)

---

## Authentication Endpoints

### POST `/auth/register`

Register a new client user.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### POST `/auth/login`

Login existing user.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT"
  }
}
```

---

### GET `/auth/profile`

Get current user profile. 🔒 **Requires Auth**

**Response (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CLIENT"
}
```

---

### PATCH `/auth/profile`

Update current user profile. 🔒 **Requires Auth**

**Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "newemail@example.com"
}
```

**Response (200):** Updated user object

---

## Orders Endpoints

### POST `/orders`

Create a new order. 🔒 **Client only**

**Body:**

```json
{
  "items": [
    {
      "serviceId": "service-uuid",
      "quantity": 2,
      "notes": "Please call before delivery"
    }
  ],
  "notes": "Delivery to back entrance",
  "scheduledDate": "2025-12-15T10:00:00.000Z"
}
```

**Response (201):**

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-2025-001234",
  "client": { ... },
  "items": [ ... ],
  "subtotal": 300.00,
  "tax": 57.00,
  "totalPrice": 357.00,
  "currency": "EUR",
  "status": "PENDING",
  "createdAt": "2025-12-10T10:00:00.000Z"
}
```

---

### GET `/orders/my`

Get current client's orders. 🔒 **Client only**

**Query Parameters:**

- `status` - Filter by status (optional)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### GET `/orders/vendor`

Get orders for vendor's services. 🔒 **Vendor only**

**Query Parameters:**

- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

---

### GET `/orders/:id`

Get order details by ID. 🔒 **Owner, Vendor, or Admin**

---

### PATCH `/orders/:id/status`

Update order status. 🔒 **Vendor or Admin**

**Body:**

```json
{
  "status": "CONFIRMED",
  "reason": "Order confirmed by vendor"
}
```

**Valid Transitions:**

- `PENDING` → `CONFIRMED` or `CANCELLED`
- `CONFIRMED` → `IN_PROGRESS` or `CANCELLED`
- `IN_PROGRESS` → `COMPLETED` or `CANCELLED`
- `COMPLETED` → `REFUNDED`

---

### PATCH `/orders/:id/cancel`

Cancel an order. 🔒 **Client only, PENDING status**

**Body:**

```json
{
  "reason": "Changed my mind"
}
```

---

### GET `/orders`

List all orders. 🔒 **Admin only**

**Query Parameters:**

- `status` - Filter by status
- `clientId` - Filter by client
- `vendorId` - Filter by vendor
- `page`, `limit` - Pagination

---

## Payments Endpoints

### POST `/payments/intent`

Create Stripe payment intent for an order. 🔒 **Client only**

**Body:**

```json
{
  "orderId": "order-uuid",
  "returnUrl": "https://mementomori.de/payments/success"
}
```

**Response (201):**

```json
{
  "paymentIntentId": "pi_1234567890",
  "clientSecret": "pi_1234567890_secret_xyz",
  "amount": 35700,
  "currency": "eur"
}
```

Use `clientSecret` with Stripe Elements on frontend.

---

### POST `/payments/webhook`

Stripe webhook handler. **Public** (Stripe signature required)

Handles events:

- `payment_intent.succeeded` - Mark payment as completed
- `payment_intent.payment_failed` - Mark as failed
- `charge.refunded` - Process refund

---

### GET `/payments/my`

Get client's payment history. 🔒 **Client only**

**Query Parameters:**

- `status` - Filter by status
- `page`, `limit` - Pagination

---

### GET `/payments/:id`

Get payment details. 🔒 **Owner or Admin**

---

### POST `/payments/:id/refund`

Initiate refund. 🔒 **Admin only**

---

## Services Endpoints

### GET `/services`

Get all services. **Public**

**Query Parameters:**

- `search` - Search by name/description
- `categoryId` - Filter by category
- `vendorId` - Filter by vendor
- `minPrice`, `maxPrice` - Price range
- `page`, `limit` - Pagination

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Funeral Flower Arrangement",
      "description": "Beautiful flowers...",
      "price": 150.00,
      "currency": "EUR",
      "status": "ACTIVE",
      "vendor": {
        "id": "uuid",
        "businessName": "Bestattungen Becker GmbH",
        "rating": 4.5,
        "reviewCount": 23
      },
      "category": {
        "id": "uuid",
        "name": "Flowers",
        "slug": "flowers"
      },
      "images": ["https://..."],
      "duration": 60
    }
  ],
  "meta": { ... }
}
```

---

### GET `/services/:id`

Get service details. **Public**

---

### POST `/services`

Create a new service. 🔒 **Vendor only (APPROVED)**

**Body:**

```json
{
  "name": "Funeral Flower Arrangement",
  "description": "Beautiful floral arrangement...",
  "price": 150.0,
  "categoryId": "category-uuid",
  "duration": 60,
  "images": ["https://example.com/image.jpg"]
}
```

---

### GET `/services/vendor/my`

Get vendor's own services. 🔒 **Vendor only**

**Query Parameters:**

- `search`, `categoryId`, `status`
- `page`, `limit`

---

### PATCH `/services/:id`

Update service. 🔒 **Owner or Admin**

---

### DELETE `/services/:id`

Delete service (soft delete). 🔒 **Owner or Admin**

---

### PATCH `/services/:id/status`

Update service status. 🔒 **Admin only**

**Body:**

```json
{
  "status": "ACTIVE" // or "INACTIVE", "PENDING_REVIEW", "DELETED"
}
```

---

## Categories Endpoints

### GET `/categories`

Get all categories. **Public** (only active)

**Query Parameters:**

- `includeInactive` - Include inactive (admin only)

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Funeral Flowers",
      "slug": "funeral-flowers",
      "description": "Beautiful arrangements...",
      "icon": "flower",
      "sortOrder": 1,
      "isActive": true,
      "servicesCount": 15,
      "createdAt": "2025-12-01T00:00:00.000Z"
    }
  ],
  "total": 10
}
```

---

### GET `/categories/:id`

Get category by ID. **Public**

---

### GET `/categories/slug/:slug`

Get category by slug. **Public**

Example: `/categories/slug/funeral-flowers`

---

### POST `/categories`

Create category. 🔒 **Admin only**

**Body:**

```json
{
  "name": "Funeral Flowers",
  "slug": "funeral-flowers",
  "description": "Beautiful arrangements...",
  "icon": "flower",
  "sortOrder": 1,
  "isActive": true
}
```

---

### PATCH `/categories/:id`

Update category. 🔒 **Admin only**

---

### DELETE `/categories/:id`

Delete category. 🔒 **Admin only**

⚠️ Cannot delete if category has associated services.

---

## Vendors Endpoints

### GET `/vendors`

List all vendors. 🔒 **Admin only**

**Query Parameters:**

- `status` - Filter by status (PENDING, APPROVED, REJECTED, SUSPENDED)

---

### GET `/vendors/me`

Get current vendor profile. 🔒 **Vendor only**

---

### GET `/vendors/:id`

Get vendor by ID. **Public**

---

### PATCH `/vendors/me`

Update own vendor profile. 🔒 **Vendor only**

---

### PATCH `/vendors/:id/status`

Update vendor status. 🔒 **Admin only**

**Body:**

```json
{
  "status": "APPROVED" // or "REJECTED", "SUSPENDED"
}
```

---

## Lawyers & Notaries Endpoints

### GET `/lawyer-notary`

List all lawyers/notaries. 🔒 **Admin only**

---

### GET `/lawyer-notary/available`

Get available lawyers by postal code. **Public**

**Query Parameters:**

- `postalCode` - Postal code to search

---

### GET `/lawyer-notary/me`

Get current lawyer/notary profile. 🔒 **Lawyer/Notary only**

---

### GET `/lawyer-notary/:id`

Get lawyer/notary by ID. **Public**

---

### PATCH `/lawyer-notary/:id/status`

Update lawyer/notary status. 🔒 **Admin only**

---

## Admin Endpoints

### GET `/admin/stats`

Get platform statistics. 🔒 **Admin only**

**Response (200):**

```json
{
  "users": {
    "total": 150,
    "clients": 120,
    "vendors": 20,
    "lawyersNotaries": 8,
    "admins": 2
  },
  "vendors": {
    "total": 20,
    "pending": 5,
    "approved": 12,
    "rejected": 2,
    "suspended": 1
  },
  "services": {
    "total": 85,
    "active": 75,
    "inactive": 5,
    "pendingReview": 3,
    "deleted": 2
  },
  "orders": {
    "total": 240,
    "pending": 15,
    "confirmed": 50,
    "inProgress": 30,
    "completed": 130,
    "cancelled": 10,
    "refunded": 5
  },
  "payments": {
    "total": 240,
    "pending": 5,
    "processing": 3,
    "completed": 220,
    "failed": 7,
    "refunded": 5
  },
  "financial": {
    "totalRevenue": 125000.0,
    "platformFees": 6250.0,
    "stripeFees": 3750.0,
    "vendorPayouts": 115000.0,
    "refundedAmount": 2500.0,
    "averageOrderValue": 520.83
  },
  "recentActivity": {
    "newUsersLast7Days": 12,
    "newOrdersLast7Days": 45,
    "revenueLast7Days": 23500.0,
    "pendingVendorApprovals": 3,
    "pendingServiceReviews": 2
  },
  "topCategories": [
    {
      "slug": "funeral-flowers",
      "name": "Funeral Flowers",
      "servicesCount": 35,
      "ordersCount": 120,
      "revenue": 18500.0
    }
  ],
  "generatedAt": "2025-12-10T15:30:00.000Z"
}
```

---

## Health Endpoints

### GET `/health`

Basic health check. **Public**

**Response (200):**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "env": "development"
}
```

---

### GET `/health/ready`

Readiness probe (checks database). **Public**

---

### GET `/health/live`

Liveness probe. **Public**

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-12-10T10:00:00.000Z",
  "path": "/api/orders"
}
```

### Pagination Response

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Error Codes

| Code                   | HTTP Status | Description                    |
| ---------------------- | ----------- | ------------------------------ |
| `VALIDATION_ERROR`     | 400         | Invalid input data             |
| `UNAUTHORIZED`         | 401         | Not authenticated              |
| `FORBIDDEN`            | 403         | Not authorized for this action |
| `NOT_FOUND`            | 404         | Resource not found             |
| `CONFLICT`             | 409         | Resource already exists        |
| `BUSINESS_LOGIC_ERROR` | 422         | Business rule violation        |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests              |
| `INTERNAL_ERROR`       | 500         | Server error                   |

---

## Rate Limiting

| Endpoint Type  | Limit                     |
| -------------- | ------------------------- |
| Default        | 100 requests / 60 seconds |
| Auth endpoints | 10 requests / 60 seconds  |

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

---

## Testing with cURL

### Register a user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Get profile (with token)

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create an order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "serviceId": "service-uuid",
        "quantity": 1
      }
    ],
    "notes": "Test order"
  }'
```

---

## Frontend Integration Examples

### React / Next.js

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createOrder(orderData: CreateOrderDto) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getMyOrders(page = 1, limit = 10) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`${API_BASE_URL}/orders/my?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}
```

---

## WebSocket Support (Future)

WebSocket endpoints will be added in Phase 2 for real-time notifications:

- Order status updates
- New messages
- Payment confirmations

---

## Changelog

### v1.0.0 (2025-12-02)

- ✅ Authentication (login, register, profile)
- ✅ Orders CRUD with status management
- ✅ Payments with Stripe integration
- ✅ Services CRUD for vendors
- ✅ Categories CRUD for admin
- ✅ Vendors moderation
- ✅ Lawyers/Notaries management
- ✅ Admin statistics
- ✅ Health checks
- ✅ Email notifications
- ✅ File uploads (S3/MinIO)

---

For detailed API documentation with live testing, visit:  
**📚 http://localhost:3001/api/docs**
