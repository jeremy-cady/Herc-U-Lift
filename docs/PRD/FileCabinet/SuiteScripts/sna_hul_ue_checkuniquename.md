# PRD: Check Unique Name

**PRD ID:** PRD-UNKNOWN-CheckUniqueName
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_checkuniquename.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that enforces unique names for Item Category, Customer Pricing Group, and Item Discount Group custom records.

**What problem does it solve?**
Prevents duplicate records based on normalized name values.

**Primary Goal:**
Block creation of duplicate records by checking name uniqueness on submit.

---

## 2. Goals

1. Normalize name values for duplicate checks.
2. Prevent duplicate custom record names on create/edit.

---

## 3. User Stories

1. **As an** admin user, **I want to** prevent duplicate category and pricing group records **so that** data remains clean.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on configured custom records.
2. The script must normalize names (lowercase, remove spaces and symbols).
3. The script must search for existing records with matching normalized name.
4. The script must throw an error if a duplicate exists.

### Acceptance Criteria

- [ ] Duplicate names are blocked on create/edit.
- [ ] Existing record edits do not trigger false duplicates for the same record.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Merge existing duplicates.
- Validate other fields beyond the name.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Users receive an error message for duplicate names.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom record types for item category, customer pricing group, and item discount group

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Duplicate name validation
- [ ] Client Script - N/A

**Custom Fields:**
- Custom record | name | Name field for uniqueness check

**Saved Searches:**
- Uses ad-hoc search with formula normalization on `name`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per submit.

**Data Sources:**
- Current record name field

**Data Retention:**
- No record creation or updates.

### Technical Constraints
- Uniqueness relies on formula normalization; special characters are stripped.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Custom record types

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** Single search per submit.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate custom record names are blocked consistently.

**How we'll measure:**
- Attempt duplicate creation and confirm error.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_checkuniquename.js | User Event | Enforce unique names | Implemented |

### Development Approach

**Phase 1:** Duplicate check
- [ ] Validate normalized name matching

**Phase 2:** Error handling
- [ ] Validate error thrown on duplicates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a unique record name successfully.

**Edge Cases:**
1. Duplicate name with different spacing or punctuation is blocked.

**Error Handling:**
1. Error message stops record save.

### Test Data Requirements
- Two records with the same normalized name

### Sandbox Setup
- Deploy User Event on target custom record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin and data maintenance roles

**Permissions required:**
- Create/edit target custom records

### Data Security
- No sensitive data changes.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm target custom record types are included

### Deployment Steps

1. Deploy User Event on target custom record types.
2. Validate duplicate prevention.

### Post-Deployment

- [ ] Monitor error logs for false positives

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually validate duplicates if needed.

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

- [ ] Should the error message be customized by record type?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Formula normalization misses edge cases | Low | Low | Review normalization rules if duplicates slip through |

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
