# PRD: Select Rate Card Suitelet Client Script

**PRD ID:** PRD-UNKNOWN-SelectRateCard
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_selectratecard.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_selectratecard.js (Suitelet)
- FileCabinet/SuiteScripts/sna_hul_sl_configureobject.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the Select Rate Card Suitelet that manages pagination, selection, and navigation back to the object configurator.

**What problem does it solve?**
It lets users select rate cards, preserve filters across pages, and return to the configurator with the chosen rate card.

**Primary Goal:**
Capture selected rate cards and refresh the Suitelet with retained filters.

---

## 2. Goals

1. Track selected rate card IDs on the Suitelet.
2. Preserve filters when paging or toggling show-all.
3. Return to the configurator with selected values.

---

## 3. User Stories

1. **As a** sales user, **I want** to select a rate card and return to configuration **so that** pricing is applied correctly.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must store current filter values in a global state for later comparison.
2. On save, the script must set `custpage_selectedfld` with the selected rate card IDs.
3. When pagination changes, the script must redirect to the Suitelet while retaining selections and filters.
4. When `custpage_showallfld` changes, the script must refresh the Suitelet with updated filters.
5. The back button must redirect to the configurator Suitelet with the selected object and filter parameters.

### Acceptance Criteria

- [ ] Selected rate card IDs are stored in `custpage_selectedfld`.
- [ ] Pagination and show-all retain prior filters.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate rate card eligibility.
- Create or update rate card records.

---

## 6. Design Considerations

### User Interface
- Uses Suitelet redirects to update filters and pagination.

### User Experience
- Selections persist across pages.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Suitelet for rate card selection

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Rate card selection
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Selection and navigation

**Custom Fields:**
- Suitelet | `custpage_selectedfld`
- Suitelet | `custpage_objidfld`
- Suitelet | `custpage_custfld`
- Suitelet | `custpage_custpricegrpfld`
- Suitelet | `custpage_trandtefld`
- Suitelet | `custpage_loccodefld`
- Suitelet | `custpage_fromlinefld`
- Suitelet | `custpage_linenumfld`
- Suitelet | `custpage_showallfld`
- Suitelet | `custpage_ratesublist.custpage_selectsubfld`
- Suitelet | `custpage_ratesublist.custpage_rateidsubfld`

**Saved Searches:**
- None.

### Integration Points
- Redirects to Suitelet `customscript_sna_hul_sl_selectratecard`.
- Back button redirects to `customscript_sna_hul_sl_configureobject`.

### Data Requirements

**Data Volume:**
- Suitelet redirect and selection tracking.

**Data Sources:**
- Suitelet field values and sublist selections.

**Data Retention:**
- Selected rate card IDs stored in `custpage_selectedfld`.

### Technical Constraints
- Uses `window.document.location` for navigation.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/format.
- **External dependencies:** None.
- **Other features:** Configurator Suitelet.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can select a rate card and return to the configurator without losing filters.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_selectratecard.js | Client Script | Rate card selection and navigation | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement selection tracking and redirect.
- **Phase 2:** Add back navigation to configurator.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a rate card and save; selected ID stored.
2. Change page and confirm selections persist.

**Edge Cases:**
1. No selections; `custpage_selectedfld` cleared.

**Error Handling:**
1. Missing filter values should not block navigation.

### Test Data Requirements
- Rate card records available in Suitelet.

### Sandbox Setup
- Deploy client script to the Select Rate Card Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Access to the rate card Suitelet.

### Data Security
- Uses Suitelet data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet script/deployment IDs.

### Deployment Steps
1. Upload `sna_hul_cs_selectratecard.js`.
2. Deploy to the Select Rate Card Suitelet.

### Post-Deployment
- Validate selection persistence and back navigation.

### Rollback Plan
- Remove client script deployment from the Suitelet.

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
- [ ] Should selection be required before returning to configurator?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Filter state lost on unexpected reload | Low | Low | Persist filters in URL |

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
