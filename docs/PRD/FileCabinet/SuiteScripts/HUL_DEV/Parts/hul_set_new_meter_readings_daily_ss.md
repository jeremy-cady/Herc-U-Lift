# PRD: Set New Meter Readings Daily (Scheduled Script)

**PRD ID:** PRD-UNKNOWN-SetNewMeterReadingsSS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_set_new_meter_readings_daily_ss.js (Scheduled Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A scheduled script that finds objects with new hour meter readings in the last day and updates the object’s current meter and last reading date.

**What problem does it solve?**
Keeps object records synchronized with newly entered hour meter readings without manual updates.

**Primary Goal:**
Update `custrecord_hul_meter_key_static` and `custrecord_sna_last_meter_reading_m1` for objects with new meter readings in the last 24 hours.

---

## 2. Goals

1. Identify objects with new hour meter readings since yesterday.
2. Update current meter and last reading date fields.
3. Run daily as a scheduled job.

---

## 3. User Stories

1. **As a** service user, **I want** meter readings updated daily **so that** object records stay current.
2. **As an** admin, **I want** automation **so that** manual updates are not needed.
3. **As a** developer, **I want** a scheduled sync **so that** it runs consistently.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query objects with hour meter readings created within the last day.
2. The system must return object ID, reading date, and reading value for each match.
3. For each match, the system must update:
   - `custrecord_hul_meter_key_static` with the latest reading
   - `custrecord_sna_last_meter_reading_m1` with the reading date
4. The system must convert reading date strings into Date objects before updating.
5. Errors must be logged without stopping the run.

### Acceptance Criteria

- [ ] Objects with new readings have updated meter values.
- [ ] Last meter reading date is set based on the reading date.
- [ ] Errors are logged without blocking the schedule.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update objects with no new readings.
- Validate meter readings beyond date presence.
- Create hour meter records.

---

## 6. Design Considerations

### User Interface
- None (background scheduled process).

### User Experience
- Daily sync keeps object data up-to-date.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Object (`customrecord_sna_objects`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [x] Scheduled Script - Daily sync
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_hul_meter_key_static`
- Object | `custrecord_sna_last_meter_reading_m1`
- Hour Meter | `custrecord_sna_hul_object_ref`
- Hour Meter | `custrecord_sna_hul_actual_reading`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Objects with new hour meter readings each day.

**Data Sources:**
- SuiteQL query on hour meter records.

**Data Retention:**
- Updates to object records only.

### Technical Constraints
- Date parsing assumes `MM/DD/YYYY` format.
- If no readings are found, script exits early.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Hour meter records created elsewhere.

### Governance Considerations
- One SuiteQL query plus submitFields per matched object.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Daily meter updates complete without errors.

**How we'll measure:**
- Script logs and spot checks on object records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_set_new_meter_readings_daily_ss.js | Scheduled Script | Daily meter reading sync | Implemented |

### Development Approach

**Phase 1:** Data selection
- [x] SuiteQL for readings created in last day

**Phase 2:** Updates
- [x] Update meter value and last reading date

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a new hour meter reading and verify object updates next run.

**Edge Cases:**
1. No readings in last day; script exits quietly.
2. Invalid date format; update skipped for that record.

**Error Handling:**
1. submitFields errors are logged.

### Test Data Requirements
- Hour meter records created within the last day.

### Sandbox Setup
- Ensure hour meter data exists with recent timestamps.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit permissions on object records.

**Permissions required:**
- Edit on `customrecord_sna_objects`
- View on `customrecord_sna_hul_hour_meter`

### Data Security
- Updates only meter fields.

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

1. Upload `hul_set_new_meter_readings_daily_ss.js`.
2. Create Scheduled Script record.
3. Schedule daily execution.

### Post-Deployment

- [ ] Verify meter updates on object records.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Scheduled Script deployment.
2. Restore meter values if needed.

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

- [ ] Should the query use `created` or `createddate` consistently?
- [ ] Should time zone adjustments be applied?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Date format mismatch | Med | Med | Use format module instead of manual parsing |
| Multiple readings per object | Med | Low | Confirm query returns latest reading |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.md

### NetSuite Documentation
- SuiteScript 2.x Scheduled Script
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
