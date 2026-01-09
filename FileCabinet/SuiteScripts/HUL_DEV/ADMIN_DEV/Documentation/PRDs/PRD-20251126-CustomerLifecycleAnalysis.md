# PRD: Customer Lifecycle Analysis System

**PRD ID:** PRD-20251126-CustomerLifecycleAnalysis
**Created:** November 26, 2025
**Author:** Claude Code
**Status:** In Testing (Awaiting User Feedback)

**Related Scripts:**
- `MapReduce/hul_mr_customer_health_calc.js`
- `Scheduled/hul_ss_customer_health_alert.js`
- `Suitelets/hul_sl_customer_health_dashboard.js`
- `Libraries/hul_lib_customer_health.js`

---

## 1. Introduction / Overview

**What is this feature?**
A statistical customer health scoring system that identifies at-risk and lost customers across all revenue streams (Equipment, Service, Parts, Rental, Financing) using dynamic per-customer expected purchase intervals.

**What problem does it solve?**
- Customers across multiple revenue streams have very different purchase frequencies
- Equipment purchases: once every 3-5 years
- Service work: a few times per year
- Parts: variable (some buy direct, some rely on service team)
- Rental: variable frequency
- No way to know if a customer is "at risk" without understanding their individual pattern
- Sales team needs proactive alerts to re-engage customers before they're lost

**Primary Goal:**
Enable management and sales reps to identify at-risk customers using statistical analysis of their own purchase patterns, with automated weekly alerts and a dashboard for proactive outreach.

---

## 2. User Stories

1. **As a** Sales Rep, **I want to** receive weekly alerts about my at-risk customers **so that** I can proactively reach out before they're lost.

2. **As a** Sales Manager, **I want to** see a dashboard of all customer health statuses **so that** I can identify trends and coach my team.

3. **As an** Operations Manager, **I want to** understand customer cohorts **so that** I can tailor marketing campaigns.

4. **As an** Executive, **I want to** know how many customers are at risk of churning **so that** I can measure customer retention.

---

## 3. Core Algorithm

### Expected Purchase Interval (EPI)

Each customer has a personalized EPI per revenue stream based on their transaction history:

```
EPI = Average days between transactions × 1.25 (buffer)
```

For customers with insufficient history, blend with cohort defaults:
- **New customers** (< 6 months, < 3 transactions): 80% cohort, 20% personal
- **Developing** (< 24 months, < 10 transactions): 40% cohort, 60% personal
- **Established** (> 24 months, > 10 transactions): 10% cohort, 90% personal

### Default EPIs (Cohort Baselines)

| Revenue Stream | Default EPI | Transaction Prefix |
|----------------|-------------|-------------------|
| Equipment Sales | 1460 days (4 years) | S, E |
| Rental | 180 days (6 months) | R |
| Service | 120 days (quarterly) | W, WO |
| Parts | 90 days (3 months) | P |
| Financing | 1825 days (5 years) | F |

### Stream Score Calculation (Decay Model)

```javascript
if (daysSinceLastPurchase <= EPI) {
    streamScore = 100;
} else {
    overdueDays = daysSinceLastPurchase - EPI;
    streamScore = 100 * Math.exp(-0.015 * overdueDays);
}
```

### Composite Health Score

```
Health Score = Σ(Stream_Weight × Stream_Score) / Σ(Active_Stream_Weights)
```

Weights are normalized per customer based on their revenue mix.

### Customer Status Thresholds

| Score | Status | Color | Action |
|-------|--------|-------|--------|
| 80-100 | Active | Green | No action |
| 60-79 | Engaged | Light Green | Soft touch opportunity |
| 40-59 | At Risk | Yellow | Include in weekly alert |
| 20-39 | Critical | Orange | Urgent - include in weekly alert |
| 0-19 | Lost | Red | Win-back campaign |

---

## 4. Technical Architecture

### Data Flow

```
TRANSACTIONS (5 years history)
        ↓
MapReduce Script (Daily 2 AM)
    - Query transaction aggregates per customer per stream
    - Calculate EPI per customer
    - Calculate stream scores using decay model
    - Calculate composite health score
    - Determine status and trend
        ↓
Customer Health Snapshot Record (customrecord_hul_customer_health)
        ↓
    ┌─────────────────────────┐
    ↓                         ↓
Customer Entity Fields    Scheduled Alert (Weekly Monday 7 AM)
(Quick View)                  ↓
                         Email to Sales Rep
                         (At Risk / Critical / Lost)
        ↓
Dashboard Suitelet (On-demand)
    - Filter by status, sales rep, days since activity
    - Statistics banner
    - Export to CSV
```

