# PRD: Unique Name Validation Client Script

**PRD ID:** PRD-UNKNOWN-CheckUniqueName
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_checkuniquename.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that prevents duplicate names on selected custom records by checking normalized name values on save.

**What problem does it solve?**
It enforces uniqueness for Item Category, Customer Pricing Group, and Item Discount Group records to avoid duplicates with similar formatting.

**Primary Goal:**
Block saving a record if a normalized name already exists.

---

## 2. Goals

1. Normalize record names for comparison.
2. Search for existing records with the same normalized name.
3. Prevent save and alert the user on duplicates.

---

## 3. User Stories

1. **As an** admin, **I want** duplicate names blocked **so that** reporting and selection lists stay consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On save, the system must read the `name` field and normalize it by lowering case, removing whitespace, and stripping non-alphanumeric characters.
2. The system must search for records of the same type with a matching normalized name.
3. If the record is being edited, the system must exclude the current record ID from the search.
4. If a duplicate exists, the system must alert the user and prevent save.

### Acceptance Criteria

- [ ] Duplicate names are blocked even if punctuation or spacing differs.
- [ ] Existing records can be saved without false positives.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Merge duplicate records.
- Enforce uniqueness across other record types.

---

## 6. Design Considerations

### User Interface
- Uses a simple alert dialog for duplicate detection.

### User Experience
- Users are stopped immediately on save if a duplicate exists.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Category (custom record)
- Customer Pricing Group (custom record)
- Item Discount Group (custom record)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Validation on save

**Custom Fields:**
- Name | `name`

**Saved Searches:**
- None (search created in script).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single-record check per save.

**Data Sources:**
- Current record `name` field.

**Data Retention:**
- None.

### Technical Constraints
- Client-side alert only; does not provide inline field errors.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Custom record types for categories and pricing groups.

### Governance Considerations
- Client-side only; minimal search usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Duplicate names are prevented on all targeted custom records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_checkuniquename.js | Client Script | Block duplicate names | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Add normalized name search and block save.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a unique name and save successfully.

**Edge Cases:**
1. Create a name that only differs by punctuation or spacing.
2. Edit an existing record without changing the name.

**Error Handling:**
1. Search error should allow save only if handled safely.

### Test Data Requirements
- At least one existing record with a known name.

### Sandbox Setup
- Deploy the client script to the targeted custom records.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admins managing category and pricing group records.

**Permissions required:**
- Create and edit custom records.

### Data Security
- Only reads names; no sensitive data stored.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm client script is attached to the correct custom record forms.

### Deployment Steps
1. Upload `sna_hul_cs_checkuniquename.js`.
2. Deploy to the Item Category, Customer Pricing Group, and Item Discount Group records.

### Post-Deployment
- Test creation of new records for duplicates.

### Rollback Plan
- Remove client script deployments from the records.

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
- [ ] Should the alert be replaced with an inline field error?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| False positives from normalization rules | Low | Med | Document normalization approach |

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
