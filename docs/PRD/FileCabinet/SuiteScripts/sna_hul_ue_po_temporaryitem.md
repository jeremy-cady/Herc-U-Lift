# PRD: PO Temporary Item Handling

**PRD ID:** PRD-UNKNOWN-POTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_po_temporaryitem.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that updates special order Purchase Orders for temporary items, syncing temp codes, locations, quantities, and memo from Sales Orders.

**What problem does it solve?**
Ensures temporary item POs reflect the correct Sales Order data and location hierarchy for fulfillment.

**Primary Goal:**
Synchronize temporary item PO lines with their originating Sales Order lines.

---

## 2. Goals

1. Filter PO lines to the selected Sales Order line on create/copy.
2. Copy temp item codes, locations, and memo from SO lines.
3. Align PO quantities to SO quantities for temp items.

---

## 3. User Stories

1. **As a** buyer, **I want to** auto-populate temp item PO details **so that** POs match Sales Order requirements.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeLoad create/copy, the script must remove non-matching lines for a targeted SO line and set the PO memo/ship method.
2. On afterSubmit for special orders/dropship/PO type, the script must sync temp codes, locations, and memo from SO lines.
3. The script must set PO line location to parent of SO location when available.
4. The script must remove PO lines with mismatched ship methods when special order or dropship.

### Acceptance Criteria

- [ ] PO lines match SO line data for temp items.
- [ ] PO line locations and SO location references are set.
- [ ] Non-matching ship method lines are removed on special order/dropship.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create vendor records.
- Auto-receive items (suitelet call is commented).

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Temporary item POs are cleaned and synced automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder
- salesorder
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Temp item PO updates
- [ ] Client Script - N/A

**Custom Fields:**
- purchaseorder | custbody_sna_hul_orderid | Order line key
- purchaseorder | custbody_sna_soline_memo | SO line memo
- purchaseorder line | custcol_sna_hul_temp_item_code | Temp item code
- purchaseorder line | custcol_sna_hul_itemcategory | Item category
- purchaseorder line | custcol_sna_hul_ship_meth_vendor | Ship method vendor
- purchaseorder line | custcol_sna_hul_so_location | SO location
- purchaseorder line | description | Line memo
- salesorder line | custcol_sna_hul_temp_item_code | Temp item code
- salesorder line | custcol_sna_hul_itemcategory | Item category
- salesorder line | custcol_nx_task | NX task
- salesorder line | location | Line location
- salesorder line | memo | Line memo

**Saved Searches:**
- Search on PO lines joined to applied Sales Orders.

### Integration Points
- Uses location parent lookup for line location.

### Data Requirements

**Data Volume:**
- One PO load/save per event; search on PO lines.

**Data Sources:**
- Sales Order line data.

**Data Retention:**
- Updates PO line fields and removes lines.

### Technical Constraints
- Only applies to special orders, dropship, or configured PO type values.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Temp item category parameters

### Governance Considerations

- **Script governance:** Search, line updates, and saves per PO.
- **Search governance:** PO line search per PO.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temp item POs reflect the correct Sales Order line data and locations.

**How we'll measure:**
- Compare PO lines to originating SO lines.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_po_temporaryitem.js | User Event | Sync temp item PO lines | Implemented |

### Development Approach

**Phase 1:** Line filtering
- [ ] Validate removal of non-matching lines on create/copy

**Phase 2:** Line sync
- [ ] Validate temp code, location, and memo updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Special order PO syncs temp item codes and locations from SO.

**Edge Cases:**
1. PO lines with different ship method are removed.
2. Parent location missing uses SO location.

**Error Handling:**
1. Save errors are logged.

### Test Data Requirements
- Sales Order with temp item categories and special order PO

### Sandbox Setup
- Deploy User Event on Purchase Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- Edit Purchase Orders
- View Sales Orders and Locations

### Data Security
- PO and SO data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure temp item category parameters

### Deployment Steps

1. Deploy User Event on Purchase Order.
2. Validate temp item PO line updates.

### Post-Deployment

- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Correct PO lines manually if needed.

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

- [ ] Should the suitelet auto-receive logic be re-enabled?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Removing lines by ship method drops valid items | Low | Med | Validate ship method rules |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
