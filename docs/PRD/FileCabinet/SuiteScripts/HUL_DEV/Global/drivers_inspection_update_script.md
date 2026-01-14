# PRD: Driver Inspection Date Update

**PRD ID:** PRD-UNKNOWN-DriverInspectionUpdate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/drivers_inspection_update_script.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that updates each employee’s last driver inspection date based on the latest inspection record for their assigned location.

**What problem does it solve?**
Ensures employee records reflect the most recent driver inspection activity by location, and clears outdated dates when no inspection exists.

**Primary Goal:**
Keep `custentity_last_drivers_insp_date` synchronized with the latest inspection per location.

---

## 2. Goals

1. Determine the latest inspection date per location.
2. Update employees’ last inspection date based on their location.
3. Clear dates when no inspection exists for that location.

---

## 3. User Stories

1. **As a** safety manager, **I want to** see the last driver inspection date on employee records **so that** compliance is visible.
2. **As an** admin, **I want to** auto‑sync inspection dates **so that** I don’t update records manually.
3. **As an** auditor, **I want to** trust inspection dates are current **so that** compliance checks are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run as a Scheduled Script.
2. The system must group inspection records by location and take the max datetime:
   - Record type: `customrecord_hul_employee_drivers_inspec`
   - Fields: `custrecord_hul_driveinp_drivers_inp_loc`, `custrecord_hul_driveinp_datetime`
3. The system must search active employees with a location:
   - `custentity_nx_location` not empty
4. For each employee:
   - If a newer inspection date exists for their location, update `custentity_last_drivers_insp_date`.
   - If no inspection exists for the location, clear the field.
5. The system must stop updating if governance drops below 100 units.

### Acceptance Criteria

- [ ] Employees with location inspections show the latest datetime.
- [ ] Employees without location inspections have the field cleared.
- [ ] Updates are logged with counts for updated/cleared/errors.
- [ ] Script respects governance limits.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create inspection records.
- Update inactive employees.
- Validate inspection record contents beyond date/time.

---

## 6. Design Considerations

### User Interface
- None (scheduled processing).

### User Experience
- Employee inspection dates stay current automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record: `customrecord_hul_employee_drivers_inspec`
- Employee

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Nightly/periodic update
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Inspection Record | `custrecord_hul_driveinp_drivers_inp_loc` | Inspection location
- Inspection Record | `custrecord_hul_driveinp_datetime` | Inspection datetime
- Employee | `custentity_nx_location` | Employee location
- Employee | `custentity_last_drivers_insp_date` | Last inspection datetime

**Saved Searches:**
- None (search API used).

### Integration Points
- Employee record maintenance.

### Data Requirements

**Data Volume:**
- One grouped search of inspection records + all active employees with locations.

**Data Sources:**
- Inspection custom records and employee records.

**Data Retention:**
- N/A.

### Technical Constraints
- Governance threshold of 100 units stops updates.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Driver inspection records must be populated.

### Governance Considerations
- Updates are performed per employee; large employee counts can consume usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Employee inspection dates reflect the latest location inspection.
- Manual updates are no longer needed.

**How we'll measure:**
- Spot checks across locations and script audit logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| drivers_inspection_update_script.js | Scheduled Script | Sync last inspection date per employee | Implemented |

### Development Approach

**Phase 1:** Data collection
- [x] Latest inspection by location (summary search)
- [x] Employee list with locations

**Phase 2:** Updates
- [x] Update/clear employee inspection date
- [x] Audit logging

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Location with recent inspection updates all employees at that location.

**Edge Cases:**
1. Employee with location but no inspection → date cleared.
2. Employee already up‑to‑date → no update.

**Error Handling:**
1. submitFields failures are logged and counted.

### Test Data Requirements
- Inspection records across multiple locations.
- Employees with and without location assignments.

### Sandbox Setup
- Deploy scheduled script and run manually.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running scheduled scripts.

**Permissions required:**
- View inspection custom records.
- Edit employee records.

### Data Security
- Employee records are updated; access should be restricted to admin roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy scheduled script.
2. Schedule periodic execution.

### Post-Deployment

- [ ] Review audit logs for updated/cleared counts.

### Rollback Plan

**If deployment fails:**
1. Disable the scheduled script.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the governance threshold be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large employee count hits governance limit | Medium | Medium | Add rescheduling or Map/Reduce |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Scheduled Script docs.
- Search summary columns docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
