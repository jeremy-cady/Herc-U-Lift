# PRD: Set Current Meter Reading on Equipment Objects (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-SetCurrentMeterReadingMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_set_current_meter_reading_on_equip_obj_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that calculates the latest hour meter reading for equipment objects and updates the object record with that value.

**What problem does it solve?**
Ensures equipment object records reflect the most current meter reading derived from hour meter records.

**Primary Goal:**
Set `custrecord_hul_meter_key_static` to the max hour meter reading per equipment object.

---

## 2. Goals

1. Identify equipment object records with an equipment model.
2. Compute the latest meter reading per object.
3. Update the object meter key field in bulk.

---

## 3. User Stories

1. **As a** service user, **I want** equipment objects to show current meter readings **so that** maintenance data is accurate.
2. **As an** admin, **I want** a bulk update process **so that** meter values are synchronized.
3. **As a** developer, **I want** the script to scale **so that** large object lists are handled.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search `customrecord_sna_objects` where:
   - `custrecord_sna_equipment_model` is not empty
   - `internalidnumber` between 1253220000 and 10000000000
2. The system must page results using `runPaged` (page size 1000).
3. The reduce stage must query:
   - `MAX(customrecord_sna_hul_hour_meter_reading)`
   - for `custrecord_sna_hul_object_ref = <object ID>`
4. If the max reading equals `0`, the system must set it to `null`.
5. The system must update `custrecord_hul_meter_key_static` on the object record.
6. Errors must be logged and not stop processing.

### Acceptance Criteria

- [ ] Equipment objects have meter key updated to latest reading.
- [ ] Zero readings are cleared to null.
- [ ] Errors are logged without halting the run.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update non-equipment objects.
- Create hour meter records.
- Validate meter reading consistency.

---

## 6. Design Considerations

### User Interface
- None (background process).

### User Experience
- Meter values updated without manual edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Object (`customrecord_sna_objects`)
- Hour Meter (`customrecord_sna_hul_hour_meter`)

**Script Types:**
- [x] Map/Reduce - Bulk meter update
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_sna_equipment_model`
- Object | `custrecord_hul_meter_key_static`
- Hour Meter | `custrecord_sna_hul_object_ref`
- Hour Meter | `custrecord_sna_hul_hour_meter_reading`

**Saved Searches:**
- None (search + SuiteQL used).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Potentially large list of equipment objects.

**Data Sources:**
- Object records and hour meter records via SuiteQL.

**Data Retention:**
- Updates to object records only.

### Technical Constraints
- Uses `internalidnumber` range filter as a gate.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Hour meter records must exist.

### Governance Considerations
- SuiteQL per object in reduce; may be heavy for large datasets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Object meter key values reflect latest hour meter readings.

**How we'll measure:**
- Spot checks on object records and meter logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_set_current_meter_reading_on_equip_obj_mr.js | Map/Reduce | Set current meter reading on objects | Implemented |

### Development Approach

**Phase 1:** Input data
- [x] Search equipment objects and page results

**Phase 2:** Meter calculation
- [x] Query max meter reading per object
- [x] Update object meter key

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Object with hour meter readings receives max reading.
2. Object with max reading 0 gets null.

**Edge Cases:**
1. Object has no hour meter records; meter key may become null.
2. SuiteQL query fails; error logged.

**Error Handling:**
1. submitFields errors are logged.

### Test Data Requirements
- Objects with associated hour meter records.

### Sandbox Setup
- Ensure hour meter data exists for sample objects.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit permissions on object records.

**Permissions required:**
- Edit on `customrecord_sna_objects`
- View on `customrecord_sna_hul_hour_meter`

### Data Security
- Updates only meter field values.

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

1. Upload `hul_set_current_meter_reading_on_equip_obj_mr.js`.
2. Create Map/Reduce script record.
3. Run in sandbox and validate meter updates.

### Post-Deployment

- [ ] Verify meter key values on object records.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
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

- [ ] Should the ID range filter be replaced with a field-based filter?
- [ ] Should a summary report be generated?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large datasets increase runtime | Med | Med | Monitor and batch if needed |
| Missing hour meter data | Low | Low | Leave meter key null |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_objects_with_zero_meter_mr.md

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
