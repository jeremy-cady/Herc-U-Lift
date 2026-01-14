# PRD: Link Site Asset Address Select (Customer Trigger)

**PRD ID:** PRD-UNKNOWN-LinkSiteAsset
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_linksiteasset.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that loads customers from a saved search and saves each record to trigger a User Event script.

**What problem does it solve?**
It ensures customer site asset address selection logic runs for records missing address data.

**Primary Goal:**
Trigger the Customer Site Asset User Event by saving customer records returned from a saved search.

---

## 2. Goals

1. Load customers from `customsearch_sna_no_address_site_asset`.
2. Save each customer record to trigger the related User Event.

---

## 3. User Stories

1. **As a** data admin, **I want** customer site assets updated for missing addresses **so that** data stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load the saved search `customsearch_sna_no_address_site_asset`.
2. For each result, the script must load the customer record and save it.
3. The script must log the customer ID after save.

### Acceptance Criteria

- [ ] Customer records from the saved search are saved.
- [ ] The related User Event runs on save.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Directly update address fields in this script.

---

## 6. Design Considerations

### User Interface
- None; backend processing.

### User Experience
- Address selection updates occur via User Event on save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer (`search.Type.CUSTOMER`)

**Script Types:**
- [x] Map/Reduce - Batch customer save
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Triggered by this script
- [ ] Client Script - Not used

**Custom Fields:**
- None in this script.

**Saved Searches:**
- `customsearch_sna_no_address_site_asset`

### Integration Points
- User Event script: SNA HUL UE Customer Site Asset (triggered on save).

### Data Requirements

**Data Volume:**
- Customers returned by the saved search.

**Data Sources:**
- Customer records.

**Data Retention:**
- No direct data retention; triggers UE on save.

### Technical Constraints
- Relies on the saved search returning customer records with a grouped customer ID column.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- One customer record load/save per result.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Customer site asset address selection updates run for all returned customers.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_linksiteasset.js | Map/Reduce | Trigger customer save for address select | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load search results.
- **Phase 2:** Load/save each customer to trigger UE.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Customer returned by search is saved and UE updates address data.

**Edge Cases:**
1. Customer record fails to load; script logs error.

**Error Handling:**
1. Search errors should appear in summarize stage logs.

### Test Data Requirements
- Saved search `customsearch_sna_no_address_site_asset` with sample customers.

### Sandbox Setup
- Ensure User Event deployment is active for customer records.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or automation role.

**Permissions required:**
- Edit customer records.

### Data Security
- Internal customer data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm `customsearch_sna_no_address_site_asset` exists and is correct.

### Deployment Steps
1. Upload `sna_hul_mr_linksiteasset.js`.
2. Deploy Map/Reduce with search access.

### Post-Deployment
- Confirm address updates on sample customers.

### Rollback Plan
- Disable script deployment.

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
- [ ] Should this script be scheduled or ad-hoc only?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large customer volumes | Med | Med | Run in off-hours |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
