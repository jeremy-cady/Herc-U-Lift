# PRD: Requisition Worksheet Client Script

**PRD ID:** PRD-UNKNOWN-RequisitionWorksheet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_requisition_worksheet.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_requisition_worksheet.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that supports the Requisition Worksheet Suitelet for building purchase orders from selected items.

**What problem does it solve?**
It manages selection, vendor assignment, and rate calculation on the requisition worksheet.

**Primary Goal:**
Streamline PO creation by managing item selections and vendor pricing in the worksheet.

---

## 2. Goals

1. Track selected item lines and aggregate quantities by item and vendor.
2. Calculate line rates based on vendor pricing rules and quantity breaks.
3. Enforce vendor selection on selected lines.

---

## 3. User Stories

1. **As a** buyer, **I want** rates and vendor details filled automatically **so that** PO creation is faster.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must load temp item category parameters and show confirmation links for created POs when present in the URL.
2. When `list_sna_select` is toggled, the script must ensure a vendor is selected and update item details and rates.
3. The script must aggregate quantities per vendor and item to compute quantity break pricing.
4. The script must set line rates using contract price, base price, purchase price, or quantity break pricing from `list_sna_rate_array`.
5. The script must set line amounts when rate changes and update vendor item names.
6. On save, the script must require vendor selection for all selected lines.
7. The script must prevent shipping method Transfer when selected.
8. The script must update the Suitelet URL when location changes.

### Acceptance Criteria

- [ ] Selected lines require vendors and receive calculated rates.
- [ ] Aggregated quantities drive quantity break pricing.
- [ ] PO creation confirmation links display when available.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create purchase orders directly (Suitelet handles creation).
- Validate inventory availability.

---

## 6. Design Considerations

### User Interface
- Uses confirmation messages for created PO links.
- Hides the NetSuite header for focus.

### User Experience
- Users select lines and see rates update automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Custom Record | `customrecord_sna_hul_vendorprice`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Requisition worksheet UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Worksheet logic

**Custom Fields:**
- Suitelet | `custpage_sna_location`
- Suitelet | `custpage_sna_vendor`
- Suitelet | `custpage_sna_po_type`
- Suitelet | `custpage_sna_department`
- Suitelet | `custpage_sna_item`
- Suitelet | `custpage_sna_sales_order`
- Suitelet | `custpage_sna_shipping_method`
- Suitelet | `custpage_sna_shipmethod_transfer`
- Suitelet | `custpage_sna_item_details`
- Sublist | `list_sna_select`
- Sublist | `list_sna_item`
- Sublist | `list_sna_item_id`
- Sublist | `list_sna_vendor`
- Sublist | `list_sna_quantity`
- Sublist | `list_sna_rate`
- Sublist | `list_sna_rate_array`
- Sublist | `list_sna_amount`
- Sublist | `list_sna_vendor_item_name`
- Sublist | `list_sna_item_category`
- Sublist | `list_sna_potype`

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript_sna_hul_sl_req_worksheet` for refresh.
- Purchase Order links via `url.resolveRecord`.

### Data Requirements

**Data Volume:**
- Aggregation across selected lines.

**Data Sources:**
- Suitelet fields, sublist lines, vendor price data.

**Data Retention:**
- Suitelet field updates only.

### Technical Constraints
- Uses JSON payloads in Suitelet fields for rate arrays.

### Dependencies
- **Libraries needed:** N/currentRecord, N/search, N/runtime, N/url, N/ui/message.
- **External dependencies:** None.
- **Other features:** Vendor price records and PO creation Suitelet.

### Governance Considerations
- Client-side aggregation and search for vendor item names.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Requisition worksheet rates and vendors update correctly for selected lines.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_requisition_worksheet.js | Client Script | Requisition worksheet selections and pricing | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Selection and vendor enforcement.
- **Phase 2:** Quantity break pricing and PO link confirmation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select item lines, assign vendors, and verify rate calculation.

**Edge Cases:**
1. Transfer shipping method selected; validation blocks save.
2. Selected line missing vendor; save blocked.

**Error Handling:**
1. Missing rate array should fall back to base or purchase price.

### Test Data Requirements
- Vendor price records with quantity break pricing.

### Sandbox Setup
- Deploy client script to requisition worksheet Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Purchasing users.

**Permissions required:**
- Access to requisition worksheet Suitelet and vendor price records.

### Data Security
- Uses internal vendor pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet deployment and parameters.

### Deployment Steps
1. Upload `sna_hul_cs_requisition_worksheet.js`.
2. Deploy to the requisition worksheet Suitelet.

### Post-Deployment
- Validate vendor enforcement and rate calculation.

### Rollback Plan
- Remove the client script deployment from the Suitelet.

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
- [ ] Should temp item categories be excluded from rate updates by default?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Quantity aggregation errors across lines | Low | Med | Validate aggregation logic |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
