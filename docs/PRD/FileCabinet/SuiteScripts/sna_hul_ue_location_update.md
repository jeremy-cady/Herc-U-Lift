# PRD: Location Responsibility Center Update

**PRD ID:** PRD-UNKNOWN-LocationUpdate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_location_update.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that updates location responsibility center code and formats a printable address field.

**What problem does it solve?**
Keeps responsibility center codes in sync with location type and produces a formatted address for documents.

**Primary Goal:**
Populate responsibility center and address PDF fields on location create/edit.

---

## 2. Goals

1. Set responsibility center code based on location type and parent.
2. Build formatted address string for a custom address field.

---

## 3. User Stories

1. **As an** admin, **I want to** keep responsibility center codes updated **so that** reporting is consistent.
2. **As a** document user, **I want to** show a formatted location address **so that** PDFs look correct.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Location create/edit.
2. If Location Type is Central (1), set `custrecord_sna_hul_res_cntr_code` to `custrecord_hul_code`.
3. If Location Type is Van (2), set `custrecord_sna_hul_res_cntr_code` to parent location's `custrecord_hul_code`.
4. Build a formatted address string from the mainaddress subrecord and store in `custrecord_sna_hul_address_pdf`.
5. Save the location with updated fields.

### Acceptance Criteria

- [ ] Responsibility center code is set based on location type.
- [ ] Address PDF field contains formatted address data.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate address completeness.
- Update locations outside create/edit events.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Responsibility center code and address display update automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Update location fields
- [ ] Client Script - N/A

**Custom Fields:**
- location | custrecord_hul_loc_type | Location type
- location | custrecord_hul_code | HUL code
- location | custrecord_sna_hul_res_cntr_code | Responsibility center code
- location | custrecord_sna_hul_address_pdf | Address PDF string

**Saved Searches:**
- Lookup of parent location's `custrecord_hul_code`.

### Integration Points
- Uses mainaddress subrecord for address formatting.

### Data Requirements

**Data Volume:**
- One location load/save per create/edit.

**Data Sources:**
- Location and parent location data.

**Data Retention:**
- Updates location fields.

### Technical Constraints
- Address formatting uses HTML line breaks.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Location hierarchy

### Governance Considerations

- **Script governance:** One load/save per location.
- **Search governance:** LookupFields for parent location.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Responsibility center codes and address fields update on location edits.

**How we'll measure:**
- Review location records after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_location_update.js | User Event | Update location fields | Implemented |

### Development Approach

**Phase 1:** Responsibility center
- [ ] Validate code selection logic

**Phase 2:** Address formatting
- [ ] Validate address PDF formatting

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Central location sets responsibility center from HUL code.
2. Van location inherits responsibility center from parent.

**Edge Cases:**
1. Missing parent location results in blank responsibility center.

**Error Handling:**
1. Save errors are logged.

### Test Data Requirements
- Locations with different types and parent relationships

### Sandbox Setup
- Deploy User Event on Location.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin roles

**Permissions required:**
- Edit locations

### Data Security
- Location data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm custom fields on Location record

### Deployment Steps

1. Deploy User Event on Location.
2. Validate responsibility center and address PDF fields.

### Post-Deployment

- [ ] Monitor logs for save errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update location fields manually if needed.

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

- [ ] Should address formatting be localized by country?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| HTML formatting not supported in target field | Low | Low | Confirm field rendering behavior |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
