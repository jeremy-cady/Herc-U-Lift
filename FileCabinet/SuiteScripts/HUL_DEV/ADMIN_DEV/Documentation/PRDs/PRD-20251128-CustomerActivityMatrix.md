# PRD: Customer Activity Matrix & PM Compliance Tracker

**PRD ID:** PRD-20251128-CustomerActivityMatrix
**Created:** November 28, 2025
**Author:** Thomas Showalter / Claude
**Status:** Draft
**Related Scripts:** hul_mr_customer_activity.js, hul_sl_customer_health_dashboard.js

---

## 1. Introduction / Overview

**What is this feature?**
A granular customer activity tracking system that captures last invoice and last support case at the intersection of **Customer × Equipment × Revenue Stream**, combined with PM (Planned Maintenance) agreement compliance monitoring. This creates a unified view of customer engagement across all 195 revenue streams while tracking PM contract adherence.

**What problem does it solve?**
- Sales reps cannot see detailed customer engagement patterns by revenue stream
- No visibility into "when did we last service Equipment X for Customer Y?"
- No way to identify revenue streams where cases come in but no invoices follow (potential lost revenue)
- 195 revenue streams are too complex to report on without structured data
- PM compliance is tracked on individual assets but not aggregated at the customer level
- No easy way to see which customer equipment is/isn't covered by PM agreements
- Cannot identify customers who are overdue on scheduled maintenance

**Primary Goal:**
Create a pre-aggregated data layer that enables rapid reporting on customer activity patterns and PM compliance without real-time query overhead.

---

## 2. Goals

1. **Enable granular activity visibility** - Sales reps can instantly see last invoice and last case for any Customer × Equipment × Revenue Stream combination
2. **Track PM agreement coverage** - Identify which customer equipment is covered by PM agreements and which is not
3. **Monitor PM compliance** - Track whether scheduled maintenance is being completed on time, per equipment, per revenue stream
4. **Identify revenue leakage** - Find cases where service requests come in but no invoices follow
5. **Support bulk reporting** - Enable exports and saved searches for management dashboards
6. **Maintain performance** - Dashboard loads in < 5 seconds for individual customer views

---

## 3. User Stories

1. **As a** sales rep, **I want to** see the last invoice date and amount for each revenue stream for a customer **so that** I can identify cross-sell opportunities and dormant service lines.

2. **As a** service manager, **I want to** see which customer equipment is covered by PM agreements and which isn't **so that** I can identify PM upsell opportunities.

3. **As a** service coordinator, **I want to** see which scheduled PMs are overdue by equipment **so that** I can prioritize technician dispatch and prevent contract violations.

4. **As an** executive, **I want to** export a report of all customers with cases but no invoices in the last 90 days **so that** I can investigate potential revenue leakage.

5. **As a** sales rep, **I want to** see PM compliance status per customer (% on-time, % overdue) **so that** I can proactively address service quality issues before renewal discussions.

---

## 4. Functional Requirements

### Core Functionality - Customer Activity Matrix

