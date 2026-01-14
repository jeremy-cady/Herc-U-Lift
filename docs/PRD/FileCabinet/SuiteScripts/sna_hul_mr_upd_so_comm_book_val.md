# PRD: Update SO Commissionable Book Value

**PRD ID:** PRD-UNKNOWN-SoCommBookVal
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_upd_so_comm_book_val.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates the Commissionable Book Value on Sales Order item lines for a specific fleet object.

**What problem does it solve?**
Keeps commissionable book value aligned with updated fleet object values for active Sales Orders.

**Primary Goal:**
Update `custcol_sna_hul_so_commissionable_bv` on matching Sales Order lines.

---

## 2. Goals

1. Identify Sales Orders that reference a specific fleet object and customer.
2. Update the commissionable book value on matching item lines.

---

## 3. User Stories

1. **As a** finance user, **I want** commissionable book values updated on Sales Orders **so that** commissions remain accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read parameters `custscript_sna_mr_upd_so_object`, `custscript_sna_mr_upd_so_cmv`, and `custscript_sna_mr_upd_so_cust_applied`.
2. The script must search for Sales Orders with line-level `custcol_sna_hul_fleet_no` matching the object and status in pending billing/fulfillment.
3. The script must further filter Sales Orders by customer.
4. For each matching Sales Order, the script must update `custcol_sna_hul_so_commissionable_bv` on matching item lines.

### Acceptance Criteria

- [ ] Matching Sales Order lines show the new commissionable book value.
- [ ] Only lines matching the target fleet object are updated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update Sales Orders outside the matching customer or status filters.
- Modify header-level commission data.

---

## 6. Design Considerations

### User Interface
- None; backend update.

### User Experience
- Commission values update without manual line edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)

**Script Types:**
- [x] Map/Reduce - Line-level field update
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order Item | `custcol_sna_hul_fleet_no`
- Sales Order Item | `custcol_sna_hul_so_commissionable_bv`

**Saved Searches:**
- None (script builds searches programmatically).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes Sales Orders matching search criteria.

**Data Sources:**
- Sales Order lines filtered by fleet object and customer.

**Data Retention:**
- No data retention beyond line updates.

### Technical Constraints
- Requires valid fleet object and customer parameters.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Sales Order status filters in search.

### Governance Considerations
- Loads and saves each Sales Order; line updates may be costly for large orders.

---

## 8. Success Metrics

- Commissionable book values updated for all matching Sales Orders.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_upd_so_comm_book_val.js | Map/Reduce | Update commissionable book value on SO lines | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Identify matching Sales Orders.
- **Phase 2:** Update line-level commissionable book value.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Matching Sales Order lines update with new book value.

**Edge Cases:**
1. No matching Sales Orders results in no updates.

**Error Handling:**
1. Invalid parameters should log errors without crash.

### Test Data Requirements
- Sales Orders with fleet number and customer matching input parameters.

### Sandbox Setup
- Provide valid `custscript_sna_mr_upd_so_object` and `custscript_sna_mr_upd_so_cmv` values.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Finance or admin roles.

**Permissions required:**
- Edit Sales Orders.

### Data Security
- Internal commission data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Verify parameter values for object, CMV, and customer.

### Deployment Steps
1. Upload `sna_hul_mr_upd_so_comm_book_val.js`.
2. Deploy Map/Reduce with required parameters.

### Post-Deployment
- Validate updated lines on sample Sales Orders.

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
- [ ] Should updates include additional Sales Order statuses?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large orders increase processing time | Med | Med | Schedule during off-hours |

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
