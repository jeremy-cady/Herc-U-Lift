# PRD: Daily Operating Report RESTlet (v2)

**PRD ID:** PRD-UNKNOWN-DailyOperatingReportRESTv2
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/daily-operating-report-restlet-2.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that returns daily operating report data (sales order line revenue, COGS, and margin) with basic summary totals.

**What problem does it solve?**
Provides an API endpoint for pulling a daily operating dataset with margin calculations without running the Map/Reduce.

**Primary Goal:**
Expose daily operating report data via REST for integrations or diagnostics.

---

## 2. Goals

1. Query today’s sales order lines with revenue and cost details.
2. Compute COGS per line using time entry, PO rate, or fulfillment cost.
3. Return a summary breakdown by COGS source.

---

## 3. User Stories

1. **As a** developer, **I want to** fetch daily operating data via REST **so that** I can integrate with dashboards.
2. **As an** analyst, **I want to** see margins and COGS sources **so that** I can validate calculations.
3. **As an** admin, **I want to** test daily report logic in a lighter endpoint **so that** I can debug issues.

---

## 4. Functional Requirements

### Core Functionality

1. The system must handle GET requests only.
2. The system must search sales order lines with:
   - `type = SalesOrd`, `mainline = F`, `taxline = F`
   - `lastmodifieddate` within today’s date range
   - `numbertext` not starting with `R`
3. The system must limit output to the first 100 lines (debug/testing cap).
4. The system must calculate line COGS:
   - Time entry cost when `serviceCodeType = 2` and `linkedTimeEntry` exists.
   - PO rate for temp item `98642` when `custcol_sna_hul_temp_porate` exists.
   - Fulfillment cost derived from item cost * fulfilled quantity.
5. The system must compute gross margin and margin percent per line.
6. The system must return summary totals and per‑COGS‑source breakdown.

### Acceptance Criteria

- [ ] REST response returns `success: true` with summary and lines.
- [ ] Margin fields are calculated for each line.
- [ ] COGS source breakdown includes counts and totals.
- [ ] Errors return `success: false` with message details.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle open-orders mode or parameterized date ranges.
- Return all lines beyond the debug cap.
- Save files to the File Cabinet.

---

## 6. Design Considerations

### User Interface
- None (REST endpoint).

### User Experience
- JSON response optimized for API consumption.

### Design References
- Daily Operating Report Map/Reduce logic.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (line data)
- Time Entry (`timebill`)
- Item Fulfillment (for quantities)
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - API endpoint
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order Line | `custcol_sna_linked_time`
- Sales Order Line | `custcol_sna_so_service_code_type`
- Sales Order Line | `custcol_sna_hul_temp_porate`

**Saved Searches:**
- None (Search API).

### Integration Points
- Consumed by external dashboards or internal scripts.

### Data Requirements

**Data Volume:**
- First 100 lines (debug limit).

**Data Sources:**
- Sales order line search, time entry and item lookups.

**Data Retention:**
- N/A.

### Technical Constraints
- Hardcoded date range (today).
- Debug limit stops after 100 lines.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Item cost relies on item record fields (average, last purchase, standard).

### Governance Considerations
- Multiple searches per line; usage can grow if cap increased.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- REST response returns correct margin calculations for sample lines.
- COGS source distribution matches expectations.

**How we'll measure:**
- Spot checks against Map/Reduce outputs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| daily-operating-report-restlet-2.js | RESTlet | Daily operating data endpoint | Implemented |

### Development Approach

**Phase 1:** Core endpoint
- [x] Sales order line search
- [x] COGS calculations
- [x] Summary totals

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. GET request returns summary and lines for today.

**Edge Cases:**
1. No lines today → summary totals zero.
2. Temp item without PO rate → COGS source `noFulfillmentCost`.

**Error Handling:**
1. Search errors return `success: false`.

### Test Data Requirements
- Sales orders modified today with service and inventory lines.

### Sandbox Setup
- Deploy RESTlet and call via RESTlet tester.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles calling the RESTlet.

**Permissions required:**
- View Sales Orders, Items, Time Entries, Item Fulfillments.

### Data Security
- RESTlet exposes transactional data; restrict token/role access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy RESTlet and assign integration role.
2. Validate response payload and security.

### Post-Deployment

- [ ] Monitor logs for errors.

### Rollback Plan

**If deployment fails:**
1. Disable RESTlet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the 100‑line cap be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| RESTlet used for production reporting despite debug cap | Medium | Medium | Document intended usage |

---

## 15. References & Resources

### Related PRDs
- `docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/daily-operating-report-mapreduce.md`

### NetSuite Documentation
- SuiteScript 2.1 RESTlet docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
