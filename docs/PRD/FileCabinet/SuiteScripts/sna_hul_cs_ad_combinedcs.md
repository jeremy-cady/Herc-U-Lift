# PRD: Combined Sales/Estimate Client Script

**PRD ID:** PRD-UNKNOWN-CombinedCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_ad_combinedcs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A consolidated client script that handles item pricing, rental calculations, temporary items, asset fleet logic, and service/PM pricing for Sales Orders and Estimates.

**What problem does it solve?**
Centralizes pricing and rental logic to keep transactions consistent and reduce duplicated client scripts.

**Primary Goal:**
Drive pricing, rental calculations, and related field updates on transaction entry.

---

## 2. Goals

1. Compute rental pricing and related line fields based on dates, rate cards, and formulas.
2. Apply service pricing logic using revenue streams, equipment categories, and customer pricing groups.
3. Provide entry points for temporary item selection and object selection Suitelets.

---

## 3. User Stories

1. **As a** sales user, **I want** rental pricing calculated automatically **so that** I do not compute rates manually.
2. **As a** service user, **I want** service pricing driven by revenue streams and equipment **so that** rates are correct.
3. **As a** user, **I want** to add temporary items via a Suitelet **so that** ad-hoc items can be added easily.

---

## 4. Functional Requirements

### Core Functionality

1. The system must implement client script entry points: `pageInit`, `lineInit`, `fieldChanged`, `validateField`, `postSourcing`, `validateLine`, and `saveRecord`.
2. The system must compute rental days and hours using transaction dates and line-level rental dates.
3. The system must calculate best price per rental rate card and update rental-related line fields.
4. The system must support temporary item entry via the temporary item Suitelet and update line values.
5. The system must determine service pricing by customer pricing group, revenue stream, equipment category, and other filters.
6. The system must open the "Select Object" Suitelet when prompted.

### Acceptance Criteria

- [ ] Rental line fields update based on dates and rate cards.
- [ ] Service pricing rate lookups return a consistent PM rate.
- [ ] Temporary item Suitelet adds line items correctly.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Replace server-side pricing validations.
- Persist data beyond transaction field updates.
- Provide standalone UI beyond Suitelet popups.

---

## 6. Design Considerations

### User Interface
- Uses alerts and popup Suitelets for selection and warnings.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate
- Customer
- Item
- Project (Job)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for object selection and temp items
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Pricing and rental logic

**Custom Fields (high-level):**
- Rental: `custcol_sna_hul_rent_start_date`, `custcol_sna_hul_rent_end_date`, `custcol_sna_hul_rental_hrs`, `custcol_sna_day_rate`, `custcol_sna_weekly_rate`, `custcol_sna_4week_rate`
- Service pricing: `custbody_sna_hul_cus_pricing_grp`, `cseg_sna_revenue_st`, `custcol_sna_hul_gen_prodpost_grp`
- Temporary items: `custcol_sna_hul_item_vendor`, `custcol_sna_hul_vendor_item_code`, `custcol_sna_hul_estimated_po_rate`

**Saved Searches:**
- Multiple searches for pricing tables, sales zones, equipment categories, and PM rates.

### Integration Points
- Uses `customscript_sna_hul_sl_selectobject` and `customscript_sna_hul_sl_temporary_item` Suitelets.
- Uses `SuiteScripts/moment.js` for date handling.

### Data Requirements

**Data Volume:**
- Per transaction entry and per line updates.

**Data Sources:**
- Customer pricing group, revenue stream, rate cards, and pricing tables.

**Data Retention:**
- Updates transaction line fields only.

### Technical Constraints
- Heavy client-side logic; performance depends on line count and searches.

### Dependencies
- **Libraries needed:** `SuiteScripts/moment.js`.
- **External dependencies:** MathJS API for formula evaluation.

### Governance Considerations
- Client-side searches can slow entry on large transactions.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing and rental fields update correctly during entry.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_ad_combinedcs.js | Client Script | Combined pricing and rental logic | Implemented |

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Enter rental dates and confirm rate/amount fields update.
2. Enter service items with revenue stream and confirm unit pricing.
3. Add temporary items via Suitelet and confirm line values.

**Edge Cases:**
1. Missing customer/location shows alert and blocks Suitelet.
2. Rate card missing; rental calculations skip.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and service users.

**Permissions required:**
- View pricing records and related lists referenced by searches

---

## 12. Deployment Plan

### Deployment Steps

1. Upload `sna_hul_cs_ad_combinedcs.js`.
2. Deploy on Sales Order and Estimate forms.
3. Ensure dependent Suitelets and libraries are deployed.

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

- [ ] Should external MathJS calls be replaced with internal calculations?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client script performance on large orders | Med | Med | Reduce searches and cache results |
| External API dependency fails | Low | Med | Add fallback calculation logic |

---

## 15. References & Resources

### NetSuite Documentation
- SuiteScript 2.x Client Script

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
