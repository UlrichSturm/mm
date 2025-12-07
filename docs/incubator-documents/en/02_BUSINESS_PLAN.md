# Business Plan - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** Complete Business Plan
**Language:** English
**Pages:** 25-30

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Company Description](#company-description)
3. [Product/Service Description](#productservice-description)
4. [Market Analysis](#market-analysis)
5. [Competitive Analysis](#competitive-analysis)
6. [Marketing Strategy](#marketing-strategy)
7. [Operational Plan](#operational-plan)
8. [Management and Team](#management-and-team)
9. [Financial Plan](#financial-plan)
10. [Risk Analysis](#risk-analysis)
11. [Appendices](#appendices)

---

## Executive Summary

### Company Overview

**Memento Mori** is a comprehensive marketplace platform connecting clients with verified funeral service providers, while also offering free will preparation services. We solve the critical problem of organizing funeral services during times of grief, including limited choice of products and services, by providing transparency, security, and convenience in one unified platform.

### Mission Statement

To provide families with a trusted, transparent, and secure platform for organizing funeral services and managing end-of-life planning, reducing stress during difficult times.

### Vision Statement

To become the leading digital platform for funeral services in Europe and North America, transforming how people access and organize end-of-life services.

### Key Highlights

- **Market Size:** €50-70B annual market (Europe & USA)
- **Unique Value:** Only platform combining funeral services + will preparation
- **Revenue Model:** 10-20% commission on transactions
- **Target:** €20-30M revenue by Year 3
- **Funding Request:** €1-2M Seed Round

### Financial Summary

| Metric       | Year 1      | Year 2        | Year 3        |
| ------------ | ----------- | ------------- | ------------- |
| Revenue      | €2-4M       | €12-21M       | €40-60M       |
| Transactions | 4,000-6,000 | 15,000-25,000 | 40,000-60,000 |
| Break-even   | Month 10-12 | -             | -             |
| Team Size    | 7-10        | 12-15         | 20-25         |

---

## Company Description

### Legal Structure

- **Company Name:** Memento Mori GmbH (or LLC)
- **Location:** Dresden, Germany
- **Registration:** [To be completed]
- **Industry:** Funeral Services / Marketplace / Legal Services

### Company History

**Founded:** 2025
**Stage:** Pre-seed / Seed
**Status:** MVP in development (65% complete)

### Business Model

**Two-sided Marketplace:**

- **Supply Side:** Funeral service providers, product vendors, lawyers/notaries
- **Demand Side:** Families organizing funerals, individuals planning wills

**Revenue Streams:**

1. Transaction commission (10-20%)
2. Premium vendor subscriptions (future)
3. Legal service partnerships (revenue share)

### Value Proposition

**For Clients:**

- One platform for all funeral needs
- Transparent pricing and reviews
- Secure escrow payments
- Free will preparation service
- Verified vendor network

**For Vendors:**

- Access to new customers
- Marketing and visibility
- Secure payment processing
- Business management tools
- Reduced administrative burden

**For Lawyers/Notaries:**

- Client acquisition
- Platform covers service costs
- Appointment scheduling
- Document management

---

## Product/Service Description

### Core Platform Features

#### 1. Funeral Services Marketplace

**Service Categories:**

- Funeral homes and crematoriums
- Caskets and urns
- Flowers and decorations
- Monuments and headstones
- Transportation services
- Catering services

**Key Features:**

- Geographic search (PostGIS)
- Price comparison
- Vendor profiles with reviews
- Service catalog browsing
- Shopping cart functionality
- Order management

#### 2. Will Preparation Service

**Unique Value Proposition:**

- Free will preparation when funeral rights are transferred
- Lawyer/Notary matching by location
- Appointment scheduling
- Document management
- Secure storage

#### 3. Payment System

**Escrow Payment Model:**

- Funds held securely until service completion
- Automatic release upon confirmation
- Dispute resolution mechanism
- Fraud protection

#### 4. Vendor Verification

**Verification Process:**

- Business license verification
- Background checks
- Manual moderation
- Ongoing compliance monitoring

### Technology Stack

**Backend:**

- NestJS 10 (Node.js framework)
- PostgreSQL 15 (database)
- Prisma 6 (ORM)
- Redis (caching)
- Keycloak (authentication)
- Stripe (payments)

**Frontend:**

- Next.js 14 (React framework)
- TypeScript 5
- Tailwind CSS 3.4
- React Query (data fetching)

**Infrastructure:**

- Docker & Docker Compose
- CI/CD pipelines
- Cloud hosting (AWS/GCP)
- Monitoring and logging

### Platform Architecture

**Multi-Portal System:**

1. **Client App** - For end users
2. **Vendor Portal** - For service providers
3. **Admin Portal** - For platform management

**Key Integrations:**

- Stripe (payment processing)
- Keycloak (authentication)
- Email services (notifications)
- Geographic services (PostGIS)

---

## Market Analysis

### Market Size

**Total Addressable Market (TAM):**

- Europe: €30-40B annually
- USA: €20-30B annually
- **Total: €50-70B per year**

**Serviceable Addressable Market (SAM):**

- Digital funeral services: €5-7B annually
- Growing at 8-12% CAGR
- Early market with low competition

**Serviceable Obtainable Market (SOM):**

- Year 1: €500K - €1M (0.01% of SAM)
- Year 3: €20-30M (0.4-0.6% of SAM)
- Year 5: €100-150M (2-3% of SAM)

### Market Trends

1. **Digital Transformation**
   - Increasing acceptance of online services
   - Growing comfort with digital transactions
   - Mobile-first consumer behavior

2. **Transparency Demand**
   - Consumers want price transparency
   - Review and rating systems expected
   - Trust and verification important

3. **Regulatory Support**
   - GDPR compliance requirements
   - Consumer protection regulations
   - Digital service standards

4. **Demographic Changes**
   - Aging population
   - Tech-savvy younger generations
   - Urbanization trends

### Target Market

**Primary Markets:**

- Germany (initial focus)
- Austria
- Switzerland

**Secondary Markets:**

- UK
- France
- Netherlands

**Future Markets:**

- USA
- Canada
- Other European countries

### Customer Segments

1. **Primary Users (Clients)**
   - Age: 40-70
   - Income: Middle to upper-middle class
   - Tech-savvy
   - Value transparency and convenience

2. **Vendors**
   - Funeral homes
   - Product manufacturers
   - Service providers
   - Lawyers/Notaries

---

## Competitive Analysis

### Direct Competitors

**Limited direct competition** - No dominant platform exists

**Potential Competitors:**

- Traditional funeral homes (offline)
- Individual service providers
- Regional platforms (if any)

### Competitive Advantages

1. **First-Mover Advantage**
   - Early market entry
   - Opportunity to establish brand
   - Network effects

2. **Unique Service Combination**
   - Only platform combining funeral services + will preparation
   - Free legal services as differentiator
   - Comprehensive solution

3. **Technology and Security**
   - Modern, scalable platform
   - Secure escrow payment system
   - Vendor verification system
   - Mobile-responsive design

4. **Trust and Transparency**
   - Verified vendor network
   - Transparent pricing
   - Review and rating system
   - Consumer protection

5. **Network Effects**
   - More vendors = more clients
   - More clients = more vendors
   - Self-reinforcing growth

### Barriers to Entry

- Vendor network (hard to replicate)
- Trust and brand recognition
- Technology infrastructure
- Regulatory compliance
- Network effects

### Competitive Strategy

1. **Focus on Trust**
   - Vendor verification
   - Secure payments
   - Transparent reviews

2. **Unique Value Proposition**
   - Free will preparation
   - Comprehensive service

3. **Fast Execution**
   - Rapid product development
   - Quick market entry
   - Agile approach

4. **Network Building**
   - Vendor acquisition
   - Client acquisition
   - Partnership development

---

## Marketing Strategy

### Marketing Objectives

1. **Year 1:**
   - Acquire 100 vendors
   - Acquire 1,000 clients
   - Process 4,000-6,000 transactions
   - Build brand awareness

2. **Year 2:**
   - Expand to 500 vendors
   - Acquire 10,000 clients
   - Process 15,000-25,000 transactions
   - Establish market leadership

3. **Year 3:**
   - Expand to 1,500 vendors
   - Acquire 50,000 clients
   - Process 40,000-60,000 transactions
   - International expansion

### Marketing Channels

#### 1. Digital Marketing

**Search Engine Optimization (SEO):**

- Content marketing
- Blog posts
- Local SEO
- Keyword optimization

**Pay-Per-Click (PPC):**

- Google Ads
- Facebook/Instagram Ads
- LinkedIn Ads
- Retargeting campaigns

**Content Marketing:**

- Educational content
- Blog articles
- Social media
- Email newsletters

#### 2. Partnerships

**Strategic Partnerships:**

- Hospitals and hospices
- Insurance companies
- Legal service providers
- Funeral industry associations

**Referral Programs:**

- Vendor referrals
- Client referrals
- Partner referrals

#### 3. Public Relations

**PR Activities:**

- Press releases
- Media interviews
- Industry publications
- Awards and recognition

#### 4. Events and Conferences

**Industry Events:**

- Funeral industry conferences
- Legal services events
- Startup events
- Networking events

### Pricing Strategy

**Commission Structure:**

- Services: 10-20% commission
- Products: 10-15% commission
- Legal services: Revenue share model

**Vendor Incentives:**

- Early adopter discounts
- Volume discounts
- Referral bonuses

**Client Incentives:**

- Free will preparation
- Transparent pricing
- Secure payments
- Quality guarantee

### Brand Positioning

**Brand Values:**

- Trust
- Transparency
- Compassion
- Innovation

**Brand Message:**
"Your trusted partner in organizing funeral services and end-of-life planning"

**Target Audience:**

- Families organizing funerals
- Individuals planning wills
- Funeral service providers
- Legal professionals

---

## Operational Plan

### Operations Overview

**Core Operations:**

1. Vendor onboarding and verification
2. Client acquisition and support
3. Transaction processing
4. Payment management
5. Customer support
6. Quality assurance

### Vendor Management

**Onboarding Process:**

1. Application submission
2. Business verification
3. Background checks
4. Profile setup
5. Training and support

**Ongoing Management:**

- Performance monitoring
- Review management
- Compliance checks
- Support and assistance

### Client Support

**Support Channels:**

- Email support
- Phone support (future)
- In-app chat (future)
- Help center
- FAQ section

**Support Hours:**

- Business hours: 9 AM - 6 PM
- Emergency support: 24/7 (future)

### Quality Assurance

**Quality Measures:**

- Vendor verification
- Service reviews
- Client feedback
- Performance monitoring
- Dispute resolution

### Technology Operations

**Infrastructure:**

- Cloud hosting (AWS/GCP)
- Database management
- CDN and caching
- Monitoring and alerts
- Backup and recovery

**Security:**

- Data encryption
- Secure payments
- Access controls
- Compliance (GDPR, PCI DSS)

### Scalability Plan

**Phase 1 (Year 1):**

- Single region (Germany)
- 100 vendors
- 1,000-5,000 clients

**Phase 2 (Year 2):**

- Multiple regions
- 500 vendors
- 10,000-25,000 clients

**Phase 3 (Year 3):**

- International expansion
- 1,500+ vendors
- 50,000+ clients

---

## Management and Team

### Current Team

**Core Team:**

- Tech Lead / Founder
- Backend Developer
- Frontend Developer

**Advisory Board:**

- [To be filled]
- Industry experts
- Legal advisors
- Financial advisors

### Organizational Structure

**Planned Structure (Year 1):**

- CEO/Founder
- CTO
- COO
- Development Team (5-7 people)
- Marketing Team (2-3 people)
- Operations Team (2-3 people)
- Customer Support (1-2 people)

### Hiring Plan

**Immediate (Months 1-3):**

- 2 Backend Developers
- 2 Frontend Developers
- 1 QA Engineer
- 1 Product Manager

**Short-term (Months 4-6):**

- 1 Marketing Lead
- 1 Customer Support Manager
- 1 Operations Manager

**Medium-term (Months 7-12):**

- Additional developers
- Sales team
- Customer support team
- Marketing team expansion

### Key Roles and Responsibilities

**CEO/Founder:**

- Strategic direction
- Fundraising
- Business development
- Investor relations

**CTO:**

- Technology strategy
- Product development
- Engineering team management
- Technical architecture

**COO:**

- Operations management
- Vendor relations
- Customer support
- Process optimization

### Advisory Board

**Planned Advisors:**

- Funeral industry expert
- Legal services expert
- Marketplace platform expert
- Financial/Investment expert

---

## Financial Plan

### Financial Overview

**Seed Round:** €1-2M
**Use of Funds:**

- MVP Development: 40%
- Marketing: 30%
- Team: 20%
- Operations: 10%

### Revenue Projections

**Year 1:**

- Revenue: €2-4M
- Transactions: 4,000-6,000
- Average transaction: €5,500
- Commission rate: 12-13%

**Year 2:**

- Revenue: €12-21M
- Transactions: 15,000-25,000
- Average transaction: €6,000
- Commission rate: 14-15%

**Year 3:**

- Revenue: €40-60M
- Transactions: 40,000-60,000
- Average transaction: €6,500
- Commission rate: 16-17%

### Cost Structure

**Fixed Costs (Annual):**

- Team salaries: €600K
- Infrastructure: €38K
- Software licenses: €6K
- Office/Remote: €24K
- Legal & Compliance: €12K
- Insurance: €6K
- **Total Fixed: €686K**

**Variable Costs:**

- Payment processing: 2.9% + €0.25 per transaction
- Marketing: 20-30% of revenue
- Customer support: 2-3% of revenue
- Vendor incentives: 1-2% of revenue

### Break-even Analysis

**Break-even Point:** Month 10-12
**Break-even Revenue:** ~€1.5M annually
**Break-even Transactions:** ~2,500-3,000 per year

### Funding Requirements

**Seed Round: €1-2M**

- MVP Development: €400-600K
- Marketing: €300-500K
- Team: €200-400K
- Infrastructure: €50-100K
- Reserve: €50-400K

**Series A (Month 18):**

- Target: €5-10M
- Use: International expansion, scaling

### Financial Assumptions

- Average transaction value: €5,500-7,700
- Commission rate: 10-20%
- Market penetration: 0.1% → 0.5% → 1.0%
- Conversion rate: 2-5%
- Customer acquisition cost: €50-100
- Lifetime value: €1,100-3,080

---

## Risk Analysis

### Market Risks

**Risk:** Slow market adoption
**Probability:** Medium
**Impact:** High
**Mitigation:**

- Strong marketing campaigns
- Partnerships with trusted institutions
- Education and awareness
- Incentive programs

**Risk:** Competition from large players
**Probability:** Medium
**Impact:** High
**Mitigation:**

- First-mover advantage
- Network effects
- Unique value proposition
- Fast execution

### Technology Risks

**Risk:** Technical challenges
**Probability:** Medium
**Impact:** Medium
**Mitigation:**

- Experienced team
- Robust architecture
- Testing and QA
- Scalable infrastructure

**Risk:** Security vulnerabilities
**Probability:** Low
**Impact:** Critical
**Mitigation:**

- Security audits
- Best practices
- Compliance (GDPR, PCI DSS)
- Regular updates

### Financial Risks

**Risk:** Revenue below projections
**Probability:** Medium
**Impact:** High
**Mitigation:**

- Conservative estimates
- Multiple revenue streams
- Flexible cost structure
- Reserve fund

**Risk:** Cost overruns
**Probability:** Medium
**Impact:** Medium
**Mitigation:**

- Regular monitoring
- Contingency fund
- Cost optimization
- Agile approach

### Operational Risks

**Risk:** Vendor acquisition challenges
**Probability:** Medium
**Impact:** High
**Mitigation:**

- Incentive programs
- Support and training
- Partnership approach
- Value demonstration

**Risk:** Regulatory changes
**Probability:** Low
**Impact:** High
**Mitigation:**

- Legal consultation
- Compliance focus
- Regulatory monitoring
- Adaptability

### Risk Mitigation Strategy

1. **Prevention:** Proactive measures
2. **Mitigation:** Impact reduction
3. **Contingency:** Backup plans
4. **Monitoring:** Regular assessment

---

## Appendices

### Appendix A: Market Research Data

- Industry reports
- Market size analysis
- Consumer surveys
- Vendor interviews

### Appendix B: Technology Documentation

- System architecture
- API documentation
- Security measures
- Compliance documentation

### Appendix C: Financial Models

- Detailed revenue projections
- Cost breakdowns
- Break-even analysis
- Scenario planning

### Appendix D: Legal Documents

- Terms of service
- Privacy policy
- Vendor agreements
- Compliance certificates

### Appendix E: Team Resumes

- Core team profiles
- Advisory board
- Key hires planned

### Appendix F: Competitive Analysis

- Competitor profiles
- Market positioning
- SWOT analysis

---

**Last Updated:** December 7, 2025
**Next Review:** Quarterly
