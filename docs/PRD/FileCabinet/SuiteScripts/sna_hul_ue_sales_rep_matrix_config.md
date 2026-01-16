# PRD: Sales Rep Matrix Configuration

**PRD ID:** PRD-UNKNOWN-SalesRepMatrixConfig
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_config.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that controls Sales Rep Matrix editing and triggers downstream updates when matrix records change.

**What problem does it solve?**
Prevents unintended edits to sales rep assignments, and ensures customer mappings refresh when matrix criteria change.

**Primary Goal:**
Coordinate Sales Rep Matrix maintenance with automated customer and employee updates.

---

## 2. Goals

1. Restrict sales rep edits on matrix mapping records by default.
2. Trigger Map/Reduce updates when key matrix fields change.
3. Stamp assigned-on dates for sales reps added to sales orders.

---

## 3. User Stories

1. **As an** admin, **I want to** lock sales rep fields by default **so that** edits are intentional.
2. **As a** sales operations user, **I want to** refresh customer mappings after matrix changes **so that** commissions are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On matrix mapping load, the script must disable the sales reps field unless `editSalesRep` is passed in the request.
2. On matrix record edit, the script must compare key fields and run the Map/Reduce update when changes are detected.
3. On sales order create, the script must update each referenced sales rep with an assigned-on date.

### Acceptance Criteria

- [ ] Sales rep field is disabled by default on mapping records.
- [ ] Map/Reduce update runs when matrix criteria changes.
- [ ] Sales reps on new orders receive an assigned-on timestamp.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Recalculate commissions directly on sales orders.
- Update sales reps on existing orders.

---

## 6. Design Considerations

### User Interface
- Sales rep field can be unlocked via request parameter.

### User Experience
- Admins can intentionally edit sales reps when needed.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_salesrep_matrix_mapping
- customrecord_sna_sales_rep_matrix
- salesorder
- employee

**Script Types:**
- [ ] Map/Reduce - Triggered by this script
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Matrix configuration and SO updates
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_sales_rep_matrix | custrecord_sna_state | State
- customrecord_sna_sales_rep_matrix | custrecord_sna_county | County
- customrecord_sna_sales_rep_matrix | custrecord_sna_zip_code | Zip code
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_equipment_cat | Equipment category
- customrecord_sna_sales_rep_matrix | custrecord_sna_revenue_streams | Revenue streams
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_manufacturer_cs | Manufacturer
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_sales_reps | Sales reps
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_sales_rep_comm_plan | Commission plan
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_comm_plan_end_date | Plan end date
- salesorder | custcol_sna_sales_rep | Sales rep
- employee | custentity_sna_sales_rep_tran_assignedon | Assigned-on date

**Saved Searches:**
- Script deployment search for available Map/Reduce deployments.

### Integration Points
- Map/Reduce: customscript_sna_hul_mr_upd_matrix_oncus

### Data Requirements

**Data Volume:**
- Matrix change detection is field-compare only.

**Data Sources:**
- Matrix record fields and sales order line sales reps.

**Data Retention:**
- Updates employee assigned-on date fields.

### Technical Constraints
- Uses cached task IDs to avoid overlapping Map/Reduce runs.

### Dependencies
- **Libraries needed:** N/cache, N/task
- **External dependencies:** None
- **Other features:** MR script for updating customers

### Governance Considerations

- **Script governance:** Minimal per record; MR handles heavy updates.
- **Search governance:** Deployment lookup and optional customer zip lookup.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Matrix changes reliably trigger customer updates.

**How we'll measure:**
- Audit logs and MR task submissions after matrix edits.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_sales_rep_matrix_config.js | User Event | Control matrix edits and trigger updates | Implemented |

### Development Approach

**Phase 1:** UI controls
- [ ] Validate sales rep field lock/unlock behavior

**Phase 2:** Update triggers
- [ ] Validate MR scheduling on field changes

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Edit matrix criteria and verify MR task submits.
2. Create sales order and verify employee assigned-on date.

**Edge Cases:**
1. Edit matrix without changes should not schedule MR.

**Error Handling:**
1. Missing MR deployments should log errors without failing save.

### Test Data Requirements
- Matrix records and a sales order with sales reps.

### Sandbox Setup
- Deploy User Event on matrix and sales order records.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales operations admins

**Permissions required:**
- Edit matrix records
- Edit employee records

### Data Security
- Changes scoped to matrix and employee fields only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm MR deployments are active

### Deployment Steps

1. Deploy User Event on matrix and sales order records.
2. Validate MR scheduling and assigned-on updates.

### Post-Deployment

- [ ] Monitor cache entries and MR task status

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Trigger MR manually if needed.

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

- [ ] Should sales rep edits be logged for audit purposes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| MR task contention on frequent edits | Med | Low | Cache-based throttling |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
