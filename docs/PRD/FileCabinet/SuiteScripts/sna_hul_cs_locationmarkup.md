# PRD: Location Markup Validation Client Script

**PRD ID:** PRD-UNKNOWN-LocationMarkup
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_locationmarkup.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enforces unique Item Category and Location combinations on Location Markup records.

**What problem does it solve?**
It prevents duplicate location markup configurations for the same item category and location.

**Primary Goal:**
Block saving duplicate item category and location combinations.

---

## 2. Goals

1. Validate item category and location combinations.
2. Prevent duplicates on save.

---

## 3. User Stories

1. **As an** admin, **I want** location markup records to be unique **so that** pricing rules are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On save, the script must search for existing records with the same `custrecord_sna_hul_itemcat` and `custrecord_sna_hul_loc`.
2. The script must exclude the current record ID from the duplicate check.
3. If a duplicate is found, the script must alert the user and block save.

### Acceptance Criteria

- [ ] Duplicate item category and location combinations are blocked.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Merge or update existing records.
- Validate other fields on the markup record.

---

## 6. Design Considerations

### User Interface
- Uses an alert message to indicate duplicates.

### User Experience
- Users receive immediate feedback on duplicate attempts.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_hul_locationmarkup`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Save validation

**Custom Fields:**
- `custrecord_sna_hul_itemcat`
- `custrecord_sna_hul_loc`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single search per save.

**Data Sources:**
- Location markup custom record fields.

**Data Retention:**
- None.

### Technical Constraints
- Client-side alert only.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Location markup custom record.

### Governance Considerations
- Client-side search on save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate location markup records are prevented.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_locationmarkup.js | Client Script | Validate location markup uniqueness | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Duplicate detection on save.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save a unique item category and location combination; save succeeds.

**Edge Cases:**
1. Attempt to save a duplicate combination; save blocked.

**Error Handling:**
1. Search failure should not allow duplicates.

### Test Data Requirements
- Existing location markup record for a known category and location.

### Sandbox Setup
- Deploy client script to location markup records.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Pricing admins.

**Permissions required:**
- Create and edit location markup records.

### Data Security
- Uses internal record data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm field IDs for item category and location.

### Deployment Steps
1. Upload `sna_hul_cs_locationmarkup.js`.
2. Deploy to location markup record forms.

### Post-Deployment
- Verify duplicate detection.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should duplicate check include inactive records?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| False positives when fields are blank | Low | Low | Require fields before save |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
