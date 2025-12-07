# Services Overview - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** Complete Service Documentation

---

## 📋 Table of Contents

1. [Platform Services Overview](#platform-services-overview)
2. [Client Application Services](#client-application-services)
3. [Vendor Portal Services](#vendor-portal-services)
4. [Admin Portal Services](#admin-portal-services)
5. [Backend API Services](#backend-api-services)
6. [External Services](#external-services)
7. [Service Dependencies](#service-dependencies)

---

## Platform Services Overview

Memento Mori consists of **4 main applications** and **1 backend API**, all working together to provide a comprehensive funeral services marketplace.

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Services                      │
├──────────────────┬──────────────────┬──────────────────┤
│  Client App      │  Vendor Portal   │  Admin Portal    │
│  (Port 3000)     │  (Port 3002)      │  (Port 3003)      │
└────────┬─────────┴────────┬──────────┴────────┬─────────┘
         │                  │                   │
         └──────────────────┴───────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Backend API     │
                  │   (Port 3001)     │
                  └─────────┬─────────┘
                            │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │PostgreSQL│        │  Redis  │        │Keycloak│
    │ Database │        │  Cache  │        │   Auth  │
    └─────────┘        └─────────┘        └─────────┘
```

---

## Client Application Services

**Port:** 3000
**Technology:** Next.js 14, React 18, TypeScript
**Purpose:** End-user application for clients to browse services, place orders, and manage wills

### Core Features

#### 1. Authentication Service
- **User Registration:** Create client account
- **Login/Logout:** Secure authentication via Keycloak
- **Profile Management:** Update user profile information
- **Password Management:** Reset and change password

#### 2. Service Catalog Service
- **Browse Services:** View all available funeral services
- **Search & Filter:** Search by name, category, price, location
- **Service Details:** View detailed service information
- **Category Navigation:** Browse by service categories
- **Vendor Profiles:** View vendor information and reviews

#### 3. Shopping Cart Service
- **Add to Cart:** Add services to shopping cart
- **Cart Management:** Update quantities, remove items
- **Cart Persistence:** Save cart across sessions
- **Price Calculation:** Real-time price updates with taxes

#### 4. Order Management Service
- **Place Order:** Create order from cart
- **Order History:** View past and current orders
- **Order Details:** View order status and details
- **Order Tracking:** Track order progress
- **Order Cancellation:** Cancel pending orders

#### 5. Payment Service
- **Payment Processing:** Secure payment via Stripe
- **Payment Methods:** Credit/debit cards
- **Payment History:** View payment transactions
- **Receipt Management:** Download payment receipts
- **Refund Requests:** Request refunds for eligible orders

#### 6. Will Service
- **Will Creation:** Create will document
- **Lawyer/Notary Search:** Find nearby legal professionals
- **Appointment Scheduling:** Schedule will certification
- **Will Execution:** Track will execution process
- **Document Management:** Upload and manage will documents

#### 7. Review Service
- **Write Reviews:** Leave reviews for services
- **View Reviews:** Read reviews from other users
- **Rating System:** Rate services (1-5 stars)
- **Review Moderation:** Reviews moderated before publication

---

## Vendor Portal Services

**Port:** 3002
**Technology:** Next.js 14, React 18, TypeScript
**Purpose:** Portal for vendors to manage their services, orders, and appointments

### Core Features

#### 1. Authentication Service
- **Vendor Login:** Secure authentication via Keycloak
- **Profile Management:** Update vendor profile
- **Account Settings:** Manage account preferences

#### 2. Service Management Service
- **Create Services:** Add new services to catalog
- **Edit Services:** Update service information
- **Delete Services:** Remove services (soft delete)
- **Service Status:** Manage service availability
- **Service Images:** Upload and manage service photos
- **Pricing Management:** Set and update service prices

#### 3. Order Management Service
- **View Orders:** See all orders for vendor's services
- **Order Details:** View detailed order information
- **Order Status Updates:** Update order status (confirmed, in progress, completed)
- **Order History:** View past orders
- **Order Filtering:** Filter by status, date, customer

#### 4. Appointment Management Service
- **Appointment Calendar:** View and manage appointments
- **Schedule Management:** Set available time slots
- **Appointment Requests:** Accept/reject appointment requests
- **Appointment Completion:** Mark appointments as completed
- **Client Communication:** Contact clients about appointments

#### 5. Client Management Service
- **Client List:** View all clients who placed orders
- **Client Details:** View client information
- **Client Communication:** Message clients
- **Client History:** View client order history

#### 6. Schedule Management Service
- **Working Hours:** Set business hours
- **Blocked Dates:** Mark unavailable dates
- **Service Radius:** Set service delivery radius
- **Home Visit Settings:** Configure home visit availability

#### 7. Death Notification Service
- **Death Notification Form:** Submit death notifications
- **Client Search:** Search for clients by name
- **Notification Processing:** Process death notifications
- **Will Execution:** Initiate will execution process

#### 8. Analytics Service (Future)
- **Sales Dashboard:** View sales statistics
- **Order Analytics:** Analyze order trends
- **Revenue Reports:** View revenue breakdown
- **Performance Metrics:** Track key performance indicators

---

## Admin Portal Services

**Port:** 3003
**Technology:** Next.js 14, React 18, TypeScript
**Purpose:** Administrative portal for platform management

### Core Features

#### 1. Authentication Service
- **Admin Login:** Secure authentication via Keycloak
- **Role Management:** Manage admin roles and permissions
- **Session Management:** Monitor active admin sessions

#### 2. Dashboard Service
- **Platform Statistics:** View overall platform metrics
- **Revenue Dashboard:** Financial statistics and trends
- **User Statistics:** User growth and activity metrics
- **Order Statistics:** Order volume and status breakdown
- **Vendor Statistics:** Vendor count and status distribution
- **Charts & Graphs:** Visual representation of data

#### 3. Vendor Moderation Service
- **Vendor List:** View all vendors with filters
- **Vendor Approval:** Approve or reject vendor applications
- **Vendor Details:** View complete vendor information
- **Vendor Status Management:** Update vendor status
- **Vendor Deletion:** Remove vendors from platform

#### 4. Service Moderation Service
- **Service List:** View all services with filters
- **Service Approval:** Approve or reject service listings
- **Service Details:** View complete service information
- **Service Status Management:** Update service status
- **Service Deletion:** Remove services from catalog

#### 5. Lawyer/Notary Management Service
- **Lawyer/Notary List:** View all legal professionals
- **Profile Creation:** Create lawyer/notary profiles
- **Profile Management:** Update profiles
- **Status Management:** Approve/reject applications
- **Statistics:** View lawyer/notary statistics

#### 6. Will Management Service
- **Will Appointments:** View and manage will appointments
- **Appointment Status:** Update appointment status
- **Will Executions:** Track will execution process
- **Statistics:** View will service statistics

#### 7. User Management Service
- **User List:** View all platform users
- **User Details:** View user information
- **User Status:** Activate/deactivate users
- **Role Management:** Assign roles to users
- **User Activity:** View user activity logs

#### 8. Order Management Service
- **All Orders:** View all platform orders
- **Order Details:** View complete order information
- **Order Status:** Update order status
- **Order Filtering:** Filter by status, vendor, customer
- **Order Analytics:** Analyze order trends

#### 9. Financial Management Service
- **Revenue Reports:** View revenue breakdown
- **Payment History:** View all payment transactions
- **Refund Management:** Process refunds
- **Financial Analytics:** Financial trends and forecasts

---

## Backend API Services

**Port:** 3001
**Technology:** NestJS 10, TypeScript, Prisma
**Purpose:** RESTful API providing business logic and data access

### Core Modules

#### 1. Authentication Module (`AuthModule`)
- **User Registration:** Create new user accounts
- **User Login:** Authenticate users via Keycloak
- **Token Management:** JWT token generation and validation
- **Profile Management:** User profile CRUD operations
- **Password Management:** Password reset and change

**Endpoints:**
- `POST /auth/register` - Register client
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update profile

#### 2. Vendors Module (`VendorsModule`)
- **Vendor CRUD:** Create, read, update, delete vendors
- **Vendor Moderation:** Approve/reject vendor applications
- **Vendor Search:** Search and filter vendors
- **Vendor Statistics:** Vendor-related statistics

**Endpoints:**
- `POST /vendors` - Create vendor (Admin)
- `GET /vendors` - List vendors (Admin)
- `GET /vendors/me` - Get own profile
- `GET /vendors/:id` - Get vendor by ID
- `PATCH /vendors/:id` - Update vendor
- `PATCH /vendors/:id/status` - Update status
- `DELETE /vendors/:id` - Delete vendor

#### 3. Services Module (`ServicesModule`)
- **Service CRUD:** Create, read, update, delete services
- **Service Catalog:** Public service catalog with filters
- **Service Search:** Search services by various criteria
- **Service Moderation:** Approve/reject service listings

**Endpoints:**
- `POST /services` - Create service (Vendor)
- `GET /services` - List services (Public)
- `GET /services/:id` - Get service details
- `GET /services/vendor/my` - Get vendor's services
- `PATCH /services/:id` - Update service
- `DELETE /services/:id` - Delete service
- `PATCH /services/:id/status` - Update status (Admin)

#### 4. Categories Module (`CategoriesModule`)
- **Category CRUD:** Manage service categories
- **Category Hierarchy:** Support for nested categories
- **Category Navigation:** Category-based navigation

**Endpoints:**
- `POST /categories` - Create category (Admin)
- `GET /categories` - List categories (Public)
- `GET /categories/:id` - Get category
- `GET /categories/slug/:slug` - Get by slug
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### 5. Orders Module (`OrdersModule`)
- **Order Creation:** Create orders from cart
- **Order Management:** Update order status and details
- **Order History:** Retrieve order history for users/vendors
- **Order Tracking:** Track order progress

**Endpoints:**
- `POST /orders` - Create order (Client)
- `GET /orders/my` - Get client's orders
- `GET /orders/vendor` - Get vendor's orders
- `GET /orders` - Get all orders (Admin)
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update status
- `PATCH /orders/:id/cancel` - Cancel order

#### 6. Payments Module (`PaymentsModule`)
- **Payment Processing:** Process payments via Stripe
- **Payment Intents:** Create Stripe payment intents
- **Webhook Handling:** Handle Stripe webhooks
- **Refund Processing:** Process refunds

**Endpoints:**
- `POST /payments/intent` - Create payment intent
- `POST /payments/webhook` - Stripe webhook
- `GET /payments/my` - Get client's payments
- `GET /payments` - Get all payments (Admin)
- `GET /payments/:id` - Get payment details
- `POST /payments/:id/refund` - Process refund

#### 7. Lawyer/Notary Module (`LawyerNotaryModule`)
- **Profile Management:** CRUD operations for lawyers/notaries
- **Moderation:** Approve/reject applications
- **Appointment Management:** Manage will appointments
- **Will Execution:** Track will execution

**Endpoints:**
- `POST /lawyer-notary` - Create profile (Admin)
- `GET /lawyer-notary` - List profiles
- `GET /lawyer-notary/me` - Get own profile
- `GET /lawyer-notary/:id` - Get profile
- `PATCH /lawyer-notary/:id` - Update profile
- `PATCH /lawyer-notary/:id/status` - Update status
- `DELETE /lawyer-notary/:id` - Delete profile

#### 8. Wills Module (`WillsModule`)
- **Will Creation:** Create will documents
- **Appointment Scheduling:** Schedule will appointments
- **Will Execution:** Track will execution process
- **Document Management:** Manage will documents

**Endpoints:**
- `POST /wills` - Create will
- `GET /wills/my` - Get client's wills
- `GET /wills/:id` - Get will details
- `POST /wills/:id/appointments` - Schedule appointment
- `GET /wills/appointments` - Get appointments
- `PATCH /wills/:id/status` - Update will status

#### 9. Reviews Module (`ReviewsModule`)
- **Review Creation:** Create service reviews
- **Review Moderation:** Moderate reviews
- **Review Retrieval:** Get reviews for services/vendors

**Endpoints:**
- `POST /reviews` - Create review
- `GET /reviews/service/:serviceId` - Get service reviews
- `GET /reviews/vendor/:vendorId` - Get vendor reviews
- `PATCH /reviews/:id/status` - Moderate review

#### 10. Admin Module (`AdminModule`)
- **Platform Statistics:** Comprehensive platform metrics
- **Financial Statistics:** Revenue and financial data
- **User Statistics:** User growth and activity
- **Analytics:** Various analytics endpoints

**Endpoints:**
- `GET /admin/stats` - Get platform statistics
- `GET /admin/financial` - Get financial statistics
- `GET /admin/users` - Get user statistics

#### 11. Email Module (`EmailModule`)
- **Email Sending:** Send transactional emails
- **Email Templates:** Manage email templates
- **Notification System:** Send notifications

**Features:**
- Order confirmation emails
- Payment confirmation emails
- Vendor approval/rejection emails
- Service approval/rejection emails
- Will appointment notifications

---

## External Services

### 1. Keycloak (Authentication)
- **Purpose:** Identity and Access Management
- **Features:**
  - User authentication
  - Single Sign-On (SSO)
  - Multi-Factor Authentication (MFA)
  - Social login (OAuth2)
  - Token management

### 2. Stripe (Payments)
- **Purpose:** Payment processing
- **Features:**
  - Payment Intents API
  - Webhook handling
  - Refund processing
  - Escrow system
  - PCI DSS compliance

### 3. Mailgun/SendGrid (Email)
- **Purpose:** Transactional email delivery
- **Features:**
  - Email sending
  - Template system
  - Email tracking
  - Bounce handling

### 4. S3/MinIO (Storage)
- **Purpose:** File and document storage
- **Features:**
  - File uploads
  - Image hosting
  - Document storage
  - CDN integration

### 5. PostgreSQL (Database)
- **Purpose:** Primary data storage
- **Features:**
  - Relational database
  - ACID compliance
  - PostGIS extension (geolocation)
  - Connection pooling

### 6. Redis (Cache)
- **Purpose:** Caching and session storage
- **Features:**
  - API response caching
  - Session storage
  - Rate limiting
  - Pub/Sub for real-time features

---

## Service Dependencies

### Dependency Graph

```
Client App
    ↓
    ├── Backend API (All modules)
    ├── Keycloak (Auth)
    └── Stripe (Payments)

Vendor Portal
    ↓
    ├── Backend API (Vendors, Services, Orders, Wills)
    ├── Keycloak (Auth)
    └── Storage (File uploads)

Admin Portal
    ↓
    ├── Backend API (All modules)
    ├── Keycloak (Auth)
    └── Analytics Services

Backend API
    ↓
    ├── PostgreSQL (Database)
    ├── Redis (Cache)
    ├── Keycloak (Auth)
    ├── Stripe (Payments)
    ├── Mailgun (Email)
    └── S3/MinIO (Storage)
```

### Service Communication

- **Frontend ↔ Backend:** REST API (HTTPS)
- **Backend ↔ Database:** Prisma ORM (TCP)
- **Backend ↔ Keycloak:** OAuth2/OIDC (HTTPS)
- **Backend ↔ Stripe:** REST API (HTTPS)
- **Backend ↔ Email:** SMTP/API (HTTPS)
- **Backend ↔ Storage:** S3 API (HTTPS)

---

## Appendix

### Related Documents

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Architecture Documentation](docs/ARCHITECTURE_DOCUMENTATION.md)
- [API Reference](docs/API_REFERENCE.md)
- [Development Guide](docs/DEVELOPMENT.md)

---

**Last Updated:** December 7, 2025
**Maintained by:** Tech Lead

