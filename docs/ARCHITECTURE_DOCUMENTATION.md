# Architecture Documentation - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** Technical Reference Document

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Architecture](#system-architecture)
3. [Application Architecture](#application-architecture)
4. [Data Architecture](#data-architecture)
5. [Security Architecture](#security-architecture)
6. [Integration Architecture](#integration-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Scalability & Performance](#scalability--performance)
9. [Technology Stack](#technology-stack)

---

## Architecture Overview

### High-Level Architecture

Memento Mori is built as a **monorepo** with a **microservices-ready architecture**, currently implemented as a modular monolith that can be split into microservices as needed.

### Architecture Principles

1. **Separation of Concerns:** Clear boundaries between frontend, backend, and infrastructure
2. **Modularity:** Independent modules that can be developed and deployed separately
3. **Scalability:** Designed to scale horizontally
4. **Security First:** Authentication, authorization, and data protection built-in
5. **API-First:** RESTful APIs with clear contracts
6. **Cloud-Native:** Designed for cloud deployment (AWS/GCP)

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                    │
├──────────────┬──────────────┬──────────────┬──────────┤
│  Client App  │ Vendor Portal│ Admin Portal │  Mobile  │
│  (Next.js)   │  (Next.js)   │  (Next.js)   │  (Future)│
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
       ┌──────────────▼──────────────┐
       │      API Gateway / Load      │
       │         Balancer             │
       └──────────────┬──────────────┘
                      │
       ┌──────────────▼──────────────┐
       │      Backend API (NestJS)    │
       │  ┌────────────────────────┐  │
       │  │  Business Logic Layer  │  │
       │  └────────────────────────┘  │
       └──────────────┬──────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐      ┌──────▼──────┐    ┌────▼────┐
│PostgreSQL│    │   Redis     │    │ Keycloak│
│ Database │    │   Cache     │    │   Auth  │
└─────────┘    └─────────────┘    └─────────┘
```

---

## System Architecture

### Monorepo Structure

```
MM/
├── apps/
│   ├── server/          # NestJS Backend API (Port 3001)
│   ├── client/          # Next.js Client App (Port 3000)
│   ├── vendor-portal/   # Next.js Vendor Portal (Port 3002)
│   └── admin-portal/    # Next.js Admin Portal (Port 3003)
├── packages/
│   └── shared/          # Shared types, utilities, components
├── docs/                # Documentation
├── scripts/             # Utility scripts
└── docker/              # Docker configurations
```

### Service Communication

**Current (Monolith):**
- All services in single NestJS application
- Internal module communication via dependency injection
- Shared database

**Future (Microservices):**
- API Gateway for routing
- Service-to-service communication via REST/gRPC
- Event-driven architecture for async operations
- Service-specific databases (if needed)

### Data Flow

```
User Request
    ↓
Frontend Application (Next.js)
    ↓
API Request (REST)
    ↓
Backend API (NestJS)
    ↓
Business Logic Layer
    ↓
Data Access Layer (Prisma)
    ↓
PostgreSQL Database
    ↓
Response
```

---

## Application Architecture

### Backend Architecture (NestJS)

#### Module Structure

```
AppModule (Root)
├── DatabaseModule (Prisma Client)
├── LoggerModule (Logging & Error Tracking)
├── AuthModule (Authentication & Authorization)
│   ├── Keycloak Integration
│   ├── JWT Strategy
│   ├── JwtAuthGuard
│   └── RolesGuard
├── VendorsModule (Vendor Management)
├── LawyerNotaryModule (Lawyer/Notary Management)
├── CategoriesModule (Category Hierarchy)
├── ServicesModule (Service Management)
│   ├── Uses: VendorsModule, EmailModule
├── OrdersModule (Order Processing)
│   ├── Uses: ServicesModule, VendorsModule, EmailModule
├── PaymentsModule (Payment Processing)
│   ├── Uses: OrdersModule, StripeService
├── ReviewsModule (Review System)
│   ├── Uses: OrdersModule, VendorsModule
├── WillsModule (Will Management)
│   ├── Uses: LawyerNotaryModule, OrdersModule
├── MemorialsModule (Memorial Pages)
│   ├── Uses: OrdersModule
├── LocationsModule (Geolocation Services)
│   ├── Uses: PostGIS
├── UsersModule (User Management)
├── AdminModule (Admin Operations)
│   ├── Uses: LoggerModule, DatabaseModule
└── EmailModule (Email Notifications)
```

#### Layer Architecture

```
Controller Layer (REST Endpoints)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access - Prisma)
    ↓
Database Layer (PostgreSQL)
```

### Frontend Architecture (Next.js)

#### Application Structure

**Client App:**
```
app/
├── (auth)/          # Authentication routes
├── (catalog)/       # Service catalog
├── (orders)/        # Order management
├── (payments)/      # Payment processing
├── (wills)/         # Will service
└── layout.tsx       # Root layout
```

**Vendor Portal:**
```
app/
├── (auth)/          # Authentication
├── (dashboard)/     # Dashboard
├── (services)/      # Service management
├── (orders)/        # Order management
├── (appointments)/  # Appointment scheduling
└── layout.tsx
```

**Admin Portal:**
```
app/
├── (auth)/          # Authentication
├── (dashboard)/     # Admin dashboard
├── (vendors)/       # Vendor moderation
├── (services)/      # Service moderation
├── (users)/         # User management
└── layout.tsx
```

#### Component Architecture

```
Pages (Route Handlers)
    ↓
Layout Components
    ↓
Feature Components
    ↓
UI Components (Reusable)
    ↓
Shared Components (packages/shared)
```

---

## Data Architecture

### Database Schema

**Primary Database:** PostgreSQL 15

#### Core Models

1. **User** - User accounts and authentication
2. **VendorProfile** - Vendor business information
3. **LawyerNotary** - Lawyer/Notary profiles
4. **Service** - Service/product catalog
5. **Category** - Service categories
6. **Order** - Customer orders
7. **Payment** - Payment transactions
8. **Review** - Service reviews
9. **Will** - Will documents
10. **Memorial** - Memorial pages

#### Relationships

```
User
├── VendorProfile (1:1)
├── LawyerNotary (1:1)
├── Orders (1:N)
└── Reviews (1:N)

VendorProfile
├── Services (1:N)
└── Orders (1:N)

Service
├── Category (N:1)
├── VendorProfile (N:1)
├── Orders (N:N via OrderItem)
└── Reviews (1:N)

Order
├── User (N:1)
├── VendorProfile (N:1)
├── OrderItems (1:N)
├── Payment (1:1)
└── Will (1:1, optional)
```

### Data Access Pattern

**ORM:** Prisma 6

- Type-safe database queries
- Automatic migrations
- Connection pooling
- Transaction support

### Caching Strategy

**Cache Layer:** Redis

- **Session storage:** User sessions
- **API response caching:** Frequently accessed data
- **Rate limiting:** Request throttling
- **Real-time features:** Pub/Sub for notifications

---

## Security Architecture

### Authentication & Authorization

**Identity Provider:** Keycloak

- **Single Sign-On (SSO):** Centralized authentication
- **Multi-Factor Authentication (MFA):** Optional 2FA
- **Social Login:** OAuth2 providers
- **Token Management:** JWT access & refresh tokens

### Authorization Model

**Role-Based Access Control (RBAC):**

- **CLIENT:** End users, can place orders
- **VENDOR:** Service providers, manage services/orders
- **LAWYER_NOTARY:** Legal professionals, handle wills
- **ADMIN:** Platform administrators, full access

### Security Layers

1. **Network Layer:**
   - HTTPS/TLS encryption
   - Firewall rules
   - DDoS protection

2. **Application Layer:**
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection
   - CSRF tokens

3. **Data Layer:**
   - Encrypted database connections
   - Sensitive data encryption at rest
   - PII protection (GDPR compliant)

4. **Payment Security:**
   - PCI DSS compliance (via Stripe)
   - Escrow system for fund protection
   - Secure payment processing

### Compliance

- **GDPR:** Data protection and privacy
- **PCI DSS:** Payment card industry standards
- **SOC 2:** Security and availability (future)

---

## Integration Architecture

### External Services

#### Payment Processing

**Stripe Integration:**
- Payment Intents API
- Webhook handlers
- Escrow system
- Refund processing

#### Email Service

**Mailgun/SendGrid:**
- Transactional emails
- Notification emails
- Template system (Handlebars)

#### Storage

**S3/MinIO:**
- File uploads
- Document storage
- Image hosting
- CDN integration

#### Authentication

**Keycloak:**
- User management
- Authentication flows
- Token issuance
- Role management

### API Integration Pattern

```
Frontend Application
    ↓
API Client (Axios/Fetch)
    ↓
Backend API (NestJS)
    ↓
External Service SDK/Client
    ↓
External Service API
```

---

## Deployment Architecture

### Development Environment

**Docker Compose:**
- PostgreSQL container
- Redis container
- Keycloak container
- MailHog container (email testing)
- All application containers

### Production Environment

**Cloud Platform:** AWS/GCP

**Architecture:**
```
Internet
    ↓
Cloud Load Balancer
    ↓
Application Servers (ECS/Kubernetes)
    ├── Backend API (NestJS)
    ├── Client App (Next.js)
    ├── Vendor Portal (Next.js)
    └── Admin Portal (Next.js)
    ↓
Managed Services
    ├── RDS PostgreSQL
    ├── ElastiCache Redis
    ├── S3/Cloud Storage
    └── Keycloak (Managed or Self-hosted)
```

### CI/CD Pipeline

**GitHub Actions:**
1. Code push triggers pipeline
2. Run tests (unit, integration)
3. Build Docker images
4. Push to container registry
5. Deploy to staging/production
6. Run smoke tests
7. Monitor deployment

---

## Scalability & Performance

### Horizontal Scaling

- **Stateless Applications:** All apps are stateless, can scale horizontally
- **Load Balancing:** Distribute traffic across instances
- **Database Scaling:** Read replicas for read-heavy operations
- **Caching:** Redis for frequently accessed data

### Performance Optimization

1. **Database:**
   - Indexes on frequently queried fields
   - Query optimization
   - Connection pooling
   - Read replicas

2. **Application:**
   - Code splitting (Next.js)
   - Lazy loading
   - API response caching
   - CDN for static assets

3. **Frontend:**
   - Server-side rendering (SSR)
   - Static site generation (SSG)
   - Image optimization
   - Code minification

### Monitoring & Observability

- **Application Monitoring:** Sentry, Datadog
- **Logging:** Centralized logging (ELK stack)
- **Metrics:** Prometheus, Grafana
- **APM:** Application Performance Monitoring
- **Uptime Monitoring:** Health checks, alerts

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **NestJS** | 10 | Framework |
| **TypeScript** | 5 | Language |
| **Prisma** | 6 | ORM |
| **PostgreSQL** | 15 | Database |
| **Redis** | 7 | Cache & sessions |
| **Keycloak** | 24 | Authentication |
| **Stripe** | Latest | Payments |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14 | Framework |
| **React** | 18 | UI library |
| **TypeScript** | 5 | Language |
| **Tailwind CSS** | 3.4 | Styling |
| **React Query** | 5 | Data fetching |
| **Zod** | 3 | Validation |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local development |
| **GitHub Actions** | CI/CD |
| **AWS/GCP** | Cloud hosting |
| **Terraform** | Infrastructure as Code (future) |

---

## Appendix

### Related Documents

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Reference](docs/API_REFERENCE.md)
- [Development Guide](docs/DEVELOPMENT.md)

### Architecture Diagrams

- [Service Architecture Diagram](docs/diagrams/service-architecture.png) (to be created)
- [Database ERD](docs/diagrams/database-erd.png) (to be created)
- [Deployment Diagram](docs/diagrams/deployment.png) (to be created)

---

**Last Updated:** December 7, 2025
**Maintained by:** Tech Lead

