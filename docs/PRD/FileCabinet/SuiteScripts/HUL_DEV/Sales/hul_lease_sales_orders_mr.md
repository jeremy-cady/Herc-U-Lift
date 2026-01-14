# PRD: Lease Sales Orders Dataset Builder (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-LeaseSalesOrdersMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_mr.js (Map/Reduce)
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that builds a JSON dataset of active lease sales orders and stores it in the File Cabinet for a Suitelet UI to consume.

**What problem does it solve?**
Generates a consistent dataset for a Lease Sales Order viewer, with deterministic file IDs and reduced reliance on file searches.

**Primary Goal:**
Create a JSON dataset of lease sales orders and publish the file ID to cache for immediate Suitelet retrieval.

---

## 2. Goals

1. Query active lease sales orders (Revenue Stream 441).
2. Collect header and billing schedule data per order.
3. Save dataset to File Cabinet and store file ID in cache.

---

## 3. User Stories

1. **As a** user, **I want** a current lease dataset **so that** I can view lease order details in the Suitelet.
2. **As an** admin, **I want** deterministic file retrieval **so that** the Suitelet doesn’t rely on file searches.
3. **As a** developer, **I want** the dataset built via Map/Reduce **so that** it scales safely.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search Sales Orders with:
   - `type = SalesOrd`
   - `mainline = T`
   - `cseg_sna_revenue_st = 441`
   - `status != SalesOrd:C` (not closed)
2. For each order, the system must collect:
   - `internalid`, `tranid`, `trandate`, `entity`, `memo`, `custbody1`
   - `total`, `location`
   - `firstBillDate`, `lastBillDate` from billing schedule lines
3. The system must normalize billing dates to `YYYY-MM-DD`.
4. The system must output one JSON record per sales order and collect results in summarize.
5. The system must write the dataset to a JSON file in the File Cabinet folder specified by:
   - `custscript_hul_output_folder`
6. The system must store the new file ID in cache:
   - Cache name: `hul_dataset_runs`
   - Key: `run_<token>`
7. The token must come from `custscript_hul_run_token` (or timestamp fallback).
8. Errors must be logged during map/reduce/summarize.

### Acceptance Criteria

- [ ] Dataset includes all active lease sales orders.
- [ ] JSON file is created in the configured folder.
- [ ] Cache entry stores the correct file ID for the run token.
- [ ] Billing schedule dates are normalized when possible.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render the dataset UI (handled by Suitelet).
- Create or update sales orders.
- Store historical datasets beyond the JSON file.

---

## 6. Design Considerations

### User Interface
- None (background dataset build).

### User Experience
- Suitelet can fetch the dataset quickly via cached file ID.

### Design References
- Lease Dataset Viewer Suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [x] Map/Reduce - Dataset build
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Uses dataset
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `cseg_sna_revenue_st`
- Sales Order | `custbody1`
- Sales Order | `billingschedule` (sublist)

**Saved Searches:**
- None (search created in script).

### Integration Points
- Suitelet reads cached file ID and JSON file.

### Data Requirements

**Data Volume:**
- All active lease sales orders.

**Data Sources:**
- Sales order search, record load, billing schedule sublist.

**Data Retention:**
- JSON file stored in File Cabinet.

### Technical Constraints
- Requires output folder parameter to be set.
- Billing schedule retrieval handles both sublist and value array formats.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet and client script for UI.

### Governance Considerations
- record.load per sales order; Map/Reduce handles volume.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Lease dataset is available immediately after rebuild.

**How we'll measure:**
- Suitelet download success and dataset size.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_lease_sales_orders_mr.js | Map/Reduce | Build lease SO dataset JSON | Implemented |

### Development Approach

**Phase 1:** Search + map
- [x] Search active lease sales orders
- [x] Load totals and billing dates

**Phase 2:** Summarize + publish
- [x] Save JSON file to File Cabinet
- [x] Cache file ID by run token

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run MR with valid output folder and token; JSON file created and cached.

**Edge Cases:**
1. No output folder parameter; script logs error and exits.
2. Billing schedule missing; dates remain null.

**Error Handling:**
1. Map/reduce errors logged in summarize.

### Test Data Requirements
- Lease sales orders with billing schedules.

### Sandbox Setup
- Set `custscript_hul_output_folder` and `custscript_hul_run_token`.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with sales order and File Cabinet access.

**Permissions required:**
- View Sales Orders
- Create files in File Cabinet
- Access cache (SuiteScript 2.x)

### Data Security
- Dataset stored in File Cabinet; restrict folder permissions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `hul_lease_sales_orders_mr.js`.
2. Create Map/Reduce script record.
3. Configure `custscript_hul_output_folder` and optional `custscript_hul_run_token`.
4. Run from Suitelet or schedule as needed.

### Post-Deployment

- [ ] Verify JSON file creation and cache entry.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable Map/Reduce deployment.
2. Remove stale dataset files if needed.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should dataset retention be managed (purge old files)?
- [ ] Should search filters be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Output folder not configured | Med | High | Validate parameter before run |
| Large order volume | Med | Med | Monitor usage and yields |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_sl.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- Cache API
- File API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
