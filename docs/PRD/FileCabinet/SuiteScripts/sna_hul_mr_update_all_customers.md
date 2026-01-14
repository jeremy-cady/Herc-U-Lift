# PRD: Update All Customers

**PRD ID:** PRD-UNKNOWN-UpdateAllCustomers
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_update_all_customers.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that loads and saves customer records in bulk to trigger downstream updates.

**What problem does it solve?**
Provides a bulk mechanism to refresh customer records and potentially kick off related sales rep matrix updates.

**Primary Goal:**
Iterate through selected customers and save each record.

---

## 2. Goals

1. Accept a list of customer IDs to update.
2. Load each customer record and save it.
3. Provide a hook for subsequent MR processing (commented in summarize).

---

## 3. User Stories

1. **As a** sales admin, **I want** customer records refreshed in bulk **so that** dependent logic can re-evaluate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read customer IDs from parameter `custscript_sna_hul_customer_id` (JSON array).
2. The script must search active customers matching the provided IDs.
3. The script must load and save each customer record.
4. The script must log remaining usage during summarize.

### Acceptance Criteria

- [ ] Each provided customer ID is processed and saved.
- [ ] Inactive customers are excluded.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify specific customer fields directly.
- Execute the sales rep matrix MR (currently commented out).

---

## 6. Design Considerations

### User Interface
- None; backend record refresh.

### User Experience
- Customer updates run in batch without manual record edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer (`customer`)
- Script Deployment (for internal MR orchestration logic)

**Script Types:**
- [x] Map/Reduce - Customer refresh
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None explicitly referenced.

**Saved Searches:**
- None (search is constructed in script).

### Integration Points
- Potential MR trigger via `N/task` (logic defined but not invoked).

### Data Requirements

**Data Volume:**
- Processes the provided list of customers.

**Data Sources:**
- Customer records passed by parameter.

**Data Retention:**
- No data retention beyond record saves.

### Technical Constraints
- Requires valid customer IDs and active status.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Optional downstream MR script `customscript_sna_hul_mr_upd_matrix_oncus` if enabled.

### Governance Considerations
- One record load/save per customer.

---

## 8. Success Metrics

- All specified customers are saved without errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_update_all_customers.js | Map/Reduce | Load/save customers in bulk | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Build customer list from parameters.
- **Phase 2:** Load and save each customer record.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Valid customer IDs are loaded and saved.

**Edge Cases:**
1. Empty input list results in no processing.

**Error Handling:**
1. Invalid customer ID logs an error and continues.

### Test Data Requirements
- A list of active customer IDs.

### Sandbox Setup
- Provide `custscript_sna_hul_customer_id` parameter as JSON array.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or sales admin roles.

**Permissions required:**
- Edit Customer records.

### Data Security
- Customer data remains within standard role access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm customer ID list format and size.

### Deployment Steps
1. Upload `sna_hul_mr_update_all_customers.js`.
2. Deploy Map/Reduce with customer ID parameter.

### Post-Deployment
- Spot-check a sample customer to confirm save occurred.

### Rollback Plan
- Disable the script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should the downstream sales rep matrix MR be re-enabled in summarize?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large customer lists may increase runtime | Med | Med | Batch customer IDs into smaller runs |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
