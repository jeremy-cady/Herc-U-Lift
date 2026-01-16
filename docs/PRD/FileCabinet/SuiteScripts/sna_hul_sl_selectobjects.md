# PRD: Select Objects

**PRD ID:** PRD-UNKNOWN-SelectObjects
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_selectobjects.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays available rental objects and allows selection for rental workflows.

**What problem does it solve?**
Provides a filtered, paged list of objects so users can pick the correct equipment.

**Primary Goal:**
Select a rental object and pass it to the configuration flow.

---

## 2. Goals

1. Provide search filters for object selection.
2. Display paged results of available objects.
3. Pass selected object to the configure object suitelet.

---

## 3. User Stories

1. **As a** rental user, **I want to** filter objects by segment and location **so that** I can find the right equipment.
2. **As a** rental user, **I want to** select an object and continue **so that** I can configure the order line.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept filters such as object, fleet code, segment, model, manufacturer, and location.
2. The Suitelet must search `customrecord_sna_objects` using the filter criteria.
3. The Suitelet must display paged results with select radio buttons.
4. The Suitelet must redirect to `sna_hul_sl_configureobject` with the selected object and context.

### Acceptance Criteria

- [ ] Filtered object results display in a paged sublist.
- [ ] Selection is passed to the configure object suitelet.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update object records.
- Validate rental eligibility beyond filters.
- Create rental transactions directly.

---

## 6. Design Considerations

### User Interface
- Form titled "Available Objects" with filters and results sublist.

### User Experience
- Paged navigation with select and submit.

### Design References
- Client script `sna_hul_cs_selectobjects.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Object selection UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_hul_rent_dummy | Dummy flag
- customrecord_sna_objects | custrecord_sna_exp_rental_return_date | Expected return date
- customrecord_sna_objects | custrecord_sna_equipment_model | Model
- customrecord_sna_objects | custrecord_sna_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_responsibility_center | Responsibility center

**Saved Searches:**
- None (script builds search at runtime).

### Integration Points
- Redirects to `sna_hul_sl_configureobject`.

### Data Requirements

**Data Volume:**
- Paged object search results.

**Data Sources:**
- Object records and location data.

**Data Retention:**
- No data changes.

### Technical Constraints
- Uses date filtering for earliest available date.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental configuration flow

### Governance Considerations

- **Script governance:** Search paging per request.
- **Search governance:** Dynamic filters with joins.
- **API limits:** Moderate depending on result volume.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can find and select objects efficiently.

**How we'll measure:**
- User feedback and selection accuracy.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_selectobjects.js | Suitelet | Select available objects | Implemented |

### Development Approach

**Phase 1:** Filter validation
- [ ] Confirm filter logic and pagination

**Phase 2:** Flow validation
- [ ] Test redirect to configure object

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Filters return object results and selection redirects.

**Edge Cases:**
1. No results returns empty sublist.
2. Earliest date filter excludes future availability.

**Error Handling:**
1. Invalid filters do not crash the UI.

### Test Data Requirements
- Objects with various segments and availability dates

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental operations roles

**Permissions required:**
- View access to object records

### Data Security
- Object availability data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm redirect target suitelet is deployed

### Deployment Steps

1. Deploy Suitelet.
2. Add entry point in rental flow.

### Post-Deployment

- [ ] Validate selection flow

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert rental flow to prior selection method.

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

- [ ] Should selection allow multi-object selection?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Filter logic excludes valid objects | Low | Med | Review filter criteria with operations |

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
