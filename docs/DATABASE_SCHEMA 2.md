# Database Schema

This document describes the database schema for Memento Mori platform.

## Entity Relationship Diagram

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ id (PK)          │
│ email (unique)   │
│ password         │
│ firstName        │
│ lastName         │
│ phone            │
│ role             │
│ isBlocked        │
└────────┬─────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────┐             ┌──────────────────────┐
│  VendorProfile   │             │  LawyerNotaryProfile │
├──────────────────┤             ├──────────────────────┤
│ id (PK)          │             │ id (PK)              │
│ userId (FK)      │             │ userId (FK)          │
│ businessName     │             │ licenseNumber        │
│ contactEmail     │             │ licenseType          │
│ address          │             │ specialization       │
│ status           │             │ status               │
│ stripeAccountId  │             │ homeVisitAvailable   │
└────────┬─────────┘             └──────────────────────┘
         │
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│     Service      │◄──────│    Category      │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ vendorId (FK)    │       │ name (unique)    │
│ categoryId (FK)  │       │ slug (unique)    │
│ name             │       │ description      │
│ description      │       │ icon             │
│ price            │       │ sortOrder        │
│ status           │       │ isActive         │
└────────┬─────────┘       └──────────────────┘
         │
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│   OrderItem      │       │     Order        │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──────►│ id (PK)          │◄──── User (client)
│ orderId (FK)     │       │ orderNumber      │
│ serviceId (FK)   │       │ clientId (FK)    │
│ serviceName      │       │ subtotal         │
│ quantity         │       │ totalPrice       │
│ unitPrice        │       │ status           │
│ totalPrice       │       │ scheduledDate    │
└──────────────────┘       └────────┬─────────┘
                                    │
                                    │ 1:1
                                    ▼
                           ┌──────────────────┐
                           │    Payment       │
                           ├──────────────────┤
                           │ id (PK)          │
                           │ orderId (FK)     │
                           │ stripePaymentId  │
                           │ amount           │
                           │ status           │
                           │ platformFee      │
                           │ vendorPayout     │
                           └──────────────────┘
