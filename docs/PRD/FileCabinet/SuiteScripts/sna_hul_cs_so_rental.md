# PRD: Sales Order Rental Line Configurator Client Script

**PRD ID:** PRD-UNKNOWN-SORental
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_so_rental.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_configureobject.js (Suitelet)
- FileCabinet/SuiteScripts/sna_hul_sl_selectobjects.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that supports rental line configuration on Sales Orders by opening configurator Suitelets and applying rate card pricing.

**What problem does it solve?**
It streamlines rental object configuration and ensures rental rate card pricing is applied to line fields.

**Primary Goal:**
Launch rental configuration Suitelets and populate daily, weekly, and four-week rates from selected rate cards.

---

## 2. Goals

1. Open the Configure Object Suitelet from a line action.
2. Retrieve rate card prices by time unit and apply to line fields.
3. Provide a prompt to open the Select Objects Suitelet.

---

## 3. User Stories

1. **As a** sales user, **I want** to configure rental objects and rates **so that** rental pricing is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. When `custcol_sna_configure_object` is checked, the script must open the configurator Suitelet with customer, pricing group, date, and location parameters.
2. The script must reset `custcol_sna_configure_object` to false after opening the Suitelet.
3. When `custcol_sna_rental_rate_card` changes, the script must search rate card sublist records and populate:
   - `custcol_sna_day_rate`
   - `custcol_sna_weekly_rate`
   - `custcol_sna_4week_rate`
4. The rate card selection must respect effective start and end dates and fall back to the most recent record when dates are missing.
5. The `showPrompt` action must open the Select Objects Suitelet and require customer and location values.

### Acceptance Criteria

- [ ] Configurator Suitelet opens for rental service items.
- [ ] Rate card values populate day, week, and four-week rates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate object availability.
- Calculate rental totals or invoice amounts.

---

## 6. Design Considerations

### User Interface
- Opens Suitelet windows for configuration and object selection.

### User Experience
- Users see rates populate automatically after selecting a rate card.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Custom Record | `customrecord_sna_hul_rate_card_sublist`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Configurator and object selection
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Rental line actions

**Custom Fields:**
- Header | `custbody_sna_hul_cus_pricing_grp`
- Line | `custcol_sna_configure_object`
- Line | `custcol_sna_hul_fleet_no`
- Line | `custcol_sna_rental_rate_card`
- Line | `custcol_sna_day_rate`
- Line | `custcol_sna_weekly_rate`
- Line | `custcol_sna_4week_rate`
- Header | `trandate`
- Header | `location`

**Saved Searches:**
- None (search created in script).

### Integration Points
- Suitelets `customscript_sna_hul_sl_configureobject` and `customscript_sna_hul_sl_selectobject`.

### Data Requirements

**Data Volume:**
- Rate card search per line change.

**Data Sources:**
- Rate card sublist records and Sales Order fields.

**Data Retention:**
- Updates Sales Order line fields only.

### Technical Constraints
- Uses script parameters for time unit IDs.

### Dependencies
- **Libraries needed:** N/url, N/format, N/runtime, N/search, N/currentRecord.
- **External dependencies:** None.
- **Other features:** Rental rate card sublist records.

### Governance Considerations
- Client-side searches on rate card change.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental rate card selection populates time unit rates correctly.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_rental.js | Client Script | Open configurator and set rate card pricing | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Suitelet launch for configuration.
- **Phase 2:** Rate card pricing lookup and application.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a rate card; day/week/four-week rates populate.
2. Click configure object and verify Suitelet opens.

**Edge Cases:**
1. Rate card has no effective dates; fallback record used.
2. Customer or location missing; show prompt alerts.

**Error Handling:**
1. Missing rate card records should leave rate fields blank.

### Test Data Requirements
- Rate card sublist records with time unit pricing.

### Sandbox Setup
- Deploy client script to Sales Order form and suitelets.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales and rental users.

**Permissions required:**
- Access to rate card records and Suitelets.

### Data Security
- Uses internal rental pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameters for time unit IDs.

### Deployment Steps
1. Upload `sna_hul_cs_so_rental.js`.
2. Deploy to Sales Order form.

### Post-Deployment
- Validate Suitelet launch and rate card values.

### Rollback Plan
- Remove client script deployment from Sales Order form.

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
- [ ] Should rate card selection validate against rental object eligibility?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Rate card search returns multiple overlapping records | Low | Med | Enforce effective date rules in records |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
