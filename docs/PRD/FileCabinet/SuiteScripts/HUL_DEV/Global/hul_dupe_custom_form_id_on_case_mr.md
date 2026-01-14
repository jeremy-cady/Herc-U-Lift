# PRD: Backfill Case Custom Form ID (Map/Reduce)

**PRD ID:** PRD-20250804-DupeCaseFormIdMR
**Created:** August 4, 2025
**Last Updated:** August 4, 2025
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_mr.js (Map/Reduce)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce that re-saves Support Case records to trigger a User Event that backfills a custom form ID field.

**What problem does it solve?**
Updates cases where `custevent_hul_custom_form_id` is blank by triggering the User Event logic across a filtered set of cases.

**Primary Goal:**
Trigger the User Event on qualifying cases so the custom form ID is populated.

---

## 2. Goals

1. Identify cases with empty `custevent_hul_custom_form_id`.
2. Re-save those cases to invoke the User Event.
3. Log progress and errors.

---

## 3. User Stories

1. **As an** admin, **I want to** backfill the custom form ID on cases **so that** reporting is accurate.
2. **As a** developer, **I want to** reuse the existing User Event logic **so that** I avoid duplicating code.
3. **As a** manager, **I want to** ensure all cases have a form ID **so that** downstream processes work.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search Support Cases where `custevent_hul_custom_form_id` is empty.
2. The system must filter by case type and department segments:
   - `type` in `1–15` (specified list)
   - `custevent_sna_hul_casedept` in `3,4,18,23,28,34,35,36,37`
3. The system must load each case and save it to trigger the User Event.
4. The system must log errors for map and reduce stages.

### Acceptance Criteria

- [ ] Cases with empty `custevent_hul_custom_form_id` are processed.
- [ ] The User Event is triggered on each case save.
- [ ] Errors are logged in summarize.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Populate the field directly in Map/Reduce.
- Process inactive cases.
- Handle cases outside the specified type/department filters.

---

## 6. Design Considerations

### User Interface
- None (batch processing).

### User Experience
- Background backfill operation; no user interaction.

### Design References
- Depends on the User Event implementation.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case

**Script Types:**
- [x] Map/Reduce - Re-save cases
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Backfill logic (separate script)
- [ ] Client Script - Not used

**Custom Fields:**
- Support Case | `custevent_hul_custom_form_id` | Custom form ID cache
- Support Case | `custevent_sna_hul_casedept` | Case department

**Saved Searches:**
- None (search API used).

### Integration Points
- User Event script (`hul_dupe_custom_form_id_on_case_ue.js`) handles the actual field population.

### Data Requirements

**Data Volume:**
- Cases matching the filters.

**Data Sources:**
- Support case search.

**Data Retention:**
- N/A.

### Technical Constraints
- Relies on User Event side effects.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** User Event must be deployed and active.

### Governance Considerations
- record.load/save per case.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Cases with empty form ID are backfilled after the run.

**How we'll measure:**
- Saved search count for empty `custevent_hul_custom_form_id` before/after run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_dupe_custom_form_id_on_case_mr.js | Map/Reduce | Re-save cases to trigger UE | Implemented |

### Development Approach

**Phase 1:** Case re-save
- [x] Search for blank custom form ID
- [x] Save each case to trigger UE

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Case with blank custom form ID → UE populates after MR run.

**Edge Cases:**
1. Case missing expected fields → error logged.

**Error Handling:**
1. Map/reduce errors logged in summarize.

### Test Data Requirements
- Cases with blank `custevent_hul_custom_form_id`.

### Sandbox Setup
- Deploy MR + UE and run on a limited dataset.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- Edit support cases.

### Data Security
- No sensitive data stored; only re-saves records.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Map/Reduce.
2. Ensure User Event is active.
3. Run on target case set.

### Post-Deployment

- [ ] Verify blank custom form IDs are reduced.

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2025-08-04 | 2025-08-04 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the ID/type filters be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| User Event disabled leads to no backfill | Medium | Medium | Verify UE deployment before run |

---

## 15. References & Resources

### Related PRDs
- `docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_dupe_custom_form_id_on_case_ue.md`

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2025-08-04 | Jeremy Cady | 1.0 | Initial implementation |
