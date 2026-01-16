# PRD: Validate RW PO

**PRD ID:** PRD-UNKNOWN-ValidateRwPo
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_validate_rw_po.js (Map/Reduce)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Validates Purchase Orders created from the Requisition Worksheet and links them to Sales Order lines.

**What problem does it solve?**
Ensures Sales Order lines reference the correct linked PO when procurement is created from requisition workflows.

**Primary Goal:**
Populate `custcol_sna_linked_po` on Sales Order lines based on PO line data, then clear the validation flag.

---

## 2. Goals

1. Find Purchase Orders flagged for validation.
2. Match PO lines to Sales Order lines by item, vendor, and line ID.
3. Set linked PO references on Sales Order lines.
4. Clear the validation flag on the Purchase Order after processing.

---

## 3. User Stories

1. **As a** procurement user, **I want to** link POs to Sales Order lines **so that** fulfillment and billing are consistent.
2. **As an** admin, **I want to** clear validation flags after processing **so that** records are not reprocessed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search for Purchase Orders where `custbody_sna_hul_validate_with_so` is true.
2. The system must load each PO and collect item, vendor, linked SO, and SO line ID data from PO lines.
3. The system must load linked Sales Orders and set `custcol_sna_linked_po` on matching lines when empty.
4. The system must set `custbody_sna_hul_validate_with_so` to false after successful processing.

### Acceptance Criteria

- [ ] Sales Order lines with matching item, vendor, and line ID receive the PO link.
- [ ] The PO validation flag is cleared after processing.
- [ ] Lines with existing linked PO values are not overwritten.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create Purchase Orders or Sales Orders.
- Update pricing or quantities.
- Reconcile mismatched items or vendors.

---

## 6. Design Considerations

### User Interface
- No UI; Map/Reduce runs via deployment.

### User Experience
- Automated linking without manual edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder
- salesorder

**Script Types:**
- [x] Map/Reduce - Validate and link PO/SO lines
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Purchase Order | custbody_sna_hul_validate_with_so | Validation flag
- Purchase Order | custbody_sna_buy_from | Vendor reference used for matching
- Purchase Order Line | custcol_sna_linked_so | Linked Sales Order
- Purchase Order Line | custcol_sn_hul_so_line_id | Linked SO line ID
- Sales Order Line | custcol_sna_csi_povendor | PO vendor reference on SO line
- Sales Order Line | custcol_sna_linked_po | Linked PO reference

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Requisition Worksheet-generated Purchase Orders.

### Data Requirements

**Data Volume:**
- All POs flagged for validation.

**Data Sources:**
- Purchase Order lines
- Sales Order lines

**Data Retention:**
- Updates existing Sales Orders and POs.

### Technical Constraints
- Record load/save usage for each linked Sales Order.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Requisition Worksheet flow

### Governance Considerations

- **Script governance:** Loads POs and S0s; saves when changes occur.
- **Search governance:** Single search for flagged POs.
- **API limits:** Potentially heavy for large PO sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales Orders reflect linked POs for validated lines.
- Validation flags are cleared after linking.

**How we'll measure:**
- Spot checks of SO lines and PO flags.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_validate_rw_po.js | Map/Reduce | Link PO lines to SO lines | Implemented |

### Development Approach

**Phase 1:** Validate configuration
- [ ] Confirm custom fields exist and are populated

**Phase 2:** Execute and verify
- [ ] Run Map/Reduce
- [ ] Confirm linked PO fields are set

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. PO with linked SO and line IDs updates matching SO lines.

**Edge Cases:**
1. PO lines missing linked SO or line ID are skipped.
2. SO lines already linked are not overwritten.

**Error Handling:**
1. Invalid Sales Order ID does not stop overall processing.

### Test Data Requirements
- PO with linked SO lines and vendor fields
- SO with matching item lines

### Sandbox Setup
- Deploy Map/Reduce and ensure custom fields exist

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or procurement scripting role

**Permissions required:**
- Edit access to Purchase Orders and Sales Orders

### Data Security
- Uses transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm validation flag is used in workflow
- [ ] Validate field mapping

### Deployment Steps

1. Deploy Map/Reduce.
2. Execute on flagged POs.

### Post-Deployment

- [ ] Verify PO flags cleared
- [ ] Confirm linked PO on SO lines

### Rollback Plan

**If deployment fails:**
1. Disable deployment.
2. Re-run after fixing field configuration.

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

- [ ] Should validation include quantity or rate matching?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Mismatched line IDs prevent linking | Med | Med | Ensure SO line ID field is populated on PO creation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- Purchase Order and Sales Order record fields

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
