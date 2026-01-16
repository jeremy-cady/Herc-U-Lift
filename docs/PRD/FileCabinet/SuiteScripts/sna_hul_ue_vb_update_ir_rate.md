# PRD: Update Item Receipt Rates from Vendor Bill

**PRD ID:** PRD-UNKNOWN-VbUpdateIrRate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_vb_update_ir_rate.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Updates item receipt line rates to match vendor bill rates when override is selected.

**What problem does it solve?**
Aligns item receipt pricing with vendor bill adjustments to keep inventory costs consistent.

**Primary Goal:**
Propagate vendor bill line rate to related item receipt lines when override is enabled.

---

## 2. Goals

1. Detect vendor bill lines flagged to override IR price.
2. Find related item receipt lines for the vendor bill line.
3. Update item receipt line rate to match vendor bill rate.

---

## 3. User Stories

1. **As a** buyer, **I want to** override IR rates **so that** receipts match vendor billing.
2. **As an** accounting user, **I want to** keep costs consistent **so that** GL postings reflect actual rates.
3. **As a** system admin, **I want to** skip deletes **so that** no accidental updates occur.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit (non-delete), the system must load the vendor bill and iterate item lines.
2. For lines with custcol_sna_override_ir_price true, the system must find related item receipt lines using customsearch_sna_po_ir_vb_trans_con_line.
3. The system must update the related item receipt line rate to the vendor bill rate and save the receipt.

### Acceptance Criteria

- [ ] Item receipt line rates match vendor bill rates when override is enabled.
- [ ] Vendor bills without override do not update receipts.
- [ ] Delete context does not trigger updates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update PO rates directly.
- Handle dropship or special order contexts separately.
- Validate price differences beyond the override flag.

---

## 6. Design Considerations

### User Interface
- Uses custcol_sna_override_ir_price on vendor bill lines.

### User Experience
- Item receipt rates are updated after vendor bill save.

### Design References
- Saved search: customsearch_sna_po_ir_vb_trans_con_line

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Bill
- Item Receipt

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Vendor bill processing
- [ ] Client Script - N/A

**Custom Fields:**
- Vendor Bill line | custcol_sna_override_ir_price | Override IR price

**Saved Searches:**
- customsearch_sna_po_ir_vb_trans_con_line | PO/IR/VB line linkage

### Integration Points
- Saved search to identify related item receipts

### Data Requirements

**Data Volume:**
- Per vendor bill, all item lines.

**Data Sources:**
- Vendor bill lines and related item receipt lines.

**Data Retention:**
- Updates persist on item receipt lines.

### Technical Constraints
- Uses record.load and record.save for each related item receipt.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** PO/IR/VB transaction connection saved search

### Governance Considerations

- **Script governance:** Potentially multiple record loads per line.
- **Search governance:** Saved search per vendor bill line with override.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item receipt rates reflect vendor bill adjustments.

**How we'll measure:**
- Compare IR line rates before/after VB save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_vb_update_ir_rate.js | User Event | Update IR rates from vendor bill | Implemented |

### Development Approach

**Phase 1:** Identify override lines
- [x] Check custcol_sna_override_ir_price on VB lines.

**Phase 2:** Update IR rates
- [x] Find related IR lines and update rate.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save vendor bill with override flag, verify IR line rate updated.

**Edge Cases:**
1. No related IR found, verify no errors.

**Error Handling:**
1. IR save fails, verify error logged.

### Test Data Requirements
- Vendor bill linked to PO and item receipt.
- Saved search customsearch_sna_po_ir_vb_trans_con_line configured.

### Sandbox Setup
- Deploy User Event on vendor bill.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to vendor bills and item receipts.

### Data Security
- Updates limited to item receipt line rate.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Saved search customsearch_sna_po_ir_vb_trans_con_line available.

### Deployment Steps
1. Deploy User Event to vendor bill.

### Post-Deployment
- Validate IR rate updates after VB save.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should updates be batched to reduce record loads for large bills?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing saved search | IR not updated | Ensure search deployment |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
