# PRD: Copy Hour Meter Reading (Map/Reduce)

**PRD ID:** PRD-20240906-CopyHourMeterReading
**Created:** September 6, 2024
**Last Updated:** September 6, 2024
**Author:** Jeremy Cady
**Status:** Implemented (Partial/Stub)
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_copy_hour_meter_reading_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce intended to iterate equipment object records and copy an hour meter reading value.

**What problem does it solve?**
Provides a batch mechanism to read hour meter data from equipment object records (currently limited to a specific object ID).

**Primary Goal:**
Extract hour meter readings for equipment objects (prototype implementation).

---

## 2. Goals

1. Query equipment object IDs from `customrecord_sna_objects`.
2. Read hour meter field `custrecord_sna_meter_key_on_m1` for a target object.
3. Emit object ID and hours for downstream processing (not implemented).

---

## 3. User Stories

1. **As a** developer, **I want to** batch read hour meter values **so that** I can test data extraction.
2. **As an** admin, **I want to** process object records via Map/Reduce **so that** I can scale later.
3. **As a** stakeholder, **I want to** see prototype output **so that** we can validate the approach.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query `customrecord_sna_objects` IDs via SuiteQL.
2. The system must emit entries for matching object IDs (currently hardcoded to `3274`).
3. The system must attempt to read `custrecord_sna_meter_key_on_m1` from the current record context.
4. The system must write the object ID and hours to the map output.

### Acceptance Criteria

- [ ] Object IDs are retrieved from `customrecord_sna_objects`.
- [ ] Object ID `3274` triggers a read of the hour meter field.
- [ ] Map stage writes key/value output (object ID, hours).
- [ ] Errors are logged without stopping the script.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update records with the hour meter value.
- Process all objects (currently limited to one hardcoded ID).
- Implement reduce/summarize logic.

---

## 6. Design Considerations

### User Interface
- None (batch processing).

### User Experience
- Prototype-only; no user-facing output.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record: `customrecord_sna_objects`

**Script Types:**
- [x] Map/Reduce - Prototype hour meter extraction
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Object | `custrecord_sna_meter_key_on_m1` | Hour meter reading

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- None (prototype).

### Data Requirements

**Data Volume:**
- All object IDs (though only one is processed).

**Data Sources:**
- SuiteQL query on `customrecord_sna_objects`.

**Data Retention:**
- N/A.

### Technical Constraints
- Hardcoded object ID `3274`.
- `getMeterHours` uses `ctx.currentRecord` which is not available in Map/Reduce map context (likely nonfunctional).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Minimal usage; not performing record loads.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- The prototype can read and log hour meter values for the target object ID.

**How we'll measure:**
- Script logs during map execution.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_copy_hour_meter_reading_mr.js | Map/Reduce | Prototype hour meter extraction | Implemented (partial) |

### Development Approach

**Phase 1:** Prototype
- [x] SuiteQL input of object IDs
- [x] Map stage with hardcoded object filter

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Map stage hits object `3274` and logs the meter reading.

**Edge Cases:**
1. Other object IDs are ignored.
2. Hour meter field is blank → logs empty value.

**Error Handling:**
1. Errors in map are logged.

### Test Data Requirements
- `customrecord_sna_objects` record with ID `3274` and meter value.

### Sandbox Setup
- Deploy Map/Reduce and run on demand.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- View `customrecord_sna_objects`.

### Data Security
- No sensitive data updated.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Map/Reduce (prototype).

### Post-Deployment

- [ ] Review logs for output values.

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2024-09-06 | 2024-09-06 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should this be converted to a full map/reduce with record loads?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Map context lacks currentRecord | High | Medium | Use record.load in map |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce docs.
- SuiteQL reference.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2024-09-06 | Jeremy Cady | 1.0 | Initial implementation |
