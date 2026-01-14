# PRD: Time Allocation Update

**PRD ID:** PRD-UNKNOWN-TimeAllocUpdate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_time_alloc_update.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that computes actual and allocated travel/service times for Time Allocation records.

**What problem does it solve?**
Automates calculation of time allocation metrics based on start, arrival, and completion timestamps.

**Primary Goal:**
Update Time Allocation records with computed travel and service times.

---

## 2. Goals

1. Load Time Allocation records from a saved search.
2. Compute actual travel and service durations.
3. Allocate travel time across non-Travel-Home tasks.

---

## 3. User Stories

1. **As a** service manager, **I want** time allocation metrics updated automatically **so that** reporting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from parameter `custscript_sna_time_alloc_srch`.
2. The script must read time allocation fields to compute travel and service time.
3. The script must detect Travel Home tasks by task type value `20`.
4. The script must allocate Travel Home time across non-Travel-Home entries.
5. The script must update each time allocation record with calculated values.

### Acceptance Criteria

- [ ] Actual travel and service times are updated.
- [ ] Allocated travel time is distributed across non-Travel-Home records.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify task records or time entries directly.
- Recalculate historical metrics beyond the selected search scope.

---

## 6. Design Considerations

### User Interface
- None; backend computation.

### User Experience
- Updated allocation metrics appear on Time Allocation records.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_time_allocation`

**Script Types:**
- [x] Map/Reduce - Time allocation updates
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Time Allocation | `custrecord_sna_ta_start_time`
- Time Allocation | `custrecord_sna_ta_arrival_time`
- Time Allocation | `custrecord_sna_ta_completion_time`
- Time Allocation | `custrecord_sna_ta_task.custevent_nx_task_type`
- Time Allocation | `custrecord_sna_ta_actual_travel_time`
- Time Allocation | `custrecord_sna_ta_actual_service_time`
- Time Allocation | `custrecord_sna_ta_allocated_travel_time`

**Saved Searches:**
- Search from parameter `custscript_sna_time_alloc_srch`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes Time Allocation records returned by the search.

**Data Sources:**
- Time Allocation records and linked task data.

**Data Retention:**
- No data retention beyond field updates.

### Technical Constraints
- Requires valid timestamps on Time Allocation records.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Task type configuration where value 20 represents Travel Home.

### Governance Considerations
- submitFields update per record in reduce stage.

---

## 8. Success Metrics

- Time Allocation records show computed travel and service times.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_time_alloc_update.js | Map/Reduce | Compute and update allocation times | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Gather allocation records and compute durations.
- **Phase 2:** Update records with calculated values.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Time Allocation record with start/arrival/completion times is updated correctly.

**Edge Cases:**
1. No Travel Home task present results in no allocated travel time.

**Error Handling:**
1. Missing timestamps should not break processing.

### Test Data Requirements
- Time Allocation records with various task types and timestamps.

### Sandbox Setup
- Ensure task type 20 is used for Travel Home tasks.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or operations roles.

**Permissions required:**
- Edit Time Allocation custom records.

### Data Security
- Internal time tracking data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_time_alloc_srch` saved search parameter.

### Deployment Steps
1. Upload `sna_hul_mr_time_alloc_update.js`.
2. Deploy Map/Reduce with search parameter.

### Post-Deployment
- Verify updated time allocation fields on sample records.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Should Travel Home allocation be skipped when only one record exists?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing time values causing incorrect calculations | Med | Med | Validate source data in saved search |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