1. The system must create and maintain a custom record at the intersection of Customer × Equipment × Revenue Stream
2. The system must track **leaf revenue streams only** (not rollup/parent streams) - approximately 120 streams
3. The system must make Equipment **optional** (some streams like Parts Direct don't have equipment associations)
4. The system must store last invoice details: date, internal ID, document number, amount
5. The system must store last case details: date, internal ID, case number, case type
6. The system must calculate rolling 12-month totals: invoice count, invoice total, case count
7. The system must calculate days since last invoice and days since last case
8. The system must update nightly via MapReduce scheduled at 3 AM (after customer health calc at 2 AM)

### Core Functionality - PM Compliance Tracking

9. The system must identify all equipment with active PM projects for each customer
10. The system must track PM coverage status: Covered (has active PM project) vs Not Covered
11. The system must track last PM completion date per equipment per PM revenue stream (PM/AN/CO)
12. The system must calculate PM compliance: On Time, Due Soon (within 7 days), Overdue
13. The system must calculate days overdue based on contracted PM frequency
14. The system must aggregate PM compliance metrics at the customer level (% on-time, % overdue)

### Acceptance Criteria

- [ ] Custom record `customrecord_hul_customer_activity` created with all specified fields
- [ ] MapReduce script populates records for all active customers (last 5 years of activity)
- [ ] Leaf streams correctly identified (not parents of other streams)
- [ ] PM projects correctly linked to equipment and compliance calculated
- [ ] Days overdue accurately calculated based on contracted frequency
- [ ] Customer health dashboard enhanced with activity details tab
- [ ] Data matches manual verification for 5 test customers
- [ ] MapReduce completes within governance limits (< 1 hour)

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace the existing Customer Health scoring algorithm (this supplements it)
- Track activity at the rollup/parent revenue stream level (leaf only)
- Include real-time updates (nightly batch only in Phase 1)
- Send automated alerts for overdue PMs (future enhancement)
- Predict future PM due dates beyond the next scheduled task
- Track PM compliance history over time (only current status)

---

## 6. Design Considerations

### User Interface

- **Primary View:** Add "Activity Details" tab to existing Customer Health Dashboard
- **Filter Options:** Customer, Revenue Stream Category, Equipment, Date Range, "No activity in X days"
- **PM View:** Collapsible section showing PM coverage and compliance per equipment
- **Export:** CSV export of activity data with all fields

### User Experience

- Dashboard should load in < 5 seconds for individual customer view
- Color-code activity recency: Green (< 30 days), Yellow (30-90 days), Red (> 90 days)
- PM compliance indicators: ✓ On Time, ⚠ Due Soon, ✗ Overdue
- Show revenue stream hierarchy path for clarity (e.g., "External > Service > PM")

### Design References

- Follow existing Customer Health Dashboard styling (purple gradient theme)
- Use collapsible `<details>` elements for equipment-level drill-down
- Grid layout: 3-column for summary metrics, expandable table for details

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- `customer` - Customer entity
- `customrecord_sna_objects` - Equipment Object
- `customrecord_nx_asset` - Field Service Asset
- `customrecord_cseg_sna_revenue_st` - Revenue Stream (custom segment)
- `job` - PM Project
- `transaction` (CustInvc, CashSale) - Invoices
- `supportcase` - Support Cases
- `task` - PM Tasks
- **NEW:** `customrecord_hul_customer_activity` - Activity Matrix Record

**Script Types:**
- [x] Map/Reduce - `hul_mr_customer_activity.js` - Nightly activity aggregation
- [ ] Suitelet - Enhance `hul_sl_customer_health_dashboard.js` - Activity details view

**Custom Fields (New Record):**

| Field ID | Label | Type | Notes |
|----------|-------|------|-------|
| `name` | Name | Text | Auto: "Customer - Stream - Equipment" |
| **Key Fields** |
| `custrecord_hul_ca_customer` | Customer | List/Record (Customer) | Required |
| `custrecord_hul_ca_object` | Equipment Object | List/Record (customrecord_sna_objects) | Optional |
| `custrecord_hul_ca_asset` | Field Service Asset | List/Record (customrecord_nx_asset) | Optional |
| `custrecord_hul_ca_revenue_stream` | Revenue Stream | List/Record (customrecord_cseg_sna_revenue_st) | Required, leaf only |
| `custrecord_hul_ca_stream_path` | Revenue Stream Path | Text | Full hierarchy path |
| **Invoice Fields** |
| `custrecord_hul_ca_last_inv_date` | Last Invoice Date | Date | |
| `custrecord_hul_ca_last_inv_id` | Last Invoice | List/Record (Transaction) | |
| `custrecord_hul_ca_last_inv_number` | Last Invoice Number | Text | Document number |
| `custrecord_hul_ca_last_inv_amount` | Last Invoice Amount | Currency | |
| `custrecord_hul_ca_inv_count_12m` | Invoice Count (12m) | Integer | Rolling 12 months |
| `custrecord_hul_ca_inv_total_12m` | Invoice Total (12m) | Currency | Rolling 12 months |
| **Case Fields** |
| `custrecord_hul_ca_last_case_date` | Last Case Date | Date | |
| `custrecord_hul_ca_last_case_id` | Last Case | List/Record (Support Case) | |
| `custrecord_hul_ca_last_case_number` | Last Case Number | Text | Case number |
| `custrecord_hul_ca_last_case_type` | Last Case Type | Text | From custevent_nx_case_type |
| `custrecord_hul_ca_case_count_12m` | Case Count (12m) | Integer | Rolling 12 months |
| **PM Fields** |
| `custrecord_hul_ca_pm_project` | PM Project | List/Record (Job) | Active PM project for this equipment/stream |
| `custrecord_hul_ca_pm_covered` | PM Covered | Checkbox | Has active PM agreement |
| `custrecord_hul_ca_pm_frequency` | PM Frequency (Days) | Integer | Contracted interval |
| `custrecord_hul_ca_last_pm_date` | Last PM Completion | Date | Last completed PM task |
| `custrecord_hul_ca_last_pm_task` | Last PM Task | List/Record (Task) | |
| `custrecord_hul_ca_next_pm_date` | Next PM Due | Date | Next scheduled PM |
| `custrecord_hul_ca_pm_status` | PM Status | List | 1=On Time, 2=Due Soon, 3=Overdue |
| `custrecord_hul_ca_pm_days_overdue` | Days Overdue | Integer | Negative = days until due |
| **Metadata** |
| `custrecord_hul_ca_last_updated` | Last Updated | Date/Time | |
| `custrecord_hul_ca_days_since_inv` | Days Since Invoice | Integer | Calculated |
| `custrecord_hul_ca_days_since_case` | Days Since Case | Integer | Calculated |

### Key Data Linkages

**Invoices → Equipment → Revenue Stream:**
| Field | Record | Contains |
|-------|--------|----------|
| `custcol_sna_object` | Transaction Line | Object Internal ID |
| `custcol_sna_hul_fleet_no` | Transaction Line | Object Internal ID (W invoices) |
| `cseg_sna_revenue_st` | Transaction Line | Revenue Stream Segment ID |

**Cases → Equipment → Revenue Stream:**
| Field | Record | Contains |
|-------|--------|----------|
| `custevent_nx_customer` | Support Case | Customer ID |
| `custevent_sna_hul_case_object` | Support Case | Object ID |
| `custevent_nxc_case_assets` | Support Case | Multi-select Asset IDs (MAP table) |
| `cseg_sna_revenue_st` | Support Case | Revenue Stream Segment ID |

**PM Projects → Equipment → Frequency:**
| Field | Record | Contains |
|-------|--------|----------|
| `parent` | Job | Customer ID |
| `custentity_hul_nxc_equip_object` | Job | Object ID |
| `custentity_hul_nxc_eqiup_asset` | Job | Asset ID |
| `custentity_nx_project_type` | Job | PM frequency type (4-15) |
| `cseg_sna_revenue_st` | Job | Revenue Stream (263=PM, 18=AN, 19=CO) |

**PM Frequency Mapping:**
| Type ID | Interval | Days |
|---------|----------|------|
| 4 | PM 30D | 30 |
| 5 | PM 60D | 60 |
| 6 | PM 90D | 90 |
| 7 | PM 120D | 120 |
| 8 | PM 180D | 180 |
| 10 | PM Daily | 1 |
| 12 | PM 240D | 240 |
| 13 | PM 270D | 270 |
| 14 | PM 360D | 360 |
| 15 | PM 720D | 720 |

### SuiteQL Queries

**Query 1: Identify Leaf Revenue Streams**
```sql
SELECT rs.id, rs.name, rs.custrecord_sna_hul_revstream_path
FROM customrecord_cseg_sna_revenue_st rs
WHERE rs.id NOT IN (
    SELECT DISTINCT parent
    FROM customrecord_cseg_sna_revenue_st
    WHERE parent IS NOT NULL
)
AND rs.isinactive = 'F'
```

**Query 2: Last Invoice per Customer × Equipment × Stream**
```sql
WITH RankedInvoices AS (
    SELECT
        t.entity AS customer_id,
        COALESCE(tl.custcol_sna_object, tl.custcol_sna_hul_fleet_no) AS object_id,
        tl.cseg_sna_revenue_st AS stream_id,
        t.id AS transaction_id,
        t.tranid AS transaction_number,
        t.trandate,
        SUM(ABS(tl.netamount)) OVER (PARTITION BY t.id) AS invoice_total,
        ROW_NUMBER() OVER (
            PARTITION BY t.entity,
                         COALESCE(tl.custcol_sna_object, tl.custcol_sna_hul_fleet_no),
                         tl.cseg_sna_revenue_st
            ORDER BY t.trandate DESC, t.id DESC
        ) AS rn
    FROM transaction t
    INNER JOIN transactionline tl ON t.id = tl.transaction
    WHERE t.type IN ('CustInvc', 'CashSale')
      AND tl.mainline = 'F'
      AND tl.cseg_sna_revenue_st IS NOT NULL
)
SELECT customer_id, object_id, stream_id,
       transaction_id, transaction_number, trandate, invoice_total
FROM RankedInvoices
WHERE rn = 1
```

**Query 3: Last Case per Customer × Equipment × Stream**
```sql
WITH RankedCases AS (
    SELECT
        sc.custevent_nx_customer AS customer_id,
        sc.custevent_sna_hul_case_object AS object_id,
        sc.cseg_sna_revenue_st AS stream_id,
        sc.id AS case_id,
        sc.casenumber,
        sc.createddate,
        ct.name AS case_type,
        ROW_NUMBER() OVER (
            PARTITION BY sc.custevent_nx_customer,
                         sc.custevent_sna_hul_case_object,
                         sc.cseg_sna_revenue_st
            ORDER BY sc.createddate DESC, sc.id DESC
        ) AS rn
    FROM supportcase sc
    LEFT JOIN customlist_nx_case_type ct ON sc.custevent_nx_case_type = ct.id
    WHERE sc.cseg_sna_revenue_st IS NOT NULL
)
SELECT customer_id, object_id, stream_id,
       case_id, casenumber, createddate, case_type
FROM RankedCases
WHERE rn = 1
```

**Query 4: PM Projects with Last Completion**
```sql
SELECT
    j.parent AS customer_id,
    j.custentity_hul_nxc_equip_object AS object_id,
    j.cseg_sna_revenue_st AS stream_id,
    j.id AS project_id,
    j.custentity_nx_project_type AS pm_type,
    CASE j.custentity_nx_project_type
        WHEN 4 THEN 30 WHEN 5 THEN 60 WHEN 6 THEN 90 WHEN 7 THEN 120
        WHEN 8 THEN 180 WHEN 10 THEN 1 WHEN 12 THEN 240 WHEN 13 THEN 270
        WHEN 14 THEN 360 WHEN 15 THEN 720
    END AS frequency_days,
    (SELECT MAX(t.completeddate)
     FROM task t
     WHERE t.company = j.id
       AND t.status = 'COMPLETE') AS last_pm_date,
    (SELECT MIN(t.startdate)
     FROM task t
     WHERE t.company = j.id
       AND t.status = 'NOTSTART') AS next_pm_date
FROM job j
WHERE j.custentity_nx_project_type IN (4,5,6,7,8,10,12,13,14,15)
  AND j.isinactive = 'F'
  AND j.cseg_sna_revenue_st IN (263, 18, 19)  -- PM, AN, CO streams
```

### Data Volume

- ~5,000 active customers
- ~10 leaf revenue streams avg per customer
- ~3 equipment pieces avg (where applicable)
- **Estimated:** 30,000 - 80,000 activity records
- **PM Projects:** ~2,000 active PM agreements

### Governance Considerations

- **MapReduce architecture** handles large data volumes within governance limits
- **Batch processing** at night avoids daytime performance impact
- **Upsert pattern** (find existing or create) prevents duplicate records
- **Chunked queries** for large result sets using paged SuiteQL

---

## 8. Success Metrics

**We will consider this feature successful when:**

1. Sales rep can see last invoice date/amount for any customer × stream combination in < 5 seconds
2. Service manager can identify all customer equipment not covered by PM in one view
3. PM compliance dashboard shows accurate overdue counts (verified against manual check)
4. Revenue leakage report identifies > 0 customers with cases but no invoices (validates data capture)
5. MapReduce completes processing all customers in < 60 minutes
6. Zero duplicate activity records created

**How we'll measure:**
- Manual verification of 10 customer records against source transactions
- Dashboard load time testing
- MapReduce execution log analysis
- Duplicate record search after initial load

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_mr_customer_activity.js | MapReduce | Nightly activity and PM compliance aggregation | Not Started |
| hul_sl_customer_health_dashboard.js | Suitelet | Add activity details tab (modify existing) | Not Started |

### Development Approach

**Phase 1: Core Activity Matrix**
- [ ] Create custom record `customrecord_hul_customer_activity` in NetSuite
- [ ] Identify leaf streams (query or add checkbox field)
- [ ] Create MapReduce script - invoice data aggregation
- [ ] Create MapReduce script - case data aggregation
- [ ] Create MapReduce script - 12-month totals
- [ ] Initial data load (5 years history)
- [ ] Verify data accuracy with test customers

**Phase 2: PM Compliance Integration**
- [ ] Add PM fields to activity record
- [ ] Query PM projects and link to activity records
- [ ] Calculate PM compliance status (On Time/Due Soon/Overdue)
- [ ] Calculate days overdue
- [ ] Aggregate customer-level PM metrics

**Phase 3: Dashboard Enhancement**
- [ ] Add "Activity Details" tab to customer health dashboard
- [ ] Implement customer filter → activity records display
- [ ] Add PM coverage section
- [ ] Add PM compliance indicators
- [ ] Implement CSV export
- [ ] Deploy scheduled script (daily 3 AM)

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Customer with invoices across 5 revenue streams shows 5 activity records
2. Customer with PM project shows PM coverage = Yes, compliance calculated correctly
3. Equipment without PM project shows PM coverage = No
4. Overdue PM (last completion > frequency days ago) shows correct days overdue

**Edge Cases:**
1. Customer with invoice but no equipment (Parts Direct) - equipment field null, record still created
2. Customer with case but no invoice for same stream - both dates populated from respective sources
3. Equipment with multiple PM projects (different streams) - separate activity record per stream
4. PM project with no completed tasks yet - last PM date null, compliance = Overdue
5. Inactive PM project - excluded from PM coverage

**Error Handling:**
1. Missing revenue stream on invoice line - record skipped with log
2. Invalid customer ID - record skipped with error log
3. Query timeout - MapReduce retries with smaller batch

### Test Data Requirements

- 5 test customers with known invoice/case history
- 3 test customers with active PM projects (various frequencies)
- 1 test customer with overdue PM
- 1 test customer with no PM coverage

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator - Full access
- Sales Rep - View activity for assigned customers
- Service Manager - View all activity and PM compliance
- Executive - View summary dashboards

**Permissions required:**
- View Custom Records (customrecord_hul_customer_activity)
- View Customer Records
- View Transaction Records
- View Support Case Records

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Custom record created in sandbox
- [ ] MapReduce script tested with limited customer set
- [ ] Data accuracy verified for 10 test customers
- [ ] Dashboard enhancement reviewed by stakeholders
- [ ] PRD_SCRIPT_INDEX.md updated

### Deployment Steps

1. Create custom record `customrecord_hul_customer_activity` in production
2. Deploy MapReduce script `hul_mr_customer_activity.js`
3. Run initial data load (may need to run overnight)
4. Verify record counts and spot-check data
5. Deploy dashboard enhancement
6. Create scheduled script deployment (daily 3 AM)
7. Monitor execution logs for 1 week

### Rollback Plan

1. Disable scheduled script deployment
2. Dashboard can fall back to existing view (activity tab hidden)
3. Custom records can remain (no harm if not displayed)

---

## 13. Architecture Decision: Integration vs Separation

### Recommendation: **Unified System**

After analyzing the data model, I recommend integrating Customer Activity Matrix and PM Compliance tracking into a **single unified system** rather than separate projects.

**Rationale:**

1. **Same Granularity:** Both track data at Customer × Equipment × Revenue Stream
2. **Shared Infrastructure:** Same MapReduce pattern, same custom record
3. **Complementary Data:** Activity shows engagement, PM shows compliance - both needed for complete picture
4. **Performance:** One record lookup vs two for dashboard display
5. **Maintenance:** Single script to maintain vs two parallel systems

**Alternative Considered: Separate Systems**

| Aspect | Unified | Separate |
|--------|---------|----------|
| Record Count | ~80K | ~80K activity + ~20K PM = 100K |
| MapReduce Scripts | 1 | 2 |
| Dashboard Queries | 1 per customer | 2 per customer |
| Data Consistency | Guaranteed | Must sync |
| Complexity | Moderate | Higher |

**Decision:** Proceed with unified approach.

---

## 14. Open Questions & Risks

### Open Questions

- [x] Should we track all 195 streams or just leaf streams? → **Leaf streams only (~120)**
- [x] Is equipment required? → **Optional (some streams don't have equipment)**
- [x] Real-time vs batch updates? → **Batch (nightly) for Phase 1**
- [ ] Should we add alerts for overdue PMs? → **Defer to Phase 2**
- [ ] How to handle equipment with PM project but no recent tasks? → **Show as "Pending First PM"**

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Data volume exceeds estimates | Low | Medium | Monitor record counts, archive old data if needed |
| MapReduce timeout | Low | High | Chunk processing, optimize queries |
| Stale PM data from Asset records | Medium | Medium | Query directly from tasks, not asset cache |
| Leaf stream identification changes | Low | Low | Query dynamically, don't hardcode |

---

## 15. References & Resources

### Related PRDs
- PRD-20251126-CustomerLifecycleAnalysis.md - Customer Health Scoring
- PRD-20251105-FleetReport.md - Equipment Cost Analysis

### Existing Scripts (PM Related)
- `hul_fsa_maint_data_mr.js` - Populates asset PM fields
- `hul_fsa_maint_data_daily_mr.js` - Daily PM sync
- `hul_mr_customer_health_calc.js` - Health scoring with PM integration
- `hul_lib_customer_health.js` - PM frequency constants

### NetSuite Documentation
- [SuiteScript 2.1 MapReduce](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4387799161.html)
- [N/query Module](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510275060.html)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-11-28 | Thomas Showalter / Claude | 1.0 | Initial draft |

---

## Appendix A: Data Flow Architecture

```
                         ┌─────────────────────────────────────┐
                         │    Nightly MapReduce Script         │
                         │    hul_mr_customer_activity.js      │
                         │    Schedule: 3 AM (after health)    │
                         └─────────────────────────────────────┘
                                          │
         ┌────────────────────────────────┼────────────────────────────────┐
         │                                │                                │
         ▼                                ▼                                ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│ Query: Invoices     │      │ Query: Cases        │      │ Query: PM Projects  │
│ - Last invoice      │      │ - Last case         │      │ - Active projects   │
│ - 12m count/total   │      │ - 12m count         │      │ - Last completion   │
│ per Cust×Equip×Strm │      │ per Cust×Equip×Strm │      │ - Days overdue      │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
         │                                │                                │
         └────────────────────────────────┼────────────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────────┐
                         │  customrecord_hul_customer_activity │
                         │  (Upsert: find existing or create)  │
                         │  ~80,000 records                    │
                         └─────────────────────────────────────┘
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  │                       │                       │
                  ▼                       ▼                       ▼
         ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
         │ Customer Health│      │ Saved Searches │      │ CSV Exports    │
         │ Dashboard      │      │ & Reports      │      │                │
         │ (Activity Tab) │      │                │      │                │
         └────────────────┘      └────────────────┘      └────────────────┘
```

## Appendix B: PM Compliance Status Logic

```javascript
function calculatePMStatus(lastPMDate, frequencyDays, today) {
    if (!lastPMDate) {
        return { status: 'OVERDUE', daysOverdue: null, label: 'Never Completed' };
    }

    var daysSinceLastPM = Math.floor((today - lastPMDate) / (1000 * 60 * 60 * 24));
    var daysUntilDue = frequencyDays - daysSinceLastPM;

    if (daysUntilDue < 0) {
        return {
            status: 'OVERDUE',
            daysOverdue: Math.abs(daysUntilDue),
            label: Math.abs(daysUntilDue) + ' days overdue'
        };
    } else if (daysUntilDue <= 7) {
        return {
            status: 'DUE_SOON',
            daysOverdue: -daysUntilDue,
            label: 'Due in ' + daysUntilDue + ' days'
        };
    } else {
        return {
            status: 'ON_TIME',
            daysOverdue: -daysUntilDue,
            label: 'On Time (' + daysUntilDue + ' days until due)'
        };
    }
}
```

## Appendix C: Customer-Level PM Summary

For the dashboard, aggregate PM compliance at the customer level:

```sql
SELECT
    ca.custrecord_hul_ca_customer AS customer_id,
    COUNT(CASE WHEN ca.custrecord_hul_ca_pm_covered = 'T' THEN 1 END) AS equipment_with_pm,
    COUNT(CASE WHEN ca.custrecord_hul_ca_pm_covered = 'F' AND ca.custrecord_hul_ca_object IS NOT NULL THEN 1 END) AS equipment_without_pm,
    COUNT(CASE WHEN ca.custrecord_hul_ca_pm_status = 1 THEN 1 END) AS pm_on_time,
    COUNT(CASE WHEN ca.custrecord_hul_ca_pm_status = 2 THEN 1 END) AS pm_due_soon,
    COUNT(CASE WHEN ca.custrecord_hul_ca_pm_status = 3 THEN 1 END) AS pm_overdue,
    ROUND(
        COUNT(CASE WHEN ca.custrecord_hul_ca_pm_status = 1 THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN ca.custrecord_hul_ca_pm_covered = 'T' THEN 1 END), 0),
        1
    ) AS pm_compliance_pct
FROM customrecord_hul_customer_activity ca
WHERE ca.custrecord_hul_ca_customer = ?
GROUP BY ca.custrecord_hul_ca_customer
```
