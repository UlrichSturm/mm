# Comprehensive Testing Plan - Memento Mori Project

**Date:** December 4, 2025
**Tester:** Automated Testing Suite
**Project:** Memento Mori - Funeral Services Marketplace

---

## 1. Testing Overview

### 1.1 Objectives

- Verify all API endpoints functionality
- Test integration with external services (Keycloak, Mailgun, Stripe)
- Validate database operations and migrations
- Check email notification system
- Test authentication and authorization flows
- Verify payment processing
- Test order management system
- Validate vendor and service management

### 1.2 Testing Scope

- **Backend API (NestJS)** - All modules and endpoints
- **Database** - Prisma migrations and queries
- **External Services** - Keycloak, Mailgun, Stripe
- **Email System** - Mailgun API integration
- **Authentication** - Keycloak integration
- **Payment Processing** - Stripe integration

---

## 2. Test Categories

### 2.1 Unit Tests

- Service layer logic
- DTO validation
- Utility functions
- Error handling

### 2.2 Integration Tests

- API endpoints
- Database operations
- External service integrations
- Email sending

### 2.3 E2E Tests

- Complete user flows
- Order creation and processing
- Payment flows
- Vendor registration and approval

### 2.4 Manual API Testing

- Swagger documentation verification
- Endpoint functionality
- Request/response validation
- Error scenarios

---

## 3. Modules to Test

### 3.1 Authentication Module (`/api/auth`)

- [ ] User registration
- [ ] User login
- [ ] Profile update
- [ ] Password change
- [ ] Keycloak integration

### 3.2 Orders Module (`/api/orders`)

- [ ] Create order
- [ ] Get orders list
- [ ] Get order by ID
- [ ] Update order status
- [ ] Order status email notifications

### 3.3 Payments Module (`/api/payments`)

- [ ] Create payment
- [ ] Process payment
- [ ] Payment confirmation
- [ ] Payment failure handling
- [ ] Refund processing
- [ ] Stripe integration

### 3.4 Vendors Module (`/api/vendors`)

- [ ] Get vendors list
- [ ] Get vendor by ID
- [ ] Update vendor status
- [ ] Vendor approval email
- [ ] Vendor rejection email

### 3.5 Services Module (`/api/services`)

- [ ] Create service
- [ ] Get services list
- [ ] Get service by ID
- [ ] Update service
- [ ] Delete service
- [ ] Service search and filtering
- [ ] Service status updates

### 3.6 Categories Module (`/api/categories`)

- [ ] Get categories list
- [ ] Create category
- [ ] Update category
- [ ] Delete category

### 3.7 Admin Module (`/api/admin`)

- [ ] Get statistics
- [ ] User management
- [ ] System configuration

### 3.8 Email Module

- [ ] Welcome email
- [ ] Order confirmation email
- [ ] Order status update email
- [ ] Payment confirmation email
- [ ] Payment failed email
- [ ] Vendor approval email
- [ ] Vendor rejection email
- [ ] Service status update email
- [ ] Mailgun API integration

---

## 4. External Services Testing

### 4.1 Keycloak

- [ ] Keycloak server availability
- [ ] Token validation
- [ ] User authentication
- [ ] Role-based access control

### 4.2 Mailgun

- [ ] API key configuration
- [ ] Email sending functionality
- [ ] Template rendering
- [ ] Error handling

### 4.3 Stripe

- [ ] API key configuration
- [ ] Payment intent creation
- [ ] Webhook handling
- [ ] Refund processing

### 4.4 Database (PostgreSQL)

- [ ] Connection
- [ ] Migrations
- [ ] Queries performance
- [ ] Data integrity

---

## 5. Test Execution Plan

### Phase 1: Environment Setup

1. Verify all Docker containers are running
2. Check database connectivity
3. Verify external service configurations
4. Check environment variables

### Phase 2: Unit Tests

1. Run existing unit tests (if any)
2. Check test coverage
3. Identify missing test coverage

### Phase 3: API Integration Tests

1. Test all endpoints via Swagger UI
2. Test with curl/Postman
3. Verify request/response formats
4. Test error scenarios

### Phase 4: E2E Flow Tests

1. User registration flow
2. Order creation flow
3. Payment processing flow
4. Vendor approval flow

### Phase 5: External Service Tests

1. Keycloak integration
2. Mailgun email sending
3. Stripe payment processing

### Phase 6: Performance Tests

1. API response times
2. Database query performance
3. Concurrent request handling

---

## 6. Success Criteria

### 6.1 Functional Requirements

- ✅ All API endpoints respond correctly
- ✅ All external services are integrated properly
- ✅ Email notifications are sent successfully
- ✅ Payment processing works correctly
- ✅ Authentication and authorization function properly

### 6.2 Non-Functional Requirements

- ✅ API response time < 500ms for simple queries
- ✅ API response time < 2s for complex queries
- ✅ Error handling is proper and informative
- ✅ Logging is comprehensive

---

## 7. Test Data Requirements

### 7.1 Test Users

- Admin user
- Regular client user
- Vendor user
- Test user for registration

### 7.2 Test Data

- Sample orders
- Sample services
- Sample vendors
- Sample categories

---

## 8. Risk Areas

### 8.1 High Risk

- Payment processing (Stripe integration)
- Email delivery (Mailgun integration)
- Authentication (Keycloak integration)

### 8.2 Medium Risk

- Order status updates
- Vendor approval workflow
- Service management

### 8.3 Low Risk

- Category management
- Statistics endpoints

---

## 9. Test Execution Log

_To be filled during test execution_

---

## 10. Issues and Findings

_To be documented during testing_

---

## 11. Recommendations

_To be provided after testing completion_
