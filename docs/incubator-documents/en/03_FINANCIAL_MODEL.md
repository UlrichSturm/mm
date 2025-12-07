# Financial Model - Memento Mori

**Date:** 2025-12-07
**Version:** 1.0
**Status:** Financial Model Structure
**Language:** English

---

## Overview

This document describes the structure and assumptions for the Memento Mori financial model. The actual Excel model should be created based on this structure.

---

## Financial Model Structure

### Excel Workbook Structure

**Sheet 1: Assumptions**
- Market assumptions
- Pricing assumptions
- Cost assumptions
- Growth assumptions

**Sheet 2: Revenue Model**
- Transaction forecasts
- Revenue calculations
- Commission structure
- Revenue by category

**Sheet 3: Cost Model**
- Fixed costs
- Variable costs
- Cost by category
- Cost projections

**Sheet 4: Cash Flow**
- Operating cash flow
- Investment cash flow
- Financing cash flow
- Net cash flow

**Sheet 5: P&L Statement**
- Income statement
- Year-over-year analysis
- Margin analysis

**Sheet 6: Balance Sheet**
- Assets
- Liabilities
- Equity
- Working capital

**Sheet 7: Scenarios**
- Optimistic scenario
- Realistic scenario
- Pessimistic scenario

**Sheet 8: Key Metrics**
- Unit economics
- Growth metrics
- Financial ratios
- Break-even analysis

---

## Assumptions

### Market Assumptions

| Assumption | Year 1 | Year 2 | Year 3 | Notes |
|------------|--------|--------|--------|-------|
| **Total Deaths (Europe + USA)** | 11M | 11.2M | 11.4M | Growing population |
| **Digital Adoption Rate** | 0.1% | 0.5% | 1.0% | Increasing acceptance |
| **Platform Market Share** | 0.01% | 0.1% | 0.5% | Growing presence |
| **Target Transactions** | 4,000-6,000 | 15,000-25,000 | 40,000-60,000 | Based on market share |

### Pricing Assumptions

| Item | Year 1 | Year 2 | Year 3 | Notes |
|------|--------|--------|--------|-------|
| **Average Transaction Value** | €5,500 | €6,000 | €6,500 | Premium services growth |
| **Commission Rate (Services)** | 12% | 14% | 16% | Increasing with value |
| **Commission Rate (Products)** | 10% | 12% | 14% | Lower margin products |
| **Commission Rate (Legal)** | 15% | 17% | 19% | Revenue share model |

### Cost Assumptions

| Category | Year 1 | Year 2 | Year 3 | Notes |
|----------|--------|--------|--------|-------|
| **Team Salaries (Annual)** | €600K | €900K | €1.5M | Growing team |
| **Infrastructure (Monthly)** | €3,200 | €5,000 | €8,000 | Scaling with usage |
| **Marketing (% of Revenue)** | 30% | 25% | 20% | Decreasing as brand grows |
| **Payment Processing** | 2.9% + €0.25 | 2.9% + €0.25 | 2.9% + €0.25 | Stripe fees |
| **Customer Support** | 2% | 2.5% | 3% | Growing with scale |

### Growth Assumptions

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Transaction Growth (QoQ)** | 50-100% | 30-50% | 20-30% |
| **Vendor Growth** | 100 → 500 | 500 → 1,500 | 1,500 → 3,000 |
| **Client Growth** | 1,000 → 5,000 | 5,000 → 25,000 | 25,000 → 75,000 |
| **Revenue Growth (YoY)** | - | 400-500% | 200-300% |

---

## Revenue Model

### Revenue Streams

#### 1. Transaction Commission (Primary)

**Calculation:**
```
Revenue = Transactions × Average Transaction Value × Commission Rate
```

**Year 1:**
- Transactions: 4,000-6,000
- Avg. Transaction: €5,500
- Commission: 12%
- Revenue: €2.64M - €3.96M

**Year 2:**
- Transactions: 15,000-25,000
- Avg. Transaction: €6,000
- Commission: 14%
- Revenue: €12.6M - €21M

**Year 3:**
- Transactions: 40,000-60,000
- Avg. Transaction: €6,500
- Commission: 16%
- Revenue: €41.6M - €62.4M

#### 2. Premium Services (Future)

**Year 2:**
- Premium subscriptions: 5% of vendors
- Monthly fee: €200
- Revenue: €60K - €120K

**Year 3:**
- Premium subscriptions: 10% of vendors
- Monthly fee: €250
- Revenue: €450K - €900K

#### 3. Legal Service Partnerships

**Year 1:**
- Revenue share: 15%
- Legal transactions: 10% of total
- Revenue: €330K - €495K

**Year 2:**
- Revenue share: 17%
- Legal transactions: 12% of total
- Revenue: €1.53M - €2.55M

**Year 3:**
- Revenue share: 19%
- Legal transactions: 15% of total
- Revenue: €4.94M - €7.41M

### Revenue by Category

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Services** | 60% | 55% | 50% |
| **Products** | 25% | 28% | 30% |
| **Legal** | 15% | 17% | 20% |

