# PRD: Clear Zero Meter Key on Objects (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-ObjectsZeroMeterMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_objects_with_zero_meter_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that finds object records with a meter key value of `'0'` and clears the field.

**What problem does it solve?**
Removes invalid zero meter key values from object records to keep meter tracking accurate.

**Primary Goal:**
Set `custrecord_hul_meter_key_static` to null for object records where it equals `'0'`.

---

## 2. Goals

1. Identify object records with a zero meter key.
2. Clear the meter key field on those records.
3. Process updates in bulk.

---

## 3. User Stories

1. **As an** admin, **I want to** clear invalid meter values **so that** reports are accurate.
2. **As a** support user, **I want** a bulk process **so that** cleanup is efficient.
3. **As a** developer, **I want** the script to be simple and reliable **so that** it can be rerun if needed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query `customrecord_sna_objects` where `custrecord_hul_meter_key_static = '0'`.
2. The system must return a list of matching object IDs.
3. The map stage must submit fields to set `custrecord_hul_meter_key_static` to `null`.
4. Errors must be logged without stopping the process.

### Acceptance Criteria

- [ ] Objects with meter key `'0'` are updated to null.
- [ ] Only matching object records are updated.
- [ ] Errors are logged if any updates fail.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update any other fields on the object record.
- Modify records where the meter key is not `'0'`.
- Provide a UI for execution.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Bulk cleanup without manual edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Object (`customrecord_sna_objects`)

**Script Types:**
- [x] Map/Reduce - Bulk update
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_hul_meter_key_static`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Objects with meter key `'0'`.

**Data Sources:**
- `customrecord_sna_objects` via SuiteQL.

**Data Retention:**
- Updates to existing records only.

### Technical Constraints
- Script currently uses map stage only; no reduce.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Map/Reduce handles batch updates.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Zero meter key values are cleared from object records.

**How we'll measure:**
- Post-run SuiteQL check or saved search.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_objects_with_zero_meter_mr.js | Map/Reduce | Clear zero meter key values | Implemented |

### Development Approach

**Phase 1:** Query
- [x] SuiteQL for meter key = '0'

**Phase 2:** Update
- [x] submitFields to clear meter key

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run script with sample objects having meter key `'0'`; values are cleared.

**Edge Cases:**
1. No objects match; script completes without errors.

**Error Handling:**
1. submitFields errors are logged.

### Test Data Requirements
- Objects with meter key static set to `'0'`.

### Sandbox Setup
- Ensure test object records exist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to object records.

**Permissions required:**
- Edit permission on `customrecord_sna_objects`.

### Data Security
- Updates only a single field value.

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

1. Upload `hul_objects_with_zero_meter_mr.js`.
2. Create Map/Reduce script record.
3. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Verify meter key fields are cleared where applicable.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Restore prior meter key values if needed.

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

- [ ] Should this script run on a schedule or be one-time only?
- [ ] Should a summary email be sent after completion?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Clearing valid zero values | Low | Med | Confirm `'0'` is always invalid |
| Large updates impact governance | Low | Low | Map/Reduce mitigates load |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
