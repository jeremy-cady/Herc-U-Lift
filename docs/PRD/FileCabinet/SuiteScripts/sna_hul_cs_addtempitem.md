# PRD: Temporary Item Suitelet Client Script

**PRD ID:** PRD-UNKNOWN-AddTempItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_addtempitem.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_temporary_item.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the Temporary Item Suitelet that writes user-entered values back to the originating transaction line.

**What problem does it solve?**
Allows users to add temporary items to Sales Orders or Estimates through a guided Suitelet form.

**Primary Goal:**
Validate required inputs and insert a line on the parent transaction.

---

## 2. Goals

1. Validate required temporary item fields.
2. Update the parent transaction line with item, vendor, quantity, and rate values.
3. Reload the Suitelet to allow additional entries.

---

## 3. User Stories

1. **As a** sales user, **I want** to add temporary items **so that** I can include nonstandard items on a transaction.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read Suitelet fields for item, vendor, quantity, rate, description, and ship method.
2. The system must alert the user when required fields are missing.
3. The system must set transaction line fields including item, vendor, vendor item code, quantity, and rate.
4. The system must set `porate` for sales orders and `custcol_sna_hul_estimated_po_rate` for other records.
5. The system must commit the line and reload the Suitelet with `addednew=true`.

### Acceptance Criteria

- [ ] Required fields are enforced with alerts.
- [ ] Line is added to the parent transaction with the entered values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create vendor records.
- Validate item/vendor combinations beyond presence.

---

## 6. Design Considerations

### User Interface
- Runs in a Suitelet popup and updates the opener transaction.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Temporary item entry
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Suitelet UI actions

**Custom Fields:**
- Line | `custcol_sna_hul_item_vendor`
- Line | `custcol_sna_hul_vendor_item_code`
- Line | `custcol_sna_hul_estimated_po_rate`
- Line | `custcol_sna_hul_ship_meth_vendor`

**Saved Searches:**
- None.

### Integration Points
- Uses Suitelet `customscript_sna_hul_sl_temporary_item`.

### Data Requirements

**Data Volume:**
- One line per submission.

**Data Sources:**
- Suitelet form fields and opener transaction.

**Data Retention:**
- Updates transaction line only.

### Technical Constraints
- Uses window.opener to access the parent record.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Client-side only; no server usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temporary item lines are added successfully from the Suitelet.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_addtempitem.js | Client Script | Add temp item line from Suitelet | Implemented |

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Submit Suitelet with valid fields; line added to transaction.

**Edge Cases:**
1. Missing required fields; alert shown and no line added.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users adding temporary items.

**Permissions required:**
- Edit transactions

---

## 12. Deployment Plan

### Deployment Steps

1. Upload `sna_hul_cs_addtempitem.js`.
2. Deploy on the temporary item Suitelet.

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

- [ ] Should the Suitelet validate vendor-item combinations server-side?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Opener record not available | Low | Med | Add guard and user message |

---

## 15. References & Resources

### NetSuite Documentation
- SuiteScript 2.x Client Script

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