---

## Cost Model

### Fixed Costs

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Team Salaries** | €600K | €900K | €1.5M |
| **Infrastructure** | €38K | €60K | €96K |
| **Software Licenses** | €6K | €10K | €15K |
| **Office/Remote** | €24K | €36K | €48K |
| **Legal & Compliance** | €12K | €18K | €24K |
| **Insurance** | €6K | €9K | €12K |
| **Total Fixed** | **€686K** | **€1,033K** | **€1,695K** |

### Variable Costs

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| **Payment Processing** | 2.9% of revenue | 2.9% of revenue | 2.9% of revenue |
| **Marketing** | 30% of revenue | 25% of revenue | 20% of revenue |
| **Customer Support** | 2% of revenue | 2.5% of revenue | 3% of revenue |
| **Vendor Incentives** | 1% of revenue | 1.5% of revenue | 2% of revenue |

### Cost Projections

**Year 1:**
- Fixed: €686K
- Variable: ~36% of revenue = €1.08M - €1.44M
- **Total: €1.77M - €2.13M**

**Year 2:**
- Fixed: €1,033K
- Variable: ~31% of revenue = €3.9M - €6.5M
- **Total: €4.93M - €7.53M**

**Year 3:**
- Fixed: €1,695K
- Variable: ~28% of revenue = €11.6M - €17.5M
- **Total: €13.3M - €19.2M**

---

## Cash Flow Forecast

### Operating Cash Flow

**Year 1:**
- Revenue: €2.64M - €3.96M
- Operating Costs: €1.77M - €2.13M
- **Operating Cash Flow: €870K - €1.83M**

**Year 2:**
- Revenue: €12.6M - €21M
- Operating Costs: €4.93M - €7.53M
- **Operating Cash Flow: €7.67M - €13.47M**

**Year 3:**
- Revenue: €41.6M - €62.4M
- Operating Costs: €13.3M - €19.2M
- **Operating Cash Flow: €28.3M - €43.2M**

### Investment Cash Flow

**Year 1:**
- MVP Development: €400K - €600K
- Infrastructure: €50K - €100K
- **Total Investment: €450K - €700K**

**Year 2:**
- Product Development: €200K - €300K
- Infrastructure: €100K - €150K
- **Total Investment: €300K - €450K**

**Year 3:**
- Product Development: €300K - €400K
- Infrastructure: €150K - €200K
- **Total Investment: €450K - €600K**

### Financing Cash Flow

**Seed Round (Month 0):**
- Investment: €1M - €2M
- Use: MVP, Marketing, Team

**Series A (Month 18):**
- Investment: €5M - €10M
- Use: Expansion, Scaling

### Net Cash Flow

**Year 1:**
- Operating: €870K - €1.83M
- Investment: -€450K to -€700K
- Financing: €1M - €2M
- **Net: €1.42M - €3.13M**

**Year 2:**
- Operating: €7.67M - €13.47M
- Investment: -€300K to -€450K
- Financing: €0 (or Series A)
- **Net: €7.37M - €13.02M**

**Year 3:**
- Operating: €28.3M - €43.2M
- Investment: -€450K to -€600K
- Financing: €0
- **Net: €27.85M - €42.6M**

---

## Profit & Loss Statement

### Year 1 P&L

| Item | Amount |
|------|--------|
| **Revenue** | €2.64M - €3.96M |
| **Cost of Goods Sold** | €0 (marketplace model) |
| **Gross Profit** | €2.64M - €3.96M |
| **Operating Expenses** | |
| - Team Salaries | €600K |
| - Infrastructure | €38K |
| - Marketing | €792K - €1,188K |
| - Payment Processing | €77K - €115K |
| - Customer Support | €53K - €79K |
| - Other | €48K |
| **Total Operating Expenses** | €1.61M - €2.07M |
| **Operating Income** | €1.03M - €1.89M |
| **Net Income** | €1.03M - €1.89M |

### Year 2 P&L

| Item | Amount |
|------|--------|
| **Revenue** | €12.6M - €21M |
| **Gross Profit** | €12.6M - €21M |
| **Operating Expenses** | €4.93M - €7.53M |
| **Operating Income** | €7.67M - €13.47M |
| **Net Income** | €7.67M - €13.47M |

### Year 3 P&L

| Item | Amount |
|------|--------|
| **Revenue** | €41.6M - €62.4M |
| **Gross Profit** | €41.6M - €62.4M |
| **Operating Expenses** | €13.3M - €19.2M |
| **Operating Income** | €28.3M - €43.2M |
| **Net Income** | €28.3M - €43.2M |

---

## Break-even Analysis

### Break-even Point

**Break-even Revenue:**
- Fixed Costs: €686K
- Variable Cost Rate: ~36%
- Required Revenue: €686K / (1 - 0.36) = **€1.07M**

**Break-even Transactions:**
- Avg. Transaction: €5,500
- Commission: 12%
- Revenue per Transaction: €660
- Required Transactions: €1.07M / €660 = **~1,620 transactions**

