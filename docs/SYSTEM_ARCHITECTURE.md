# System Architecture & Service Interactions

**Date**: 2025-11-25  
**Version**: 1.0  
**Purpose**: Complete documentation of all services, functions, and their interactions

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Service Architecture](#service-architecture)
3. [Core Services](#core-services)
4. [Service Interactions](#service-interactions)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [API Endpoints Summary](#api-endpoints-summary)

---

## System Overview

The platform is built as a **Monorepo** with:
- **Backend**: NestJS REST API (Port 3001)
- **Client App**: Next.js PWA (Port 3000)
- **Vendor Portal**: Next.js Admin (Port 3002)
- **Admin Portal**: Next.js Admin (Port 3003)

**Database**: PostgreSQL with Prisma ORM

---

## Service Architecture

### Module Dependency Graph

```
AppModule (Root)
├── DatabaseModule (Prisma Client)
├── LoggerModule (Logging & Error Tracking)
├── AuthModule (Authentication & Authorization)
│   ├── JWT Strategy
│   ├── Local Strategy
│   ├── JwtAuthGuard
│   └── RolesGuard
├── VendorsModule (Vendor Management)
├── CategoriesModule (Category Hierarchy)
├── ServicesModule (Service Management)
│   ├── Uses: VendorsModule, EmailModule
├── OrdersModule (Order Processing)
│   ├── Uses: ServicesModule, VendorsModule, EmailModule
├── ReviewsModule (Review System)
│   ├── Uses: OrdersModule, VendorsModule
├── MemorialsModule (Memorial Pages)
│   ├── Uses: OrdersModule
├── LocationsModule (Geolocation Services)
├── UsersModule (User Management)
├── AdminModule (Admin Operations)
│   ├── Uses: LoggerModule, DatabaseModule
└── EmailModule (Email Notifications)
```

---

## Core Services

### 1. Authentication Service (`AuthModule`)

**Purpose**: User registration, login, and token management

**Functions**:
- `register()` - Register new client user
- `registerVendor()` - Register new vendor (creates User + VendorProfile)
- `login()` - Authenticate user (returns JWT token)
- `refreshToken()` - Refresh access token

**Dependencies**:
- `DatabaseModule` (Prisma)
- `JwtService` (from `@nestjs/jwt`)

**Interactions**:
- Creates `User` records
- Creates `VendorProfile` records (for vendor registration)
- Sends email notifications via `EmailModule` (vendor approval)

**API Endpoints**:
- `POST /auth/register` - Client registration
- `POST /auth/register/vendor` - Vendor registration
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

---

### 2. Vendors Service (`VendorsModule`)

**Purpose**: Vendor profile management and approval workflow

**Functions**:
- `create()` - Create vendor (Admin only)
- `findAll()` - Get all vendors (Admin only, filterable by status)
- `findByUserId()` - Get vendor by user ID
- `findOne()` - Get vendor by ID
- `updateProfile()` - Update vendor profile (Vendor or Admin)
- `updateStatus()` - Update vendor status (Admin only: PENDING → APPROVED/REJECTED)
- `delete()` - Delete vendor (Admin only, with validation)

**Dependencies**:
- `DatabaseModule`
- `EmailModule` (sends approval/rejection emails)

**Interactions**:
- **AuthModule**: Uses user data for vendor creation
- **ServicesModule**: Vendor must be APPROVED to create services
- **OrdersModule**: Vendor receives orders
- **ReviewsModule**: Vendor receives reviews

**API Endpoints**:
- `POST /vendors` - Create vendor (Admin)
- `GET /vendors` - List vendors (Admin)
- `GET /vendors/me` - Get own profile (Vendor/Admin)
- `GET /vendors/:id` - Get vendor by ID
- `PATCH /vendors/me` - Update own profile (Vendor)
- `PATCH /vendors/:id` - Update vendor (Admin)
- `PATCH /vendors/:id/status` - Update status (Admin)
- `DELETE /vendors/:id` - Delete vendor (Admin)

---

### 3. Services Service (`ServicesModule`)

**Purpose**: Service/Product catalog management

**Functions**:
- `create()` - Create new service (Vendor only, status: DRAFT)
- `findMyServices()` - Get vendor's own services
- `findAll()` - Get public services (APPROVED only, filterable)
- `findOne()` - Get service by ID/slug
- `searchByLocation()` - Geo-search services (PostGIS)
- `update()` - Update service (Vendor, own services only)
- `updateStatus()` - Update service status (Admin: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED)
- `delete()` - Delete service (Vendor, own services only)

**Dependencies**:
- `VendorsModule` (validates vendor exists and is APPROVED)
- `EmailModule` (notifies admin on service submission)

**Interactions**:
- **VendorsModule**: Validates vendor status before creation
- **CategoriesModule**: Links services to categories
- **OrdersModule**: Services are ordered by clients
- **ReviewsModule**: Services receive reviews

**API Endpoints**:
- `POST /services` - Create service (Vendor)
- `GET /services/my` - Get my services (Vendor)
- `GET /services` - Get public services (filterable)
- `GET /services/:id` - Get service by ID
- `GET /services/search/location` - Geo-search
- `PATCH /services/:id` - Update service (Vendor)
- `PATCH /services/:id/status` - Update status (Admin)
- `DELETE /services/:id` - Delete service (Vendor)

---

### 4. Orders Service (`OrdersModule`)

**Purpose**: Order processing, payment, and fulfillment

**Functions**:
- `create()` - Create new order (Client only)
- `findAll()` - Get orders (filtered by role: Client sees own, Vendor sees own, Admin sees all)
- `findOne()` - Get order by ID (with access control)
- `updateStatus()` - Update order status (Client/Vendor/Admin, with state machine validation)
- `resolveDispute()` - Resolve order dispute (Admin only)
- `getEscrowStats()` - Get escrow statistics (Admin only)

**Payment Flow**:
1. Client creates order → Status: `PENDING`
2. Client authorizes payment → Payment status: `AUTHORIZED`
3. Vendor confirms order → Payment status: `CAPTURED`, Order status: `CONFIRMED`
4. Vendor marks as `IN_PROGRESS` → Service delivery
5. Vendor marks as `COMPLETED` → 24h timer starts for escrow release
6. After 24h → Payment released to vendor

**Dependencies**:
- `ServicesModule` (validates services exist)
- `VendorsModule` (validates vendor)
- `EmailModule` (sends order notifications)

**Interactions**:
- **ServicesModule**: Orders contain service items
- **VendorsModule**: Orders belong to vendors
- **ReviewsModule**: Completed orders can be reviewed
- **MemorialsModule**: Orders can have memorial pages

**API Endpoints**:
- `POST /orders` - Create order (Client)
- `GET /orders` - List orders (role-based)
- `GET /orders/my` - Get my orders (Client)
- `GET /orders/escrow/stats` - Escrow stats (Admin)
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id/status` - Update status
- `POST /orders/:id/resolve-dispute` - Resolve dispute (Admin)

---

### 5. Reviews Service (`ReviewsModule`)

**Purpose**: Review and rating system with moderation

**Functions**:
- `create()` - Create review (Client only, for completed orders)
- `findAll()` - Get reviews (public: APPROVED only, Admin: all statuses)
- `findOne()` - Get review by ID
- `updateStatus()` - Moderate review (Admin: PENDING → APPROVED/REJECTED)
- `remove()` - Delete review (Client, own reviews, PENDING only)
- `getVendorRating()` - Get vendor rating statistics

**Workflow**:
1. Order status: `COMPLETED`
2. Client creates review → Status: `PENDING`
3. Admin moderates → Status: `APPROVED` or `REJECTED`
4. Approved reviews appear publicly

**Dependencies**:
- `OrdersModule` (validates order is completed)
- `VendorsModule` (links review to vendor)

**Interactions**:
- **OrdersModule**: Reviews require completed orders
- **VendorsModule**: Reviews affect vendor ratings
- **ServicesModule**: Reviews can be service-specific

**API Endpoints**:
- `POST /reviews` - Create review (Client)
- `GET /reviews` - List reviews (public/Admin)
- `GET /reviews/:id` - Get review by ID
- `PATCH /reviews/:id/status` - Moderate review (Admin)
- `DELETE /reviews/:id` - Delete review (Client)
- `GET /reviews/vendor/:vendorId/rating` - Get vendor rating

---

### 6. Categories Service (`CategoriesModule`)

**Purpose**: Hierarchical category management

**Functions**:
- `create()` - Create category (Admin only)
- `findAll()` - Get categories (with optional children)
- `findOne()` - Get category by ID/slug
- `update()` - Update category (Admin)
- `delete()` - Delete category (Admin, with validation)

**Dependencies**:
- `DatabaseModule`

**Interactions**:
- **ServicesModule**: Services belong to categories

**API Endpoints**:
- `POST /categories` - Create category (Admin)
- `GET /categories` - List categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

---

### 7. Memorials Service (`MemorialsModule`)

**Purpose**: Digital memorial page management

**Functions**:
- `create()` - Create memorial page (Client, linked to order)
- `findAll()` - Get memorials (public)
- `findOne()` - Get memorial by slug
- `update()` - Update memorial (Client, own memorials)
- `delete()` - Delete memorial (Client, own memorials)

**Dependencies**:
- `OrdersModule` (validates order exists)

**Interactions**:
- **OrdersModule**: Memorials are linked to orders

**API Endpoints**:
- `POST /memorials` - Create memorial (Client)
- `GET /memorials` - List memorials
- `GET /memorials/:slug` - Get memorial by slug
- `PATCH /memorials/:id` - Update memorial (Client)
- `DELETE /memorials/:id` - Delete memorial (Client)

---

### 8. Locations Service (`LocationsModule`)

**Purpose**: Geolocation and location-based services

**Functions**:
- `search()` - Search locations (cemeteries, ceremony halls, etc.)
- `findByCoordinates()` - Find locations near coordinates

**Dependencies**:
- `DatabaseModule` (PostGIS for geo-queries)

**Interactions**:
- **ServicesModule**: Used for location-based service search

**API Endpoints**:
- `GET /locations/search` - Search locations
- `GET /locations/nearby` - Find nearby locations

---

### 9. Users Service (`UsersModule`)

**Purpose**: User profile management

**Functions**:
- `findAll()` - Get all users (Admin only)
- `findOne()` - Get user by ID
- `update()` - Update user profile (Admin)
- `delete()` - Delete user (Admin)

**Dependencies**:
- `DatabaseModule`

**Interactions**:
- **AuthModule**: Users are created during registration

**API Endpoints**:
- `GET /users` - List users (Admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

---

### 10. Admin Service (`AdminModule`)

**Purpose**: Administrative operations and monitoring

**Functions**:
- `getModerationLogs()` - Get moderation activity logs
- `getLogs()` - Get application logs (filterable by level, context, date)
- `cleanOldLogs()` - Clean old log entries

**Dependencies**:
- `LoggerModule` (DatabaseLoggerService)
- `DatabaseModule`

**Interactions**:
- **All Modules**: Logs actions from all modules

**API Endpoints**:
- `GET /admin/moderation-logs` - Get moderation logs (Admin)
- `GET /admin/logs` - Get application logs (Admin)
- `DELETE /admin/logs/clean` - Clean old logs (Admin)

---

### 11. Email Service (`EmailModule`)

**Purpose**: Email notifications

**Functions**:
- `sendVendorApprovalEmail()` - Notify vendor of approval
- `sendVendorRejectionEmail()` - Notify vendor of rejection
- `sendOrderConfirmationEmail()` - Notify client of order confirmation
- `sendOrderStatusUpdateEmail()` - Notify of order status changes
- `sendServiceApprovalEmail()` - Notify vendor of service approval

**Dependencies**:
- External: Mailgun or SMTP service

**Interactions**:
- **VendorsModule**: Sends approval/rejection emails
- **OrdersModule**: Sends order notifications
- **ServicesModule**: Sends service approval notifications

---

### 12. Logger Service (`LoggerModule`)

**Purpose**: Application logging and error tracking

**Functions**:
- `log()` - Log message with level and context
- `error()` - Log error with stack trace
- `getLogs()` - Retrieve logs (filterable)
- `cleanOldLogs()` - Clean old log entries

**Dependencies**:
- `DatabaseModule` (stores logs in database)

**Interactions**:
- **All Modules**: All modules use logger for error tracking

---

## Service Interactions

### Critical User Journey Flow

```
1. CLIENT REGISTRATION
   Client → AuthModule.register()
   ├── Creates User (role: CLIENT)
   └── Returns success

2. VENDOR REGISTRATION
   Vendor → AuthModule.registerVendor()
   ├── Creates User (role: VENDOR)
   ├── Creates VendorProfile (status: PENDING)
   └── EmailModule → Sends registration confirmation

3. VENDOR APPROVAL
   Admin → VendorsModule.updateStatus()
   ├── Updates VendorProfile.status → APPROVED
   ├── EmailModule → Sends approval email
   └── Vendor can now create services

4. SERVICE CREATION
   Vendor → ServicesModule.create()
   ├── Validates vendor is APPROVED
   ├── Creates Service (status: DRAFT)
   └── Vendor → ServicesModule.updateStatus() → PENDING_APPROVAL

5. SERVICE APPROVAL
   Admin → ServicesModule.updateStatus()
   ├── Updates Service.status → APPROVED
   ├── EmailModule → Sends approval email
   └── Service is now public

6. ORDER CREATION
   Client → OrdersModule.create()
   ├── Validates services exist
   ├── Creates Order (status: PENDING)
   └── Returns order with payment intent

7. PAYMENT AUTHORIZATION
   Client → PaymentService.authorize()
   ├── Creates Payment (status: AUTHORIZED)
   └── Returns clientSecret for Stripe

8. ORDER CONFIRMATION
   Vendor → OrdersModule.updateStatus()
   ├── PaymentService.capture() → CAPTURED
   ├── Updates Order.status → CONFIRMED
   └── EmailModule → Sends confirmation to client

9. ORDER FULFILLMENT
   Vendor → OrdersModule.updateStatus()
   ├── Updates Order.status → IN_PROGRESS
   └── Updates Order.status → COMPLETED

10. ESCROW RELEASE
    Scheduled Job → PaymentService.releaseEscrow()
    ├── After 24h of COMPLETED
    └── Releases funds to vendor

11. REVIEW CREATION
    Client → ReviewsModule.create()
    ├── Validates order is COMPLETED
    ├── Creates Review (status: PENDING)
    └── Admin moderates → APPROVED

12. MEMORIAL CREATION
    Client → MemorialsModule.create()
    ├── Validates order exists
    └── Creates Memorial page
```

---

## Data Flow Diagrams

### Service Creation Flow

```
Vendor (Frontend)
    ↓
POST /services
    ↓
ServicesController.create()
    ↓
ServicesService.create()
    ├── VendorsService.findByUserId() → Validates vendor
    ├── CategoriesService.findOne() → Validates category
    └── Prisma.service.create() → Creates service
    ↓
EmailService.sendServiceSubmissionEmail() → Notifies admin
    ↓
Response: Service created (DRAFT)
```

### Order Processing Flow

```
Client (Frontend)
    ↓
POST /orders
    ↓
OrdersController.create()
    ↓
OrdersService.create()
    ├── ServicesService.findOne() → Validates services
    ├── VendorsService.findOne() → Validates vendor
    └── Prisma.order.create() → Creates order
    ↓
PaymentService.authorize()
    ├── Stripe.createPaymentIntent()
    └── Prisma.payment.create() → Creates payment
    ↓
Response: Order + Payment Intent
    ↓
Client confirms payment (Stripe)
    ↓
Vendor confirms order
    ↓
OrdersService.updateStatus()
    ├── PaymentService.capture()
    └── EmailService.sendOrderConfirmation()
```

### Review Moderation Flow

```
Client (Frontend)
    ↓
POST /reviews
    ↓
ReviewsController.create()
    ↓
ReviewsService.create()
    ├── OrdersService.findOne() → Validates order is COMPLETED
    └── Prisma.review.create() → Creates review (PENDING)
    ↓
Admin (Frontend)
    ↓
PATCH /reviews/:id/status
    ↓
ReviewsController.updateStatus()
    ↓
ReviewsService.updateStatus()
    └── Prisma.review.update() → Status: APPROVED/REJECTED
    ↓
Review appears publicly (if APPROVED)
```

---

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Client registration
- `POST /auth/register/vendor` - Vendor registration
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Vendors
- `POST /vendors` - Create vendor (Admin)
- `GET /vendors` - List vendors (Admin)
- `GET /vendors/me` - Get own profile (Vendor/Admin)
- `GET /vendors/:id` - Get vendor by ID
- `PATCH /vendors/me` - Update own profile (Vendor)
- `PATCH /vendors/:id/status` - Update status (Admin)
- `DELETE /vendors/:id` - Delete vendor (Admin)

### Services
- `POST /services` - Create service (Vendor)
- `GET /services/my` - Get my services (Vendor)
- `GET /services` - Get public services
- `GET /services/:id` - Get service by ID
- `GET /services/search/location` - Geo-search
- `PATCH /services/:id` - Update service (Vendor)
- `PATCH /services/:id/status` - Update status (Admin)
- `DELETE /services/:id` - Delete service (Vendor)

### Orders
- `POST /orders` - Create order (Client)
- `GET /orders` - List orders (role-based)
- `GET /orders/my` - Get my orders (Client)
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id/status` - Update status
- `POST /orders/:id/resolve-dispute` - Resolve dispute (Admin)

### Reviews
- `POST /reviews` - Create review (Client)
- `GET /reviews` - List reviews
- `GET /reviews/:id` - Get review by ID
- `PATCH /reviews/:id/status` - Moderate review (Admin)
- `DELETE /reviews/:id` - Delete review (Client)
- `GET /reviews/vendor/:vendorId/rating` - Get vendor rating

### Categories
- `POST /categories` - Create category (Admin)
- `GET /categories` - List categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

### Memorials
- `POST /memorials` - Create memorial (Client)
- `GET /memorials` - List memorials
- `GET /memorials/:slug` - Get memorial by slug
- `PATCH /memorials/:id` - Update memorial (Client)
- `DELETE /memorials/:id` - Delete memorial (Client)

### Admin
- `GET /admin/moderation-logs` - Get moderation logs
- `GET /admin/logs` - Get application logs
- `DELETE /admin/logs/clean` - Clean old logs

### Users
- `GET /users` - List users (Admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)

---

## Security & Authorization

### Role-Based Access Control (RBAC)

**Roles**:
- `CLIENT` - Can create orders, reviews, memorials
- `VENDOR` - Can manage services, orders, profile
- `ADMIN` - Full access to all operations

**Guards**:
- `JwtAuthGuard` - Validates JWT token
- `RolesGuard` - Validates user role

**Access Matrix**:

| Endpoint | CLIENT | VENDOR | ADMIN |
|----------|--------|--------|-------|
| `/auth/register` | ✅ | ✅ | ✅ |
| `/auth/register/vendor` | ✅ | ✅ | ✅ |
| `/services` (GET) | ✅ | ✅ | ✅ |
| `/services` (POST) | ❌ | ✅ | ✅ |
| `/services/:id/status` | ❌ | ❌ | ✅ |
| `/orders` (POST) | ✅ | ❌ | ✅ |
| `/orders` (GET) | ✅ (own) | ✅ (own) | ✅ (all) |
| `/reviews` (POST) | ✅ | ❌ | ❌ |
| `/reviews/:id/status` | ❌ | ❌ | ✅ |
| `/vendors/:id/status` | ❌ | ❌ | ✅ |

---

## Database Schema Overview

**Core Models**:
- `User` - All users (CLIENT, VENDOR, ADMIN)
- `VendorProfile` - Vendor business information
- `Category` - Hierarchical service categories
- `Service` - Services/products offered by vendors
- `Order` - Client orders
- `Payment` - Payment records (Escrow)
- `Review` - Client reviews (moderated)
- `Memorial` - Digital memorial pages
- `ModerationLog` - Admin action logs
- `ApplicationLog` - System logs

**Relationships**:
- User 1:1 VendorProfile
- VendorProfile 1:N Service
- Category 1:N Service
- Service 1:N OrderItem
- Order 1:1 Payment
- Order 1:1 Review
- Order 1:1 Memorial

---

## Error Handling

**Global Exception Filter**: `HttpExceptionFilter`
- Catches all exceptions
- Logs errors via `LoggerService`
- Returns user-friendly error messages
- Hides stack traces in production

**Validation**: `ValidationPipe`
- Validates all DTOs
- Transforms query parameters
- Returns detailed validation errors

---

## Logging Strategy

**LoggerService**:
- Logs to database (`ApplicationLog` table)
- Logs to console (development)
- Logs errors with stack traces
- Logs HTTP requests/responses (optional middleware)

**Log Levels**:
- `INFO` - General information
- `WARN` - Warnings
- `ERROR` - Errors
- `DEBUG` - Debug information

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-25

