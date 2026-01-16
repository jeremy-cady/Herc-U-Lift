# PRD: Select Rental Rate Card

**PRD ID:** PRD-UNKNOWN-SelectRateCard
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_selectratecard.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that lists rental rate cards and allows users to select the best match for a rental object.

**What problem does it solve?**
Provides a filtered, prioritized list of rate cards so rental pricing can be determined consistently.

**Primary Goal:**
Select a rental rate card and proceed to the rental costing page.

---

## 2. Goals

1. Display rate cards based on object and customer context.
2. Rank rate cards by matched parameters.
3. Pass the selected rate card to the costing suitelet.

---

## 3. User Stories

1. **As a** rental user, **I want to** select the best rate card **so that** pricing is accurate.
2. **As a** rental user, **I want to** filter by object attributes **so that** rate card matches are relevant.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept parameters for object, customer, price group, location, and line context.
2. The Suitelet must search `customsearch_sna_hul_ratecard` and apply filter expressions based on object attributes.
3. The Suitelet must calculate a counter of matched parameters for ranking.
4. The Suitelet must display a paged list of rate cards with match counters and details.
5. The Suitelet must redirect to `sna_hul_sl_costingpage` with the selected rate card and context.

### Acceptance Criteria

- [ ] Rate cards are ranked by match counters.
- [ ] Selected rate card is passed to the rental costing flow.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update rate cards.
- Calculate rental totals directly.
- Validate user permissions for rate card access.

---

## 6. Design Considerations

### User Interface
- Form titled "Select Rental Rate Card" with object context and rate card list.

### User Experience
- Select and proceed to costing with a single submit.

### Design References
- Client script `sna_hul_cs_selectratecard.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_rental_rate_card
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Rate card selection UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Rate Card | custrecord_sna_hul_ratecard_custpricegrp | Customer price group
- Rate Card | custrecord_sna_hul_ratecard_object | Object
- Rate Card | custrecord_sna_hul_ratecard_customer | Customer
- Rate Card | custrecord_sna_hul_ratecard_eqmodel | Equipment model
- Rate Card | cseg_sna_hul_eq_seg | Equipment segment
- Rate Card | cseg_hul_mfg | Manufacturer
- Rate Card | custrecord_sna_hul_ratecard_respcenter | Responsibility center
- Rate Card | custrecord_sna_hul_ratecard_height | Height
- Rate Card | custrecord_sna_hul_ratecard_min_cap | Min capacity
- Rate Card | custrecord_sna_hul_ratecard_max_cap | Max capacity

**Saved Searches:**
- customsearch_sna_hul_ratecard

### Integration Points
- Redirects to `sna_hul_sl_costingpage`.

### Data Requirements

**Data Volume:**
- Rate card records with paging.

**Data Sources:**
- Rate card and object records

**Data Retention:**
- No data changes.

### Technical Constraints
- Match counter logic influences ranking and default selection.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental costing suitelet

### Governance Considerations

- **Script governance:** Search paging and object lookups.
- **Search governance:** Filter expressions on rate card search.
- **API limits:** Moderate with large rate card sets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users select an appropriate rate card with correct ranking.

**How we'll measure:**
- Validate selected card against expected matches.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_selectratecard.js | Suitelet | Select rental rate cards | Implemented |

### Development Approach

**Phase 1:** Filter validation
- [ ] Confirm search filters and ranking

**Phase 2:** Flow validation
- [ ] Test redirect to rental costing

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Rate cards display and selection redirects.

**Edge Cases:**
1. No matches shows empty list.
2. Show All overrides filters.

**Error Handling:**
1. Invalid object ID defaults to broader search.

### Test Data Requirements
- Rate cards with various attributes
- Object with segment, model, and capacity

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
- Pricing data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Rate card search exists and is up to date

### Deployment Steps

1. Deploy Suitelet.
2. Link from rental flow.

### Post-Deployment

- [ ] Validate rate card selection

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to manual selection.

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

- [ ] Should match weighting prioritize customer-specific cards over object-specific cards?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Ranking logic picks suboptimal rate card | Med | Med | Review counter logic with business users |

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