**Break-even Timeline:**
- Month 10-12 (Year 1)
- Based on growth trajectory

### Break-even Scenarios

**Optimistic:**
- Break-even: Month 8-9
- Revenue: €1.2M
- Transactions: 1,800

**Realistic:**
- Break-even: Month 10-12
- Revenue: €1.5M
- Transactions: 2,500

**Pessimistic:**
- Break-even: Month 14-16
- Revenue: €2M
- Transactions: 3,500

---

## Scenarios

### Optimistic Scenario

**Assumptions:**
- Faster market adoption (0.15% → 0.8% → 1.5%)
- Higher transaction values (€6,000 → €7,000 → €8,000)
- Lower costs (efficient operations)

**Results:**
- Year 1 Revenue: €4.5M
- Year 2 Revenue: €25M
- Year 3 Revenue: €75M
- Break-even: Month 8

### Realistic Scenario

**Assumptions:**
- Standard market adoption (0.1% → 0.5% → 1.0%)
- Standard transaction values (€5,500 → €6,000 → €6,500)
- Standard costs

**Results:**
- Year 1 Revenue: €3M
- Year 2 Revenue: €17M
- Year 3 Revenue: €50M
- Break-even: Month 10-12

### Pessimistic Scenario

**Assumptions:**
- Slower market adoption (0.05% → 0.3% → 0.7%)
- Lower transaction values (€5,000 → €5,500 → €6,000)
- Higher costs (inefficiencies)

**Results:**
- Year 1 Revenue: €1.5M
- Year 2 Revenue: €8M
- Year 3 Revenue: €25M
- Break-even: Month 14-16

---

## Key Metrics

### Unit Economics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **CAC (Customer Acquisition Cost)** | €50-100 | €40-80 | €30-60 |
| **LTV (Lifetime Value)** | €1,100 | €1,500 | €2,000 |
| **LTV/CAC Ratio** | 11-22x | 19-38x | 33-67x |
| **Payback Period** | 1-2 months | <1 month | <1 month |
| **Gross Margin** | 85-90% | 85-90% | 85-90% |
| **Net Margin** | -50% | 10-15% | 20-25% |

### Growth Metrics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Revenue Growth (YoY)** | - | 400-500% | 200-300% |
| **Transaction Growth (YoY)** | - | 300-400% | 150-200% |
| **Vendor Growth (YoY)** | - | 400% | 200% |
| **Client Growth (YoY)** | - | 400% | 200% |

### Financial Ratios

| Ratio | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| **Gross Margin %** | 85-90% | 85-90% | 85-90% |
| **Operating Margin %** | 30-40% | 50-60% | 60-70% |
| **Net Margin %** | 30-40% | 50-60% | 60-70% |
| **ROI** | - | 400-500% | 200-300% |

---

## Use of Funds

### Seed Round: €1-2M

| Category | Amount | Percentage | Timeline |
|----------|--------|:----------:|----------|
| **MVP Development** | €400K - €600K | 40-30% | Months 1-3 |
| **Marketing & Launch** | €300K - €500K | 30-25% | Months 4-6 |
| **Team Expansion** | €200K - €400K | 20-20% | Months 1-12 |
| **Infrastructure** | €50K - €100K | 5-5% | Months 1-12 |
| **Reserve** | €50K - €400K | 5-20% | All phases |

### Detailed Breakdown

**MVP Development (€400-600K):**
- Backend: €100-200K
- Frontend: €150-300K
- Mobile: €100-200K
- Testing: €50-100K

**Marketing (€300-500K):**
- Digital Ads: €150-300K
- Vendor Acquisition: €100-200K
- PR & Branding: €50-100K

**Team (€200-400K):**
- Developers: €120-240K
- Sales: €50-100K
- Operations: €30-60K

**Infrastructure (€50-100K):**
- Cloud: €40-80K
- Tools: €10-20K

---

## Excel Model Instructions

### Creating the Excel Model

1. **Create 8 sheets** as described above
2. **Set up assumptions sheet** with all input values
3. **Link formulas** between sheets
4. **Use named ranges** for key assumptions
5. **Add data validation** for inputs
6. **Create charts** for visualization
7. **Add scenario analysis** tools
8. **Format professionally** for presentation

### Key Formulas

**Revenue Calculation:**
```
=Transactions × AvgTransaction × CommissionRate
```

**Cost Calculation:**
```
=FixedCosts + (Revenue × VariableCostRate)
```

**Cash Flow:**
```
=OperatingCashFlow - InvestmentCashFlow + FinancingCashFlow
```

**Break-even:**
```
=FixedCosts / (1 - VariableCostRate)
```

---

## Notes for Financial Model

- All amounts in EUR
- Assumptions should be clearly documented
- Use conservative estimates
- Include sensitivity analysis
- Update monthly/quarterly
- Validate with industry benchmarks
- Prepare for investor questions

---

**Last Updated:** December 7, 2025
**Next Review:** Monthly