### Scripts

| Script | Type | Schedule | Purpose |
|--------|------|----------|---------|
| `hul_mr_customer_health_calc.js` | MapReduce | Daily 2 AM | Calculate health scores |
| `hul_ss_customer_health_alert.js` | Scheduled | Monday 7 AM | Email weekly digest |
| `hul_sl_customer_health_dashboard.js` | Suitelet | On-demand | Dashboard UI |
| `hul_lib_customer_health.js` | Library | N/A | Shared scoring logic |

---

## 5. Custom Record Specifications

### Custom Lists

#### customlist_hul_ch_status
| ID | Value |
|----|-------|
| 1 | Active |
| 2 | Engaged |
| 3 | At Risk |
| 4 | Critical |
| 5 | Lost |

#### customlist_hul_ch_trend
| ID | Value |
|----|-------|
| 1 | Up |
| 2 | Stable |
| 3 | Down |
| 4 | Declining |

#### customlist_hul_ch_cohort
| ID | Value |
|----|-------|
| 1 | Full Service |
| 2 | Equipment Owner |
| 3 | Rental Only |
| 4 | Service Only |
| 5 | Parts Only |
| 6 | Occasional |

### Custom Record: customrecord_hul_customer_health

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| `name` | Name | Text | Auto: Customer name |
| `custrecord_hul_ch_customer` | Customer | List/Record (Customer) | Required |
| `custrecord_hul_ch_health_score` | Health Score | Integer | 0-100 |
| `custrecord_hul_ch_health_status` | Health Status | List | customlist_hul_ch_status |
| `custrecord_hul_ch_last_calc_date` | Last Calculated | Date/Time | |
| `custrecord_hul_ch_last_transaction` | Last Transaction | Date | Most recent activity |
| `custrecord_hul_ch_days_since_activity` | Days Since Activity | Integer | |
| `custrecord_hul_ch_revenue_12m` | 12-Month Revenue (Total) | Currency | Rolling 12 months |
| `custrecord_hul_ch_revenue_12m_ext` | 12-Month Revenue (External) | Currency | Customer paid |
| `custrecord_hul_ch_revenue_12m_int` | 12-Month Revenue (Internal) | Currency | Internal/warranty |
| `custrecord_hul_ch_revenue_ltv` | Lifetime Revenue (Total) | Currency | All time |
| `custrecord_hul_ch_revenue_ltv_ext` | Lifetime Revenue (External) | Currency | Customer paid |
| `custrecord_hul_ch_revenue_ltv_int` | Lifetime Revenue (Internal) | Currency | Internal/warranty |
| `custrecord_hul_ch_expected_freq` | Expected Frequency | Integer | Days (blended EPI) |
| `custrecord_hul_ch_customer_cohort` | Customer Cohort | List | customlist_hul_ch_cohort |
| `custrecord_hul_ch_trend` | Trend | List | customlist_hul_ch_trend |
| `custrecord_hul_ch_sales_rep` | Sales Rep | List/Record (Employee) | From customer record |
| `custrecord_hul_ch_equip_score` | Equipment Score | Integer | 0-100 or null |
| `custrecord_hul_ch_service_score` | Service Score | Integer | 0-100 or null |
| `custrecord_hul_ch_rental_score` | Rental Score | Integer | 0-100 or null |
| `custrecord_hul_ch_parts_score` | Parts Score | Integer | 0-100 or null |
| `custrecord_hul_ch_last_alert_date` | Last Alert Sent | Date | Prevent duplicate alerts |
| `custrecord_hul_ch_interpretation` | Interpretation | Long Text | Plain-language summary of health status (NOT YET CREATED) |

### Customer Entity Fields (Quick View)

| Field ID | Label | Type |
|----------|-------|------|
| `custentity_hul_health_score` | Health Score | Integer |
| `custentity_hul_health_status` | Health Status | List (customlist_hul_ch_status) |
| `custentity_hul_last_activity` | Last Activity | Date |

---

## 6. SuiteQL Query

### Transaction Aggregation Query

