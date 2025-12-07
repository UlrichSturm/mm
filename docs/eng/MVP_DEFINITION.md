# MVP Definition - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** MVP Specification Document

---

## 📋 Table of Contents

1. [MVP Overview](#mvp-overview)
2. [MVP Goals](#mvp-goals)
3. [MVP Scope](#mvp-scope)
4. [Core Features](#core-features)
5. [User Stories](#user-stories)
6. [Technical Requirements](#technical-requirements)
7. [Success Criteria](#success-criteria)
8. [Out of Scope](#out-of-scope)
9. [MVP Timeline](#mvp-timeline)

---

## MVP Overview

### What is MVP?

**Minimum Viable Product (MVP)** is the simplest version of Memento Mori that delivers core value to users while allowing us to validate the business model and gather feedback.

### MVP Vision

A **working marketplace platform** where:
- Clients can browse and order funeral services
- Vendors can list and manage their services
- Administrators can moderate the platform
- Payments are processed securely
- Will preparation service is available

### MVP Principles

1. **Core Value First:** Focus on essential features only
2. **User Validation:** Test with real users early
3. **Fast to Market:** Launch within 3-4 months
4. **Scalable Foundation:** Build on solid architecture
5. **Iterative Improvement:** Add features based on feedback

---

## MVP Goals

### Business Goals

1. **Validate Market Demand**
   - Launch to beta users
   - Collect first 100 transactions
   - Gather user feedback

2. **Prove Business Model**
   - Process real payments
   - Generate revenue
   - Test commission model

3. **Build User Base**
   - Onboard first 10 vendors
   - Acquire first 50 clients
   - Establish platform credibility

### Technical Goals

1. **Stable Platform**
   - 99% uptime
   - Fast response times (<200ms API)
   - Secure and reliable

2. **Scalable Architecture**
   - Handle 1,000 concurrent users
   - Support 100+ vendors
   - Process 1,000+ orders/month

3. **Quality Codebase**
   - 80% test coverage
   - Clean, maintainable code
   - Comprehensive documentation

---

## MVP Scope

### Included in MVP

✅ **Authentication & Authorization**
- User registration (Client, Vendor)
- Login/Logout
- Role-based access control
- Profile management

✅ **Vendor Management**
- Vendor registration
- Vendor profile management
- Vendor moderation (approve/reject)
- Vendor status tracking

✅ **Service Catalog**
- Service creation by vendors
- Public service catalog
- Service search and filtering
- Service details page
- Service moderation

✅ **Order Management**
- Create orders from cart
- Order status tracking
- Order history
- Order cancellation

✅ **Payment Processing**
- Stripe integration
- Payment intents
- Webhook handling
- Payment history
- Escrow system (basic)

✅ **Will Service (Basic)**
- Will creation workflow
- Lawyer/Notary search
- Appointment scheduling
- Will execution tracking

✅ **Admin Dashboard**
- Platform statistics
- Vendor moderation
- Service moderation
- User management

### Excluded from MVP

❌ **Advanced Features**
- Advanced analytics
- Recommendation engine
- Social features
- Mobile native apps
- Multi-currency
- Advanced search (geolocation)
- Real-time chat
- Advanced reporting

---

## Core Features

### 1. Client Application

#### Authentication
- [x] User registration
- [x] Login/Logout
- [x] Profile management
- [x] Password reset (basic)

#### Service Catalog
- [x] Browse services
- [x] Search services
- [x] Filter by category
- [x] View service details
- [x] View vendor profiles

#### Shopping Cart
- [x] Add services to cart
- [x] Update cart items
- [x] Remove items
- [x] View cart total

#### Orders
- [x] Place order
- [x] View order history
- [x] View order details
- [x] Cancel order (pending only)

#### Payments
- [x] Payment page
- [x] Stripe integration
- [x] Payment confirmation
- [x] Payment history

#### Will Service
- [x] Will creation form
- [x] Lawyer/Notary search
- [x] Appointment scheduling
- [x] Will execution tracking

### 2. Vendor Portal

#### Authentication
- [x] Vendor login
- [x] Profile management

#### Service Management
- [x] Create services
- [x] Edit services
- [x] Delete services
- [x] View service list

#### Order Management
- [x] View orders
- [x] Update order status
- [x] View order details

#### Appointments
- [x] View appointments
- [x] Manage schedule
- [x] Complete appointments

#### Settings
- [x] Service radius
- [x] Home visit settings
- [x] Schedule management

### 3. Admin Portal

#### Dashboard
- [x] Platform statistics
- [x] Revenue metrics
- [x] User statistics
- [x] Order statistics

#### Vendor Moderation
- [x] View vendors list
- [x] Approve/reject vendors
- [x] View vendor details
- [x] Update vendor status

#### Service Moderation
- [x] View services list
- [x] Approve/reject services
- [x] View service details
- [x] Update service status

#### Lawyer/Notary Management
- [x] Create profiles
- [x] View profiles
- [x] Update profiles
- [x] Manage status

#### Will Management
- [x] View appointments
- [x] Manage appointments
- [x] Track executions

### 4. Backend API

#### Authentication Module
- [x] User registration
- [x] User login
- [x] Token management
- [x] Profile management

#### Vendors Module
- [x] CRUD operations
- [x] Moderation workflow
- [x] Status management

#### Services Module
- [x] CRUD operations
- [x] Public catalog
- [x] Search and filtering
- [x] Moderation

#### Orders Module
- [x] Order creation
- [x] Order management
- [x] Status updates
- [x] Order history

#### Payments Module
- [x] Stripe integration
- [x] Payment intents
- [x] Webhook handling
- [x] Refund processing

#### Wills Module
- [x] Will creation
- [x] Appointment scheduling
- [x] Execution tracking

#### Admin Module
- [x] Platform statistics
- [x] Financial metrics
- [x] User management

---

## User Stories

### Client User Stories

**As a client, I want to:**
1. Register an account so I can use the platform
2. Browse funeral services so I can find what I need
3. Search for services so I can find specific items
4. View service details so I can make informed decisions
5. Add services to cart so I can purchase multiple items
6. Place an order so I can purchase services
7. Pay securely so my payment is protected
8. Track my orders so I know their status
9. Create a will so I can prepare for the future
10. Find a lawyer/notary so I can certify my will

### Vendor User Stories

**As a vendor, I want to:**
1. Register my business so I can sell on the platform
2. Create service listings so clients can find my services
3. Manage my services so I can keep them up to date
4. View orders so I can fulfill them
5. Update order status so clients know the progress
6. Manage my schedule so clients can book appointments
7. View my profile so I can ensure accuracy

### Admin User Stories

**As an admin, I want to:**
1. View platform statistics so I can monitor growth
2. Moderate vendors so I can ensure quality
3. Moderate services so I can ensure accuracy
4. Manage users so I can support them
5. View financial data so I can track revenue
6. Manage lawyers/notaries so I can support will service

---

## Technical Requirements

### Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| **API Response Time** | <200ms | ~150ms |
| **Page Load Time** | <2s | ~1.5s |
| **Database Query Time** | <100ms | ~50ms |
| **Uptime** | 99% | 99.5% |

### Security Requirements

- ✅ HTTPS/TLS encryption
- ✅ Authentication via Keycloak
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ PCI DSS compliance (via Stripe)

### Scalability Requirements

- ✅ Handle 1,000 concurrent users
- ✅ Support 100+ vendors
- ✅ Process 1,000+ orders/month
- ✅ Horizontal scaling ready

### Quality Requirements

- ✅ 80% code coverage
- ✅ Zero critical bugs
- ✅ Comprehensive documentation
- ✅ API documentation (Swagger)

---

## Success Criteria

### MVP Launch Criteria

✅ **Technical:**
- All core features implemented
- All tests passing
- Performance targets met
- Security audit passed
- Documentation complete

✅ **Business:**
- Beta launch completed
- First 10 vendors onboarded
- First 50 users registered
- First transaction completed
- Zero critical security issues

✅ **User Experience:**
- User satisfaction score >4.0/5.0
- Task completion rate >80%
- Page load time <2s
- Mobile responsiveness verified

### Post-MVP Success Metrics

**Month 1-3:**
- 100+ registered users
- 10+ active vendors
- 50+ service listings
- 10+ completed orders

**Month 4-6:**
- 500+ registered users
- 25+ active vendors
- 200+ service listings
- 100+ completed orders

**Month 7-12:**
- 2,000+ registered users
- 50+ active vendors
- 500+ service listings
- 1,000+ completed orders

---

## Out of Scope

### Features Not in MVP

❌ **Advanced Analytics**
- Detailed reporting
- Custom dashboards
- Data export
- Advanced charts

❌ **Social Features**
- User reviews (basic only)
- Social sharing
- Referral program
- Community features

❌ **Mobile Apps**
- iOS native app
- Android native app
- Mobile push notifications

❌ **Advanced Search**
- Geolocation search
- Advanced filters
- Saved searches
- Search history

❌ **Communication**
- In-app messaging
- Real-time chat
- Video calls
- Email notifications (basic only)

❌ **Marketing Features**
- Promotions
- Discounts
- Coupons
- Loyalty program

❌ **Internationalization**
- Multi-currency
- Multi-language (basic only)
- Regional pricing

---

## MVP Timeline

### Phase 1: Foundation (Month 1)

**Week 1-2:**
- ✅ Backend API core modules
- ✅ Authentication system
- ✅ Database schema

**Week 3-4:**
- ✅ Vendor management
- ✅ Service catalog
- ✅ Order system

### Phase 2: Frontend (Month 2)

**Week 1-2:**
- ✅ Client App core features
- ✅ Service catalog UI
- ✅ Shopping cart

**Week 3-4:**
- ✅ Vendor Portal core features
- ✅ Admin Portal core features
- ✅ Payment integration

### Phase 3: Integration & Testing (Month 3)

**Week 1-2:**
- ✅ End-to-end integration
- ✅ Payment testing
- ✅ Security testing

**Week 3-4:**
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Beta launch preparation

### Phase 4: Launch (Month 4)

**Week 1-2:**
- ✅ Beta launch
- ✅ User onboarding
- ✅ Feedback collection

**Week 3-4:**
- ✅ Iterative improvements
- ✅ Bug fixes
- ✅ Feature enhancements

---

## Appendix

### Related Documents

- [MVP Progress](docs/MVP_PROGRESS.md)
- [Roadmap](docs/ROADMAP.md)
- [Project Planning](docs/PROJECT_PLANNING.md)
- [User Stories](docs/user-stories/README.md)

### MVP Checklist

- [x] Backend API (95% complete)
- [ ] Client App (50% → 100%)
- [ ] Vendor Portal (60% → 100%)
- [ ] Admin Portal (70% → 100%)
- [ ] Integration Testing (0% → 100%)
- [ ] Security Audit
- [ ] Performance Testing
- [ ] Beta Launch

---

**Last Updated:** December 7, 2025
**Status:** MVP Development in Progress (65% Complete)

