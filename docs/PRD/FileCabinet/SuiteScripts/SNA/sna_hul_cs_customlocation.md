# PRD: Custom Location Selector (Client Script)

**PRD ID:** PRD-UNKNOWN-CustomLocationCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_customlocation.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that synchronizes a custom location field with the standard location field and populates a custom location dropdown based on subsidiary.

**What problem does it solve?**
Ensures users select valid locations for the selected subsidiary and keeps the standard `location` field in sync.

**Primary Goal:**
Populate and sync location fields based on subsidiary and custom location selection.

---

## 2. Goals

1. Populate a custom location dropdown with locations for the selected subsidiary.
2. Sync `custbody_sna_hul_location` to the standard `location` field.
3. Provide user-friendly selection behavior on the client.

---

## 3. User Stories

1. **As a** user, **I want** a filtered location list **so that** I only choose valid locations.
2. **As an** admin, **I want** the standard location field synced **so that** downstream processes work.
3. **As a** developer, **I want** client-side filtering **so that** the UI is responsive.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read `subsidiary` and `location` on page initialization.
2. The system must fetch locations filtered by subsidiary and populate `custpage_fld_location` options.
3. The system must select the current location option when it matches the record value.
4. When `custbody_sna_hul_location` changes, the system must set `location` to the same value.
5. The system must handle empty results by inserting a "No Location" option.

### Acceptance Criteria

- [ ] Custom location dropdown is populated with subsidiary locations.
- [ ] Selecting the custom location updates `location`.
- [ ] Current location is pre-selected when available.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate user permissions for location access.
- Modify locations or subsidiaries.
- Provide server-side filtering.

---

## 6. Design Considerations

### User Interface
- Uses a custom select field `custpage_fld_location` on the form.

### User Experience
- Location choices are filtered and pre-selected for convenience.

### Design References
- Custom body field `custbody_sna_hul_location`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Location

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Location field sync and filtering

**Custom Fields:**
- Body | `custbody_sna_hul_location`
- Form field | `custpage_fld_location`

**Saved Searches:**
- None (search created dynamically).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per page init or subsidiary change.

**Data Sources:**
- Location records filtered by subsidiary.

**Data Retention:**
- Updates current record fields only.

### Technical Constraints
- Uses `search.create.promise` to populate select options.
- `pageInit` is defined but not exported (currently commented out).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom form must include `custpage_fld_location`.

### Governance Considerations
- Client-side search per load; minimal but should be monitored.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Location selection is constrained to subsidiary-specific options and standard location is synced.

**How we'll measure:**
- Verify dropdown options and saved `location` values on transactions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_customlocation.js | Client Script | Location filtering and sync | Implemented |

### Development Approach

**Phase 1:** Populate custom location list
- [x] Query locations by subsidiary and populate select.

**Phase 2:** Sync location field
- [x] Update standard `location` on custom field change.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Load a record with subsidiary set; custom location list populates.
2. Change custom location; `location` updates.

**Edge Cases:**
1. Subsidiary has no locations; "No Location" is shown.
2. Custom field missing from form.

**Error Handling:**
1. Search fails; error logged to console.

### Test Data Requirements
- Multiple locations assigned to a subsidiary.

### Sandbox Setup
- Client script deployed on a form with `custpage_fld_location`.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing records with locations.

**Permissions required:**
- View access to location records.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_cs_customlocation.js`.
2. Deploy to forms with custom location fields.
3. Validate location list and sync behavior.

### Post-Deployment

- [ ] Verify location sync on record edits.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

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

- [ ] Should the dropdown refresh when subsidiary changes?
- [ ] Should pageInit be enabled to populate on load?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| `pageInit` not exported so list not populated on load | Med | Med | Export `pageInit` if needed |
| Large location lists slow the UI | Low | Med | Cache results per subsidiary |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
