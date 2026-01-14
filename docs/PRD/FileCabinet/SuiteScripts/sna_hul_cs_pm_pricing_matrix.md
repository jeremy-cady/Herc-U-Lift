# PRD: PM Pricing Matrix Client Script

**PRD ID:** PRD-UNKNOWN-PMPricingMatrix
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_pm_pricing_matrix.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_pm_pricing_matrix.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that integrates the PM Pricing Matrix Suitelet with transaction item lines and handles Suitelet field changes.

**What problem does it solve?**
It allows users to select items and rates from the PM pricing matrix and apply them back to the originating transaction line.

**Primary Goal:**
Populate item, quantity, and rate on a transaction line from the pricing matrix Suitelet.

---

## 2. Goals

1. Open the pricing matrix Suitelet from a transaction line.
2. Apply selected item, quantity, and rate back to the transaction.
3. Refresh the Suitelet view when filter fields change.

---

## 3. User Stories

1. **As a** sales user, **I want** to pick a PM price from a matrix **so that** line pricing is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. When `custcol_sna_select_item` is checked on the item sublist, the script must open the PM Pricing Matrix Suitelet with customer, transaction date, and line parameters.
2. When `custcol_sna_pm_price_matrix_data` is set on a line, the script must parse JSON and set item, price level, quantity, and rate for that line.
3. On Suitelet page init, if required fields are populated, the script must call `submitLine` to return data to the opener.
4. When Suitelet filter fields change (`custpage_sna_item`, `custpage_sna_geography`, `custpage_sna_equipment_type`, `custpage_sna_service_action`, `custpage_sna_object`, `custpage_sna_frequency`, `custpage_sna_quantity`), the script must reload the Suitelet with updated parameters.
5. `submitLine` must write JSON data to the opener line field `custcol_sna_pm_price_matrix_data` and close the window.

### Acceptance Criteria

- [ ] Selecting an item in the matrix updates the transaction line item, quantity, and rate.
- [ ] Suitelet reloads when filter fields change.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate pricing in the client script.
- Validate tax code or amount calculations.

---

## 6. Design Considerations

### User Interface
- Opens a popup window for the pricing matrix Suitelet.

### User Experience
- Updates the transaction line via a JSON payload.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction with item sublist
- Suitelet for PM pricing matrix

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Pricing matrix UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - UI integration

**Custom Fields:**
- Line | `custcol_sna_select_item`
- Line | `custcol_sna_pm_price_matrix_data`
- Suitelet | `custpage_sna_customer`
- Suitelet | `custpage_sna_trandate`
- Suitelet | `custpage_sna_geography`
- Suitelet | `custpage_sna_equipment_type`
- Suitelet | `custpage_sna_service_action`
- Suitelet | `custpage_sna_object`
- Suitelet | `custpage_sna_frequency`
- Suitelet | `custpage_sna_item`
- Suitelet | `custpage_sna_quantity`
- Suitelet | `custpage_sna_pm_rate`
- Suitelet | `custpage_sna_line`

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript_sna_hul_sl_pm_pricing_mtrix` with deployment `customdeploy_sna_hul_sl_pm_pricing_mtrix`.

### Data Requirements

**Data Volume:**
- One JSON payload per line selection.

**Data Sources:**
- Suitelet fields and transaction line fields.

**Data Retention:**
- JSON payload stored on the transaction line field.

### Technical Constraints
- Uses `window.opener` to communicate with the parent transaction.

### Dependencies
- **Libraries needed:** N/currentRecord, N/search, N/url.
- **External dependencies:** None.
- **Other features:** PM Pricing Matrix Suitelet.

### Governance Considerations
- Client-side only; no server governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing matrix selections populate transaction lines correctly.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_pm_pricing_matrix.js | Client Script | Pricing matrix UI and line updates | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Open Suitelet and pass parameters.
- **Phase 2:** Apply selected values back to the line.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select line item pricing from Suitelet; line item and rate updated.

**Edge Cases:**
1. Required Suitelet fields missing; alert shown.
2. JSON payload missing or invalid.

**Error Handling:**
1. Missing opener window should not crash the Suitelet.

### Test Data Requirements
- Transaction with item lines and Suitelet deployment.

### Sandbox Setup
- Deploy client script to transaction and Suitelet contexts.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit transactions and access Suitelet.

### Data Security
- Uses existing transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet script and deployment IDs.

### Deployment Steps
1. Upload `sna_hul_cs_pm_pricing_matrix.js`.
2. Deploy to the PM Pricing Matrix Suitelet and transaction form.

### Post-Deployment
- Verify line updates and Suitelet reloads.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should the tax code be set when applying matrix rates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Popup blocked by browser | Med | Low | Instruct users to allow popups |

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
