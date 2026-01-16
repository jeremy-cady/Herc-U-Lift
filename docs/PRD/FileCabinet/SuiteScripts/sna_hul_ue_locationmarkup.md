# PRD: Location Markup Uniqueness

**PRD ID:** PRD-UNKNOWN-LocationMarkup
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_locationmarkup.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that enforces unique Item Category + Location combinations on Location Markup records.

**What problem does it solve?**
Prevents duplicate location markup records for the same item category and location.

**Primary Goal:**
Block duplicate Item Category + Location records.

---

## 2. Goals

1. Enforce uniqueness for Item Category and Location combinations.

---

## 3. User Stories

1. **As an** admin, **I want to** prevent duplicate location markup records **so that** pricing data remains clean.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on Location Markup records.
2. The script must search for existing records with the same item category and location.
3. The script must throw an error when a duplicate exists.

### Acceptance Criteria

- [ ] Duplicate location markup records are blocked.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Merge or update existing duplicates.
- Validate other fields.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Users receive an error when attempting to create duplicates.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_locationmarkup

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Uniqueness validation
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_locationmarkup | custrecord_sna_hul_itemcat | Item category
- customrecord_sna_hul_locationmarkup | custrecord_sna_hul_loc | Location

**Saved Searches:**
- Search for duplicates on item category and location.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per submit.

**Data Sources:**
- Location Markup records.

**Data Retention:**
- No record updates.

### Technical Constraints
- None.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** None

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** One search per submit.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate location markup records are blocked.

**How we'll measure:**
- Attempt duplicate record creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_locationmarkup.js | User Event | Validate location markup uniqueness | Implemented |

### Development Approach

**Phase 1:** Duplicate check
- [ ] Validate uniqueness enforcement

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create unique item category/location record successfully.

**Edge Cases:**
1. Duplicate combination is blocked.

**Error Handling:**
1. Search errors are logged.

### Test Data Requirements
- Two records with identical item category and location

### Sandbox Setup
- Deploy User Event on Location Markup custom record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin roles

**Permissions required:**
- Edit Location Markup records

### Data Security
- Pricing data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm custom fields on Location Markup record

### Deployment Steps

1. Deploy User Event on Location Markup custom record.
2. Validate duplicate prevention.

### Post-Deployment

- [ ] Monitor logs for validation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Remove duplicates manually if needed.

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

- [ ] Should the uniqueness check be case-insensitive?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate records created via data load bypass | Low | Low | Validate CSV import behavior |

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
