# PRD: Combined Pricing, Rental, and Service Client Script

**PRD ID:** PRD-UNKNOWN-CombinedCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_ad_combinedcs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A combined client script that handles item pricing, rental pricing, temporary items, service pricing, and related UI behaviors across sales transactions.

**What problem does it solve?**
Centralizes multiple client-side pricing and rental workflows into a single script so sales users can price items, rentals, and services consistently.

**Primary Goal:**
Automate pricing and rental calculations and enforce line-level behaviors in the UI.

---

## 2. Goals

1. Apply item pricing logic based on customer pricing groups and item attributes.
2. Calculate rental pricing based on rate cards, dates, and rental rules.
3. Support service pricing logic with revenue stream and equipment category rules.

---

## 3. User Stories

1. **As a** sales rep, **I want** pricing calculated automatically **so that** I do not adjust rates manually.
2. **As a** dispatcher, **I want** rental line quantities and rates updated **so that** rental charges are accurate.
3. **As an** admin, **I want** pricing rules centralized **so that** changes are easier to maintain.

---

## 4. Functional Requirements

### Core Functionality

1. The system must handle client events: `pageInit`, `lineInit`, `fieldChanged`, `validateField`, `postSourcing`, `validateLine`, and `saveRecord`.
2. The system must evaluate customer pricing groups, sales zones, and item data to derive pricing rules.
3. The system must calculate rental pricing based on:
   - Rate cards
   - Rental start/end dates
   - Time unit, quantity, and best price tables
4. The system must support service pricing rules including equipment category, revenue stream, and customer pricing group.
5. The system must enforce line behaviors such as locked rates, temporary items, and service pricing validations.
6. The system must provide helper functions for common lookups and search pagination.
7. The system must handle date formatting and utility functions for UI display and calculations.

### Acceptance Criteria

- [ ] Line pricing updates when relevant fields change.
- [ ] Rental lines calculate correct time quantities and rates.
- [ ] Service pricing uses the correct pricing tables and revenue streams.
- [ ] Client validations prevent invalid line configurations.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform server-side pricing calculations.
- Persist data outside of transaction lines.
- Replace backend pricing integrations.

---

## 6. Design Considerations

### User Interface
- Extensive client-side behavior on transaction forms.

### User Experience
- Users receive immediate pricing updates and validations during entry.

### Design References
- Custom pricing tables and equipment category records.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order, Estimate, Return Authorization, and related sales transactions
- Customer, Item, Project/Job
- Custom pricing records (PM pricing, resource pricing, rental rate cards)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used indirectly via URL helpers
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Pricing and rental UI behaviors

**Custom Fields:**
- Rental fields: `custcol_sna_hul_rent_start_date`, `custcol_sna_hul_rent_end_date`, `custcol_sna_hul_time_unit`, `custcol_sna_hul_rental_hrs`
- Pricing fields: `custcol_sna_day_rate`, `custcol_sna_weekly_rate`, `custcol_sna_4week_rate`, `custcol_sna_day_bestprice`, `custcol_sna_week_bestprice`
- Segment fields: `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`
- Various custom pricing and configuration fields referenced in the script

**Saved Searches:**
- Pricing lookups and supporting searches defined in the script.

### Integration Points
- None directly; uses NetSuite search and record lookups.

### Data Requirements

**Data Volume:**
- Per-line calculations across transaction lines.

**Data Sources:**
- Custom pricing tables, customer data, and item attributes.

**Data Retention:**
- Updates transaction line fields only.

### Technical Constraints
- Large client script with multiple responsibilities.
- Uses extensive search lookups which can affect UI performance.

### Dependencies
- **Libraries needed:** `SuiteScripts/moment.js`.
- **External dependencies:** None.
- **Other features:** Custom records for pricing and rate card configuration.

### Governance Considerations
- Client-side search and lookup usage should be monitored for performance.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing and rental calculations match expected business rules in the UI.

**How we'll measure:**
- User verification and reduced manual overrides.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_ad_combinedcs.js | Client Script | Combined pricing/rental/service logic | Implemented |

### Development Approach

**Phase 1:** Pricing logic
- [x] Implement service and item pricing calculations.

**Phase 2:** Rental logic
- [x] Implement rental rate and quantity calculations.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add a rental line and verify quantity/rate calculations.
2. Add service line and verify pricing rules apply.
3. Change key fields and verify client recalculations.

**Edge Cases:**
1. Missing pricing tables or rate cards.
2. Locked rates that should not be overridden.

**Error Handling:**
1. Search failures should be logged and not break the UI.

### Test Data Requirements
- Items and customers with pricing configurations.
- Rental rate cards and PM pricing records.

### Sandbox Setup
- Client script deployed on transaction forms with required custom records.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering transactions with pricing logic enabled.

**Permissions required:**
- View access to custom pricing records used by searches.

### Data Security
- No external data is transmitted.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_cs_ad_combinedcs.js`.
2. Deploy to target transaction forms.
3. Validate pricing behavior in sandbox.

### Post-Deployment

- [ ] Verify pricing calculations and validations.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from affected forms.

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

- [ ] Should the combined script be split into smaller modules?
- [ ] Are there performance issues on large transactions?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large client script impacts UI performance | Med | Med | Refactor into modules and lazy-load logic |
| Pricing configuration changes break rules | Med | Med | Add admin documentation and validation checks |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/search and N/record modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
