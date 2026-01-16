# PRD: PO Temporary Item Processing

**PRD ID:** PRD-UNKNOWN-PoTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_po_temporaryitem.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that transforms a Purchase Order into an Item Receipt and Vendor Bill for temporary items.

**What problem does it solve?**
Automates receipt and billing for temporary items with proper inventory assignments and line filtering.

**Primary Goal:**
Auto-create Item Receipts and Vendor Bills for temporary item PO lines.

---

## 2. Goals

1. Transform PO to Item Receipt and set inventory details for temp items.
2. Auto-receive lines when temp item and task are present.
3. Transform PO to Vendor Bill and keep only temp item lines tied to tasks.

---

## 3. User Stories

1. **As a** purchasing user, **I want to** automate temporary item receipts **so that** processing is faster.
2. **As an** AP user, **I want to** auto-generate vendor bills **so that** billing stays aligned with temp items.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must read `poid` from the request body JSON.
2. The Suitelet must transform the PO into an Item Receipt.
3. For temp items with a temp code and matching categories, the Suitelet must set inventory assignment lines.
4. The Suitelet must set `itemreceive` based on whether a task is present.
5. The Suitelet must save the Item Receipt and, if successful, transform the PO to a Vendor Bill.
6. The Vendor Bill must remove lines not matching temp categories or missing tasks.

### Acceptance Criteria

- [ ] Item Receipt is created with inventory assignment for temp items.
- [ ] Vendor Bill only includes valid temp item lines with tasks.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate temp item codes beyond presence.
- Update PO header fields.
- Handle non-temporary item categories.

---

## 6. Design Considerations

### User Interface
- No UI; invoked via request body.

### User Experience
- Automated background processing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder
- itemreceipt
- vendorbill

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - PO transform automation
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- PO Line | custcol_sna_hul_temp_item_code | Temp item code
- PO Line | custcol_sna_hul_itemcategory | Item category
- PO Line | custcol_nx_task | Task
- PO Line | custcol_sna_hul_vendor_name | Vendor name

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- PO line item counts per request.

**Data Sources:**
- PO line fields

**Data Retention:**
- Creates Item Receipt and Vendor Bill.

### Technical Constraints
- Uses script parameters for temp item categories.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Temp item categories on line fields

### Governance Considerations

- **Script governance:** Record transforms and line updates.
- **Search governance:** None.
- **API limits:** Moderate depending on line counts.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item Receipts and Vendor Bills are created correctly for temp items.

**How we'll measure:**
- Review generated IR and VB records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_po_temporaryitem.js | Suitelet | Transform PO for temp items | Implemented |

### Development Approach

**Phase 1:** Parameter validation
- [ ] Confirm temp item categories are configured

**Phase 2:** Transaction validation
- [ ] Test with POs containing temp and non-temp lines

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Temp item lines with tasks produce IR and VB lines.

**Edge Cases:**
1. Non-temp items are not received or billed.
2. Missing task prevents auto-receive and billing for that line.

**Error Handling:**
1. Invalid PO ID results in no transformation.

### Test Data Requirements
- PO with temp items and temp codes
- PO with mixed item categories

### Sandbox Setup
- Deploy Suitelet and configure script parameters

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing or inventory automation roles

**Permissions required:**
- Transform Purchase Orders to Item Receipts and Vendor Bills

### Data Security
- No sensitive data beyond transaction access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Verify temp item category parameters

### Deployment Steps

1. Deploy Suitelet.
2. Call from integration or workflow with PO ID payload.

### Post-Deployment

- [ ] Validate created IR and VB records

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to manual receipt/billing.

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

- [ ] Should the Suitelet validate temp code format?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Misclassified item categories cause incorrect processing | Med | Med | Keep category parameters current |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/record transform

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
