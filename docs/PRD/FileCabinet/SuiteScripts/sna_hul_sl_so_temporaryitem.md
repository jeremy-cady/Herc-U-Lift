# PRD: SO Temporary Item PO Creation

**PRD ID:** PRD-UNKNOWN-SoTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_so_temporaryitem.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that creates special Purchase Orders from a Sales Order for temporary items.

**What problem does it solve?**
Automates PO creation for temp items by vendor and shipping method, including temp inventory assignments.

**Primary Goal:**
Create vendor-specific POs for temporary items and update related POs when quantities differ.

---

## 2. Goals

1. Build POs grouped by vendor and shipping method.
2. Include only temp item categories (including sublet).
3. Set temp item rates and inventory assignments.

---

## 3. User Stories

1. **As a** buyer, **I want to** auto-create temp item POs **so that** purchasing is faster.
2. **As a** planner, **I want to** group POs by vendor and shipping **so that** logistics are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept a JSON body with `soid`, `poinfo`, and flags.
2. The Suitelet must create POs by vendor and shipping method and set PO type.
3. The Suitelet must remove non-temp item lines and lines not matching vendor/ship group.
4. The Suitelet must set temp item rates and inventory assignments when temp codes exist.
5. The Suitelet must update existing POs when quantities differ.

### Acceptance Criteria

- [ ] POs are created per vendor and shipping method group.
- [ ] Non-temp items are removed from temp POs.
- [ ] Temp item lines have correct rate and inventory detail.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create item fulfillments.
- Handle non-temp items.
- Validate vendor pricing beyond provided PO data.

---

## 6. Design Considerations

### User Interface
- No UI; invoked via request body.

### User Experience
- Background PO creation for temp items.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- purchaseorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Create temp item POs
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- SO Line | custcol_sna_hul_item_vendor | Temp vendor
- SO Line | custcol_sna_hul_temp_item_code | Temp item code
- SO Line | custcol_sna_hul_itemcategory | Item category
- SO Line | custcol_sna_hul_temp_porate | Temp PO rate
- SO Line | custcol_sna_hul_ship_meth_vendor | Ship method
- SO Line | custcol_sna_linked_po | Linked PO
- SO Line | custcol_nx_task | Task
- SO Line | custcol_sna_hul_createpo | PO creation type
- SO Line | custcol_sna_po_itemcat | PO item category

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Updates POs to trigger temp item UE logic.

### Data Requirements

**Data Volume:**
- Sales order lines by vendor/ship method.

**Data Sources:**
- Sales order lines

**Data Retention:**
- Creates and updates POs.

### Technical Constraints
- Temp item categories provided as script parameters.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Temp item categories and UE update logic

### Governance Considerations

- **Script governance:** PO creation and line updates.
- **Search governance:** Searches for PO update handling.
- **API limits:** Moderate for large SOs.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temp item POs are created correctly by vendor and ship method.

**How we'll measure:**
- Review created POs and line details.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_so_temporaryitem.js | Suitelet | Create temp item POs | Implemented |

### Development Approach

**Phase 1:** Parameter validation
- [ ] Confirm temp item category parameters

**Phase 2:** PO validation
- [ ] Verify created POs and line filters

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Temp item lines create POs with inventory detail.

**Edge Cases:**
1. Lines with existing linked POs are skipped.
2. Quantity mismatches trigger PO updates.

**Error Handling:**
1. PO save errors are logged and processing continues.

### Test Data Requirements
- Sales order with temp items and temp codes
- Multiple vendors and ship methods

### Sandbox Setup
- Deploy Suitelet and set script parameters

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- Create and edit Purchase Orders

### Data Security
- PO creation should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Temp item categories configured

### Deployment Steps

1. Deploy Suitelet.
2. Trigger from Sales Order workflow.

### Post-Deployment

- [ ] Validate POs and line details

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to manual PO creation.

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

- [ ] Should PO grouping include item category in addition to vendor and ship method?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect category mapping leads to wrong PO content | Med | Med | Validate category parameters regularly |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/record module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
