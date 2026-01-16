# PRD: Update Item Rates by PO Type

**PRD ID:** PRD-UNKNOWN-UpdateItemRate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_update_item_rate.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Updates item rates and amounts based on vendor markup/discount tied to the PO type.

**What problem does it solve?**
Applies vendor-specific pricing adjustments automatically and preserves original rates for future recalculations.

**Primary Goal:**
Recalculate item line rates and amounts using vendor PO type markup/discount percentages.

---

## 2. Goals

1. Determine vendor markup/discount based on PO type.
2. Store original item rate on create.
3. Recalculate line rate and amount on create/edit when enabled.

---

## 3. User Stories

1. **As a** buyer, **I want to** apply vendor markup/discount automatically **so that** line rates are consistent.
2. **As an** admin, **I want to** retain original rates **so that** recalculation is based on the correct baseline.
3. **As a** user, **I want to** control recalculation on edit **so that** updates are intentional.

---

## 4. Functional Requirements

### Core Functionality

1. On create or edit, the system must read custbody_po_type and determine the vendor field for markup/discount.
2. The system must load the vendor markup/discount from the buy-from vendor using the PO type field mapping.
3. On create, the system must store the current line rate into custcol_sna_original_item_rate.
4. On edit, the system must use custcol_sna_original_item_rate as the base for recalculation.
5. For each line, the system must update rate and amount using the markup/discount percentage.
6. On edit, the system must only run when custbody_sna_update_price_markup_disc is true.

### Acceptance Criteria

- [ ] Original item rate is stored on create.
- [ ] Line rate and amount are updated based on vendor percentage.
- [ ] Edit recalculation occurs only when update checkbox is true.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle drop ship or special order exclusion beyond current logic.
- Validate vendor percentage values.
- Recalculate when no vendor or PO type is present.

---

## 6. Design Considerations

### User Interface
- Uses existing header checkbox custbody_sna_update_price_markup_disc.

### User Experience
- Pricing changes occur during save.

### Design References
- Vendor fields for PO type percentages.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order (or deployed transaction type)
- Vendor

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Pricing update
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction header | custbody_po_type | PO type
- Transaction header | custbody_sna_buy_from | Buy-from vendor
- Transaction header | custbody_sna_update_price_markup_disc | Update price checkbox
- Item line | custcol_sna_original_item_rate | Original rate
- Vendor | custentity_sna_hul_emergency | Emergency markup/discount
- Vendor | custentity_sna_hul_truckdown | Truck down markup/discount
- Vendor | custentity_sna_hul_dropship_percent | Drop ship markup/discount
- Vendor | custentity_sna_hul_stock_order | Stock order markup/discount

**Saved Searches:**
- None

### Integration Points
- Vendor record lookup

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- Vendor percentage fields by PO type.

**Data Retention:**
- Original rate stored on line.

### Technical Constraints
- Uses the original rate on edit to avoid compounding changes.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Vendor configuration for markup/discount fields

### Governance Considerations

- **Script governance:** Line iteration with lookupFields.
- **Search governance:** Single vendor lookup per transaction.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Line rates match vendor markup/discount expectations.
- Original rates are preserved for recalculation.

**How we'll measure:**
- Compare calculated rates vs vendor percentage for sample POs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_update_item_rate.js | User Event | Update line rates based on PO type | Implemented |

### Development Approach

**Phase 1:** Vendor lookup
- [x] Map PO type to vendor field and fetch percentage.

**Phase 2:** Line updates
- [x] Store original rate and recalc line rate/amount.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create transaction with PO type and vendor percentage, verify rates updated.
2. Edit transaction with update checkbox true, verify rates recalculated from original rate.

**Edge Cases:**
1. Missing vendor or PO type, verify no changes.

**Error Handling:**
1. Vendor field value missing, verify script skips line updates.

### Test Data Requirements
- Vendors with PO type percentage fields populated.

### Sandbox Setup
- Deploy User Event on target transaction type.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to vendor and transaction records.

### Data Security
- Updates only line rate and amount on the current transaction.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Vendor fields configured for PO type percentages.

### Deployment Steps
1. Deploy User Event to the transaction type.

### Post-Deployment
- Validate pricing on a test transaction.

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
- Should drop ship and special order contexts be excluded explicitly?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Incorrect vendor percentage | Mispriced items | Validate vendor setup |

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