```sql
WITH CustomerTransactions AS (
    SELECT
        t.entity AS customer_id,
        t.trandate,
        ABS(tl.netamount) AS amount,
        CASE
            WHEN t.tranid LIKE 'R%' THEN 'RENTAL'
            WHEN t.tranid LIKE 'S%' OR t.tranid LIKE 'E%' THEN 'EQUIPMENT'
            WHEN t.tranid LIKE 'W%' OR t.tranid LIKE 'WO%' THEN 'SERVICE'
            WHEN t.tranid LIKE 'P%' THEN 'PARTS'
            ELSE 'OTHER'
        END AS stream_type
    FROM transaction t
    INNER JOIN transactionline tl ON t.id = tl.transaction
    WHERE t.type IN ('CustInvc', 'CashSale')
      AND t.entity IS NOT NULL
      AND tl.mainline = 'F'
      AND t.trandate >= ADD_MONTHS(SYSDATE, -60)
)
SELECT
    customer_id,
    stream_type,
    COUNT(*) AS txn_count,
    SUM(amount) AS total_revenue,
    MAX(trandate) AS last_date,
    MIN(trandate) AS first_date,
    TRUNC(SYSDATE) - TRUNC(MAX(trandate)) AS days_since_last
FROM CustomerTransactions
WHERE stream_type != 'OTHER'
GROUP BY customer_id, stream_type
ORDER BY customer_id, stream_type
```

---

## 7. Alert System

### Weekly Email Digest

**Trigger:** Scheduled script, Monday 7:00 AM
**Recipients:** Each sales rep receives email for their at-risk customers
**Threshold:** Score < 60 OR days since activity > 90

**Email Content:**
- Header: "Customer Health Alert - Week of {date}"
- Summary: "You have X customers that need attention"
- Table grouped by status (Critical first, then At Risk, then Lost)
- Columns: Customer Name, Score, Status, Days Since Activity, Last Transaction Date, Lifetime Value
- Link to dashboard for full details

---

## 8. Dashboard Features

### Filters
- Health Status (multi-select)
- Sales Rep
- Days Since Activity (range)
- Revenue Range
- Customer Cohort

### Statistics Banner
- Total Customers (with transactions in 5 years)
- Active count (green)
- Engaged count (light green)
- At Risk count (yellow)
- Critical count (orange)
- Lost count (red)

### Results Table
- Customer Name (link to customer record)
- Health Score (color-coded)
- Status badge
- Days Since Activity
- Last Transaction Date
- 12-Month Revenue
- Lifetime Revenue
- Sales Rep
- Trend indicator

### Export
- CSV export with all fields

---

## 9. Implementation Plan

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create PRD document | ✅ Complete |
| 2 | Create custom lists in NetSuite | ✅ Complete |
| 3 | Create custom record in NetSuite | ✅ Complete |
| 4 | Add customer entity fields | ✅ Complete |
| 5 | Create shared library | ✅ Complete |
| 6 | Create MapReduce calculator | ✅ Complete |
| 7 | Create Dashboard Suitelet | ✅ Complete |
| 8 | Create Alert Script | ✅ Complete |
| 9 | Deploy to sandbox | ✅ Complete |
| 10 | Run initial calculation (test customer) | ✅ Complete |
| 11 | Add Interpretation field to custom record | ⏳ Pending |
| 12 | User acceptance testing | ⏳ In Progress (Awaiting feedback) |
| 13 | Deploy to production | ⏳ Pending |

---

## 10. Script Deployment

### MapReduce Script
- **Script ID:** `customscript_hul_mr_customer_health`
- **Deployment ID:** `customdeploy_hul_mr_customer_health`
- **Schedule:** Daily at 2:00 AM

### Scheduled Alert Script
- **Script ID:** `customscript_hul_ss_customer_alert`
- **Deployment ID:** `customdeploy_hul_ss_customer_alert`
- **Schedule:** Weekly, Monday at 7:00 AM

### Dashboard Suitelet
- **Script ID:** `customscript_hul_sl_customer_health`
- **Deployment ID:** `customdeploy_hul_sl_customer_health`

---

## 11. Configuration Parameters

### MapReduce Script Parameters
| Parameter ID | Label | Type | Default |
|--------------|-------|------|---------|
| `custscript_ch_history_months` | History Months | Integer | 60 |
| `custscript_ch_customer_limit` | Customer Limit (0=all) | Integer | 0 |
| `custscript_ch_test_customer` | Test Customer ID | Integer | (empty = all) |

