# PRD: Checklist Hour Meter Creation

**PRD ID:** PRD-UNKNOWN-ChecklistHourMeter
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_checklist.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates Hour Meter records from Rental Checklist or Maintenance records based on case context.

**What problem does it solve?**
Ensures hour meter readings are captured automatically when checklists are created.

**Primary Goal:**
Create an hour meter entry tied to the asset object with a source derived from case type and revenue stream.

---

## 2. Goals

1. Detect new rental checklist or maintenance records.
2. Determine source type based on case type or revenue stream.
3. Create a custom hour meter record with reading and source details.

---

## 3. User Stories

1. **As a** service user, **I want to** auto-create hour meter readings **so that** equipment usage is tracked consistently.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on create/copy of rental checklist or maintenance records.
2. The script must read case, asset, and hour reading fields based on record type.
3. The script must look up asset object and case details to determine source type.
4. The script must create a `customrecord_sna_hul_hour_meter` record with reading, source, and time.

### Acceptance Criteria

- [ ] New checklist/maintenance records create an hour meter record when a case and reading exist.
- [ ] Source type is set based on case type or revenue stream.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update existing hour meter records.
- Validate hour readings beyond presence checks.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Hour meter entries appear automatically after checklist creation.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_nxc_mr
- customrecord_sna_nxc_rc
- supportcase
- customrecord_nx_asset
- customrecord_sna_hul_hour_meter

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Hour meter creation
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_nxc_mr | custrecord_nxc_mr_case | Case
- customrecord_nxc_mr | custrecord_nxc_mr_field_222 | Hour reading
- customrecord_nxc_mr | custrecord_nxc_mr_asset | Asset
- customrecord_sna_nxc_rc | custrecord_sna_nxc_rc_case | Case
- customrecord_sna_nxc_rc | custrecord_sna_nxc_rc_field_26 | Hour reading
- customrecord_sna_nxc_rc | custrecord_sna_nxc_rc_asset | Asset
- customrecord_nx_asset | custrecord_sna_hul_nxcassetobject | Asset object
- supportcase | cseg_sna_revenue_st | Revenue stream
- supportcase | custevent_nx_case_type | Case type
- supportcase | casenumber | Case number
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_object_ref | Object reference
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_date | Reading date
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_time | Reading time
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_hour_meter_reading | Reading value
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_hr_meter_source | Source type
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_actual_reading | Actual reading
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_source_record | Source record label

**Saved Searches:**
- None (uses lookupFields).

### Integration Points
- Uses script parameters for source type mapping.

### Data Requirements

**Data Volume:**
- One hour meter record per eligible checklist.

**Data Sources:**
- Checklist/maintenance records and support cases.

**Data Retention:**
- Creates new hour meter records only.

### Technical Constraints
- Source type mapping depends on revenue stream and case type text values.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Custom hour meter record

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** LookupFields for asset and case.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Hour meter records are created with correct source and reading values.

**How we'll measure:**
- Review hour meter records created from recent checklists.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_checklist.js | User Event | Create hour meter records | Implemented |

### Development Approach

**Phase 1:** Source mapping
- [ ] Validate source type mapping logic

**Phase 2:** Record creation
- [ ] Validate hour meter field values

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a checklist with hour reading and case; hour meter record is created.

**Edge Cases:**
1. Missing hour reading does not create a record.
2. Missing asset object results in blank object reference.

**Error Handling:**
1. Record creation errors are logged.

### Test Data Requirements
- Checklist or maintenance record linked to a case with known type and revenue stream

### Sandbox Setup
- Deploy User Event on checklist record types.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service and rental operations roles

**Permissions required:**
- Create customrecord_sna_hul_hour_meter

### Data Security
- Hour meter data restricted to service operations.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for source types

### Deployment Steps

1. Deploy User Event on checklist record types.
2. Validate hour meter record creation.

### Post-Deployment

- [ ] Monitor logs for missing case or asset values

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create hour meter records manually as needed.

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

- [ ] Should hour meter creation be blocked when asset object is missing?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Case type text changes break source mapping | Med | Low | Confirm case type values in deployment | 

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
