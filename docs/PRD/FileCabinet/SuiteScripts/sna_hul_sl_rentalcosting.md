# PRD: Rental Costing

**PRD ID:** PRD-UNKNOWN-RentalCosting
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_rentalcosting.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays rental costing inputs and calculated defaults based on a rental rate card.

**What problem does it solve?**
Provides a structured UI for rental pricing inputs and default charge calculations.

**Primary Goal:**
Collect rental costing inputs and display default charges based on the selected rate card.

---

## 2. Goals

1. Render a rental costing form with general, default charge, add-on, and total fields.
2. Populate default values from rate card and sublist records.
3. Provide guidance for best price selection and time unit pricing.

---

## 3. User Stories

1. **As a** rental user, **I want to** see rate card defaults **so that** pricing is consistent.
2. **As a** rental user, **I want to** enter rental dates and time units **so that** costs are calculated correctly.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept parameters such as object, rate card, customer, dates, and location.
2. The Suitelet must load rate card values and rate card sublist pricing based on transaction date.
3. The Suitelet must populate default charge fields and totals when available.
4. The Suitelet must compute earliest available date from object expected return date.
5. On submit, the Suitelet must close the window without saving data.

### Acceptance Criteria

- [ ] Form fields populate based on the selected rate card.
- [ ] Default charge fields are disabled when no rate card is selected.
- [ ] Earliest available date is derived from object expected return date.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save changes to the sales order line.
- Calculate final invoice totals.
- Validate all user input beyond required fields.

---

## 6. Design Considerations

### User Interface
- Form titled "Rental Costing" with grouped sections and a Submit button.

### User Experience
- Defaults are auto-populated to reduce manual entry.

### Design References
- Client script `sna_hul_cs_rentalcosting.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_rental_rate_card
- customrecord_sna_hul_rate_card_sublist
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Rental costing UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_description | Rate card description
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_ldw_item | LDW item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_ldwpercent | LDW percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_cdw_item | CDW item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_cdwpercent | CDW percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_lis_item | LIS item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_lispercent | LIS percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_envi_item | Environment item
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_envipercent | Environment percent
- customrecord_sna_hul_rental_rate_card | custrecord_sna_hul_ratecard_m1chargecode | M1 charge code
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_time_unit_price | Time unit price
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_start_date | Effective start
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_effective_end_date | Effective end
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_m1_units_included | M1 units
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_m1_unit_price | M1 unit price
- customrecord_sna_hul_rate_card_sublist | custrecord_sna_hul_rent_time_unit | Time unit
- Object | custrecord_sna_exp_rental_return_date | Expected return date

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Client script handles calculations and line updates.

### Data Requirements

**Data Volume:**
- Rate card and sublist records per request.

**Data Sources:**
- Rate card and object records

**Data Retention:**
- No data changes in Suitelet.

### Technical Constraints
- Rate card sublist selection based on date range logic.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental rate card configuration

### Governance Considerations

- **Script governance:** Multiple searches per request.
- **Search governance:** Sublist search can be large.
- **API limits:** Moderate for heavy rate card data.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Default pricing fields populate correctly for a rate card.
- Users can submit and return to the parent flow.

**How we'll measure:**
- Validate UI defaults against rate card records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_rentalcosting.js | Suitelet | Rental costing UI | Implemented |

### Development Approach

**Phase 1:** Rate card validation
- [ ] Confirm rate card and sublist data

**Phase 2:** UI validation
- [ ] Test pricing defaults and submission

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Selected rate card populates default charges and pricing.

**Edge Cases:**
1. No rate card selected disables default charge fields.
2. Object without expected return date defaults to today.

**Error Handling:**
1. Invalid rate card ID results in empty defaults.

### Test Data Requirements
- Rate card with sublist entries
- Object with expected rental return date

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental operations roles

**Permissions required:**
- View access to rate card and object records

### Data Security
- Pricing data should be limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm rate card records exist

### Deployment Steps

1. Deploy Suitelet.
2. Link from rental order entry flow.

### Post-Deployment

- [ ] Validate UI defaults

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove entry point.

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

- [ ] Should calculated totals be written back automatically?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Rate card sublist overlaps cause ambiguous pricing | Med | Med | Ensure date ranges are non-overlapping |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