### Scheduled Alert Parameters
| Parameter ID | Label | Type | Default |
|--------------|-------|------|---------|
| `custscript_ch_alert_sender` | Sender Employee | Employee | Required |
| `custscript_ch_score_threshold` | Score Threshold | Integer | 60 |
| `custscript_ch_days_threshold` | Days Threshold | Integer | 90 |
| `custscript_ch_cc_recipients` | CC Recipients | Text | Optional |

---

## 12. Key Design Decisions

1. **Statistical thresholds**: Per-customer EPI based on their own history, not fixed rules
2. **Equipment-only customers**: Included in scoring - if no follow-up service/parts, track as potential at-risk
3. **Alert action**: Email only (weekly digest to sales rep)
4. **History depth**: 5 years (captures equipment purchase cycles)
5. **Cohort blending**: New customers blend personal data with industry baselines
6. **Storage**: Custom record snapshot for performance (don't query transactions on dashboard load)
7. **External vs Internal Revenue**: Track separately - External is customer-paid, Internal is department-billed (warranty, internal work). Health scoring uses External revenue as primary indicator.

---

## 12a. Revenue Stream Classification

**Segment Field:** `cseg_sna_revenue_st` on transaction lines
**Classification Field:** `custrecord_sna_hul_revstreaminternal` on `customrecord_cseg_sna_revenue_st`

| Checkbox Value | Type | Description | Use in Scoring |
|----------------|------|-------------|----------------|
| `F` (unchecked) | External | Billed to customer, customer pays | Primary - reflects actual customer relationship |
| `T` (checked) | Internal | Billed internally to department (warranty, internal repairs) | Secondary - indicates equipment activity but not customer spend |

**Query Logic:** JOIN to `customrecord_cseg_sna_revenue_st` and check `custrecord_sna_hul_revstreaminternal = 'T'` for Internal revenue.

---

## 13. Future Enhancement: AI-Powered Health Scoring

### Current Algorithm Limitations

| Component | Current Approach | Limitation |
|-----------|-----------------|------------|
| Decay Rate | Fixed 0.015 for all customers | Doesn't adapt to customer-specific patterns |
| Thresholds | Static 80/60/40/20 | Same for equipment buyer (4yr cycle) and parts buyer (monthly) |
| Cohort Blending | Fixed 80/20, 60/40, 90/10 | Arbitrary weights, not data-driven |
| Interpretation | Template-based `generateInterpretation()` | Generic, no actionable recommendations |
| Prediction | None - purely reactive | Score only decays AFTER customer is overdue |

### Recommended AI Enhancement: 3-Phase Approach

#### Phase 1: Claude API for Natural Language Insights

**When:** During MapReduce nightly processing
**For Whom:** Customers with score < 70 (At Risk, Critical, Lost)
**Cost:** ~$150/month (~500 customers × $0.01/call × 30 days)

**Implementation:**
- Call Claude API in MapReduce reduce phase
- Send customer context (scores, trends, revenue history)
- Receive rich interpretation + suggested actions

**Input Payload:**
```javascript
{
  customer_name: "Acme Construction",
  health_score: 45,
  status: "At Risk",
  days_since_activity: 127,
  expected_frequency: 90,
  stream_scores: {
    EQUIPMENT: { score: 100, last_days: 450, epi: 1460 },
    SERVICE: { score: 32, last_days: 127, epi: 90 },
    PARTS: { score: 28, last_days: 145, epi: 90 }
  },
  revenue_12m: 45000,
  revenue_trend: "declining",
  cohort: "Full Service"
}
```

**Expected Output:**
```javascript
{
  interpretation: "Acme Construction is showing signs of disengagement. Service frequency has dropped from quarterly to silent, and parts ordering has stopped entirely - they may be sourcing elsewhere.",
  risk_level: "HIGH",
  suggested_actions: [
    "Schedule service check-in call - 37 days overdue for typical service interval",
    "Review recent service history for quality issues",
    "Consider parts pricing review - no parts orders in 145 days"
  ],
  warning_signals: [
    "Service frequency dropped from quarterly to silent",
    "Parts ordering stopped - may be sourcing elsewhere"
  ]
}
```

**New Fields Required:**
| Field ID | Label | Type |
|----------|-------|------|
| `custrecord_hul_ch_ai_interpretation` | AI Interpretation | Long Text |
| `custrecord_hul_ch_suggested_actions` | Suggested Actions | Long Text (JSON) |
| `custrecord_hul_ch_warning_signals` | Warning Signals | Long Text (JSON) |
| `custrecord_hul_ch_revenue_trend` | Revenue Trend | List (Up/Stable/Down/Declining) |

#### Phase 2: Early Warning Signals (Rule-Based)

Detect behavioral changes BEFORE score decays:

| Signal | Detection Logic | Alert |
|--------|----------------|-------|
| Revenue Trend | 3+ periods declining | "Revenue Declining" |
| Frequency Slowdown | Current gap > 1.5× historical average | "Activity Slowing" |
| Category Dropout | Was active in category, now 0 transactions 2+ periods | "Stopped buying [Parts]" |
| Seasonal Adjustment | Construction customers in Q4 | Adjust EPI for expected quiet period |

These signals feed into Claude prompt for richer, more contextual analysis.

#### Phase 3: Predictive Churn Model (Future)

Train ML model on historical churn data:
- **Training Data:** Customers who churned (no activity 2+ years) vs retained
- **Features:** Health scores, revenue trends, frequency patterns, cohort, signals
- **Output:** Churn probability in next 90 days
- **New Field:** `custrecord_hul_ch_churn_probability` (Percent)

### Cost-Benefit Analysis

| Approach | Cost | Benefit |
|----------|------|---------|
| Current (rule-based) | $0 | Basic templated interpretation |
| Phase 1 (Claude API) | ~$150/month | Rich insights, actionable recommendations, sales rep loves it |
| Phase 2 (signals) | Development time | Earlier detection, more predictive |
| Phase 3 (ML model) | Dev + hosting | True churn prediction probability |

**Recommendation:** Start with Phase 1 for highest impact with lowest complexity. Claude API integration is straightforward in SuiteScript using N/https module.

### Technical Architecture for Claude API

```javascript
/**
 * Call Claude API for AI-generated interpretation
 * Add to hul_lib_customer_health.js
 */
function generateAIInterpretation(customerData) {
    var https = require('N/https');
    var runtime = require('N/runtime');

    var prompt = buildCustomerPrompt(customerData);

    var response = https.post({
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
            'x-api-key': runtime.getCurrentScript().getParameter('custscript_claude_api_key'),
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',  // Fast, cheap for batch processing
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    return JSON.parse(response.body);
}
```

---

## 14. Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Nov 26, 2025 | Claude Code | 1.0 | Initial PRD |
| Nov 26, 2025 | Claude Code | 1.1 | Added External/Internal revenue fields; Created custom lists, custom record, and customer entity fields in NetSuite |
| Nov 27, 2025 | Claude Code | 1.2 | Added document prefix mapping (S, PS, W, MC, FIN, R); Added PM customer special handling with Project record integration; Created all scripts: hul_lib_customer_health.js, hul_mr_customer_health_calc.js, hul_sl_customer_health_dashboard.js, hul_ss_customer_health_alert.js |
| Nov 27, 2025 | Claude Code | 1.3 | Fixed library path in scripts (../Libraries/ not ./Libraries/); Added test customer parameter; Fixed Internal/External revenue classification to use checkbox field `custrecord_sna_hul_revstreaminternal` on revenue stream record; Fixed 12-month revenue calculation; Added Interpretation field and generateInterpretation() function for plain-language summary; Tested with customer 48150 (Landscape Structures) - all revenue fields now populating correctly |
| Nov 28, 2025 | Claude Code | 1.4 | Added Section 13: Future Enhancement - AI-Powered Health Scoring with 3-phase approach (Claude API integration, Early Warning Signals, Predictive Churn Model); Documented current algorithm limitations and recommended improvements |

---

## 15. Known Issues / Pending Items

1. **Interpretation field not yet created in NetSuite** - Need to add `custrecord_hul_ch_interpretation` (Long Text) to the custom record before re-uploading scripts
2. **Dashboard and Alert scripts not yet tested** - Only MapReduce has been deployed and tested
3. **Full customer run not yet performed** - Only tested with single customer (48150)
4. **Awaiting user feedback** on score interpretation and usefulness before proceeding
