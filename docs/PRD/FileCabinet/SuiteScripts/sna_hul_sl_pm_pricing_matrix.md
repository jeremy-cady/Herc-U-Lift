# PRD: PM Pricing Matrix

**PRD ID:** PRD-UNKNOWN-PmPricingMatrix
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_pm_pricing_matrix.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that renders a UI to select PM pricing matrix rates for an Estimate line.

**What problem does it solve?**
Provides a filtered view of PM pricing matrix rates and lets users apply a rate back to the calling context.

**Primary Goal:**
Display PM rates based on input filters and allow selection of a rate.

---

## 2. Goals

1. Render a form with PM pricing filters and line context.
2. Fetch and filter PM rates using the pricing matrix library.
3. Present rates in a sublist with a Select action.

---

## 3. User Stories

1. **As a** service user, **I want to** find PM pricing rates **so that** I can set correct line pricing.
2. **As a** dispatcher, **I want to** filter by equipment and service action **so that** results are relevant.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must read parameters for customer, item, line, geography, equipment type, service action, object, and frequency.
2. The Suitelet must call `getPMRates` from `sna_hul_ue_pm_pricing_matrix` to retrieve rates.
3. The Suitelet must filter rates by equipment type (including children), service action, frequency, and object when provided.
4. The Suitelet must display a sublist of rates with a Select button that reloads the page with the selected rate.
5. When Service Action is flat rate, the Quantity field must be disabled and set to 1.

### Acceptance Criteria

- [ ] Sublist shows PM rate rows based on filters.
- [ ] Quantity is forced to 1 for flat rate service actions.
- [ ] Selecting a row updates the rate parameter in the URL.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Save rates to the estimate line directly.
- Create or update PM matrix records.
- Validate pricing beyond filter selection.

---

## 6. Design Considerations

### User Interface
- Form titled "Pricing Matrix" with filter fields and a results sublist.

### User Experience
- Select button applies the rate via URL refresh.

### Design References
- Client script `sna_hul_cs_pm_pricing_matrix.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_cseg_sna_hul_eq_seg
- customrecord_cseg_sna_revenue_st
- customrecord_sna_objects
- customrecord_nx_project_type

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - PM pricing matrix UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_cseg_sna_revenue_st | custrecord_sna_hul_flatrate | Flat rate flag

**Saved Searches:**
- File search for `sna_hul_cs_pm_pricing_matrix.js` client script

### Integration Points
- Library `./sna_hul_ue_pm_pricing_matrix` for rate retrieval.

### Data Requirements

**Data Volume:**
- PM rate records returned by the library.

**Data Sources:**
- Pricing matrix library output

**Data Retention:**
- No data changes.

### Technical Constraints
- Rate selection updates the URL rather than persisting data.

### Dependencies
- **Libraries needed:** ./sna_hul_ue_pm_pricing_matrix
- **External dependencies:** None
- **Other features:** Estimate line update via client script

### Governance Considerations

- **Script governance:** Library call and optional lookup of flat rate flag.
- **Search governance:** File search for client script ID.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can select a PM rate from the matrix.
- Filtering returns the expected rate rows.

**How we'll measure:**
- User confirmation and line pricing updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_pm_pricing_matrix.js | Suitelet | PM pricing matrix selection UI | Implemented |

### Development Approach

**Phase 1:** Validate filters
- [ ] Confirm library returns expected rates

**Phase 2:** UI validation
- [ ] Test selection and URL rate update

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Filters return PM rate rows and selection updates rate.

**Edge Cases:**
1. No item specified hides the sublist.
2. Equipment type filter includes child types.

**Error Handling:**
1. Missing library data returns empty results.

### Test Data Requirements
- PM matrix records covering multiple equipment types and service actions

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service or pricing roles

**Permissions required:**
- View access to relevant custom records

### Data Security
- No sensitive data beyond pricing and object references.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Library script deployed
- [ ] Client script file available

### Deployment Steps

1. Deploy Suitelet.
2. Add launch link from Estimate line.

### Post-Deployment

- [ ] Validate rate selection and filtering

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet deployment.
2. Remove link to Suitelet.

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

- [ ] Should rate selection write back to the line automatically?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Pricing matrix library changes break filters | Low | Med | Keep library and UI in sync |

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