```

## Tables

### users

Primary table for all users (clients, vendors, admins, lawyers/notaries).

| Column     | Type      | Constraints                | Description                          |
| ---------- | --------- | -------------------------- | ------------------------------------ |
| id         | UUID      | PK                         | Primary key                          |
| email      | VARCHAR   | UNIQUE, NOT NULL           | User email                           |
| password   | VARCHAR   | NOT NULL                   | Hashed password (bcrypt)             |
| first_name | VARCHAR   |                            | First name                           |
| last_name  | VARCHAR   |                            | Last name                            |
| phone      | VARCHAR   |                            | Phone number                         |
| avatar     | VARCHAR   |                            | Avatar URL                           |
| role       | ENUM      | NOT NULL, DEFAULT 'CLIENT' | CLIENT, VENDOR, LAWYER_NOTARY, ADMIN |
| is_blocked | BOOLEAN   | DEFAULT false              | Account blocked status               |
| created_at | TIMESTAMP | DEFAULT now()              | Creation timestamp                   |
| updated_at | TIMESTAMP |                            | Last update timestamp                |

**Indexes:**

- `users_email_key` (UNIQUE) - For login lookup
- `users_role_idx` - For filtering by role

---

### vendor_profiles

Extended profile for vendors.

| Column            | Type      | Constraints        | Description                            |
| ----------------- | --------- | ------------------ | -------------------------------------- |
| id                | UUID      | PK                 | Primary key                            |
| user_id           | UUID      | FK → users, UNIQUE | Reference to user                      |
| business_name     | VARCHAR   | NOT NULL           | Company name                           |
| description       | TEXT      |                    | Business description                   |
| contact_email     | VARCHAR   | NOT NULL           | Business email                         |
| contact_phone     | VARCHAR   |                    | Business phone                         |
| website           | VARCHAR   |                    | Website URL                            |
| address           | VARCHAR   |                    | Street address                         |
| city              | VARCHAR   |                    | City                                   |
| postal_code       | VARCHAR   |                    | Postal code                            |
| country           | VARCHAR   | DEFAULT 'DE'       | Country code                           |
| latitude          | FLOAT     |                    | Geo latitude                           |
| longitude         | FLOAT     |                    | Geo longitude                          |
| status            | ENUM      | DEFAULT 'PENDING'  | PENDING, APPROVED, REJECTED, SUSPENDED |
| rejection_reason  | TEXT      |                    | Reason if rejected                     |
| verified_at       | TIMESTAMP |                    | Verification timestamp                 |
| stripe_account_id | VARCHAR   | UNIQUE             | Stripe Connect account                 |
| stripe_onboarded  | BOOLEAN   | DEFAULT false      | Stripe onboarding complete             |
| rating            | FLOAT     | DEFAULT 0          | Average rating                         |
| review_count      | INT       | DEFAULT 0          | Number of reviews                      |
| created_at        | TIMESTAMP | DEFAULT now()      | Creation timestamp                     |
| updated_at        | TIMESTAMP |                    | Last update timestamp                  |

**Indexes:**

- `vendor_profiles_user_id_key` (UNIQUE)
- `vendor_profiles_stripe_account_id_key` (UNIQUE)
- `vendor_profiles_status_idx`
- `vendor_profiles_postal_code_idx`
- `vendor_profiles_city_idx`

---

### lawyer_notary_profiles

Profile for lawyers and notaries.

| Column               | Type      | Constraints        | Description                            |
| -------------------- | --------- | ------------------ | -------------------------------------- |
| id                   | UUID      | PK                 | Primary key                            |
| user_id              | UUID      | FK → users, UNIQUE | Reference to user                      |
| license_number       | VARCHAR   | NOT NULL           | Professional license                   |
| license_type         | ENUM      | NOT NULL           | LAWYER, NOTARY, BOTH                   |
| organization_name    | VARCHAR   |                    | Firm name                              |
| specialization       | VARCHAR   |                    | Area of expertise                      |
| years_of_experience  | INT       |                    | Experience in years                    |
| address              | VARCHAR   |                    | Office address                         |
| postal_code          | VARCHAR   |                    | Postal code                            |
| city                 | VARCHAR   |                    | City                                   |
| country              | VARCHAR   | DEFAULT 'DE'       | Country code                           |
| home_visit_available | BOOLEAN   | DEFAULT false      | Offers home visits                     |
| max_travel_radius    | INT       |                    | Max travel distance (km)               |
| status               | ENUM      | DEFAULT 'PENDING'  | PENDING, APPROVED, REJECTED, SUSPENDED |
| rejection_reason     | TEXT      |                    | Reason if rejected                     |
| verified_at          | TIMESTAMP |                    | Verification timestamp                 |
| rating               | FLOAT     | DEFAULT 0          | Average rating                         |
| review_count         | INT       | DEFAULT 0          | Number of reviews                      |
| created_at           | TIMESTAMP | DEFAULT now()      | Creation timestamp                     |
| updated_at           | TIMESTAMP |                    | Last update timestamp                  |

**Indexes:**

- `lawyer_notary_profiles_user_id_key` (UNIQUE)
- `lawyer_notary_profiles_status_idx`
- `lawyer_notary_profiles_license_type_idx`
- `lawyer_notary_profiles_postal_code_idx`

---

### categories

Service categories.

| Column      | Type      | Constraints      | Description           |
| ----------- | --------- | ---------------- | --------------------- |
| id          | UUID      | PK               | Primary key           |
| name        | VARCHAR   | UNIQUE, NOT NULL | Category name         |
| slug        | VARCHAR   | UNIQUE, NOT NULL | URL-friendly name     |
| description | TEXT      |                  | Category description  |
| icon        | VARCHAR   |                  | Icon name/URL         |
| sort_order  | INT       | DEFAULT 0        | Display order         |
| is_active   | BOOLEAN   | DEFAULT true     | Active status         |
| created_at  | TIMESTAMP | DEFAULT now()    | Creation timestamp    |
| updated_at  | TIMESTAMP |                  | Last update timestamp |

**Indexes:**

- `categories_name_key` (UNIQUE)
- `categories_slug_key` (UNIQUE)
- `categories_is_active_idx`

---

### services

Services offered by vendors.

| Column      | Type          | Constraints                    | Description                               |
| ----------- | ------------- | ------------------------------ | ----------------------------------------- |
| id          | UUID          | PK                             | Primary key                               |
| vendor_id   | UUID          | FK → vendor_profiles, NOT NULL | Vendor reference                          |
| category_id | UUID          | FK → categories                | Category reference                        |
| name        | VARCHAR       | NOT NULL                       | Service name                              |
| description | TEXT          | NOT NULL                       | Service description                       |
| price       | DECIMAL(10,2) | NOT NULL                       | Price                                     |
| currency    | VARCHAR       | DEFAULT 'EUR'                  | Currency code                             |
| images      | TEXT[]        |                                | Array of image URLs                       |
| duration    | INT           |                                | Duration in minutes                       |
| status      | ENUM          | DEFAULT 'ACTIVE'               | ACTIVE, INACTIVE, PENDING_REVIEW, DELETED |
| created_at  | TIMESTAMP     | DEFAULT now()                  | Creation timestamp                        |
| updated_at  | TIMESTAMP     |                                | Last update timestamp                     |

**Indexes:**

- `services_vendor_id_idx`
- `services_category_id_idx`
- `services_status_idx`
- `services_price_idx`
- `services_created_at_idx`

---

### orders

Customer orders.

| Column         | Type          | Constraints          | Description                                                     |
| -------------- | ------------- | -------------------- | --------------------------------------------------------------- |
| id             | UUID          | PK                   | Primary key                                                     |
| order_number   | VARCHAR       | UNIQUE, NOT NULL     | Human-readable number (MM-YYYYMMDD-XXXX)                        |
| client_id      | UUID          | FK → users, NOT NULL | Client reference                                                |
| subtotal       | DECIMAL(10,2) | NOT NULL             | Subtotal before tax                                             |
| tax            | DECIMAL(10,2) | DEFAULT 0            | Tax amount                                                      |
| total_price    | DECIMAL(10,2) | NOT NULL             | Total price                                                     |
| currency       | VARCHAR       | DEFAULT 'EUR'        | Currency code                                                   |
| notes          | TEXT          |                      | Order notes                                                     |
| scheduled_date | TIMESTAMP     |                      | Scheduled date/time                                             |
| status         | ENUM          | DEFAULT 'PENDING'    | PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REFUNDED |
| completed_at   | TIMESTAMP     |                      | Completion timestamp                                            |
| cancelled_at   | TIMESTAMP     |                      | Cancellation timestamp                                          |
| created_at     | TIMESTAMP     | DEFAULT now()        | Creation timestamp                                              |
| updated_at     | TIMESTAMP     |                      | Last update timestamp                                           |

**Indexes:**

- `orders_order_number_key` (UNIQUE)
- `orders_client_id_idx`
- `orders_status_idx`
- `orders_created_at_idx`

---

### order_items

Individual items in an order.

| Column        | Type          | Constraints             | Description               |
| ------------- | ------------- | ----------------------- | ------------------------- |
| id            | UUID          | PK                      | Primary key               |
| order_id      | UUID          | FK → orders, NOT NULL   | Order reference           |
| service_id    | UUID          | FK → services, NOT NULL | Service reference         |
| service_name  | VARCHAR       | NOT NULL                | Snapshot of service name  |
| service_price | DECIMAL(10,2) | NOT NULL                | Snapshot of service price |
| quantity      | INT           | DEFAULT 1               | Quantity                  |
| unit_price    | DECIMAL(10,2) | NOT NULL                | Price per unit            |
| total_price   | DECIMAL(10,2) | NOT NULL                | Line total                |
| notes         | TEXT          |                         | Item notes                |
| created_at    | TIMESTAMP     | DEFAULT now()           | Creation timestamp        |

**Indexes:**

- `order_items_order_id_idx`
- `order_items_service_id_idx`

---

### payments

Payment records linked to orders.

| Column                   | Type          | Constraints                   | Description                                                          |
| ------------------------ | ------------- | ----------------------------- | -------------------------------------------------------------------- |
| id                       | UUID          | PK                            | Primary key                                                          |
| order_id                 | UUID          | FK → orders, UNIQUE, NOT NULL | Order reference (1:1)                                                |
| stripe_payment_intent_id | VARCHAR       | UNIQUE                        | Stripe PaymentIntent ID                                              |
| stripe_charge_id         | VARCHAR       |                               | Stripe Charge ID                                                     |
| amount                   | DECIMAL(10,2) | NOT NULL                      | Payment amount                                                       |
| currency                 | VARCHAR       | DEFAULT 'EUR'                 | Currency code                                                        |
| platform_fee             | DECIMAL(10,2) | DEFAULT 0                     | Platform commission                                                  |
| stripe_fee               | DECIMAL(10,2) | DEFAULT 0                     | Stripe processing fee                                                |
| vendor_payout            | DECIMAL(10,2) | DEFAULT 0                     | Amount to vendor                                                     |
| status                   | ENUM          | DEFAULT 'PENDING'             | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| paid_at                  | TIMESTAMP     |                               | Payment timestamp                                                    |
| refunded_at              | TIMESTAMP     |                               | Refund timestamp                                                     |
| created_at               | TIMESTAMP     | DEFAULT now()                 | Creation timestamp                                                   |
| updated_at               | TIMESTAMP     |                               | Last update timestamp                                                |

**Indexes:**

- `payments_order_id_key` (UNIQUE)
- `payments_stripe_payment_intent_id_key` (UNIQUE)
- `payments_status_idx`

---

## Enums

### Role

- `CLIENT` - Regular customer
- `VENDOR` - Service provider
- `LAWYER_NOTARY` - Legal professional
- `ADMIN` - Platform administrator

### VendorStatus / LawyerNotaryStatus

- `PENDING` - Awaiting approval
- `APPROVED` - Verified and active
- `REJECTED` - Application rejected
- `SUSPENDED` - Temporarily suspended

### LicenseType

- `LAWYER` - Licensed lawyer
- `NOTARY` - Licensed notary
- `BOTH` - Both licenses

### ServiceStatus

- `ACTIVE` - Available for purchase
- `INACTIVE` - Hidden from catalog
- `PENDING_REVIEW` - Awaiting moderation
- `DELETED` - Soft deleted

### OrderStatus

- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed by vendor
- `IN_PROGRESS` - Being fulfilled
- `COMPLETED` - Successfully completed
- `CANCELLED` - Cancelled by client/vendor
- `REFUNDED` - Payment refunded

### PaymentStatus

- `PENDING` - Awaiting payment
- `PROCESSING` - Payment in progress
- `COMPLETED` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Fully refunded
- `PARTIALLY_REFUNDED` - Partially refunded

---

## Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration (development)
npm run db:migrate:dev

# Apply migrations (production)
npm run db:migrate

# Push schema without migration
npm run db:push

# Seed database
npm run db:seed

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

---

**Last updated:** December 2025
