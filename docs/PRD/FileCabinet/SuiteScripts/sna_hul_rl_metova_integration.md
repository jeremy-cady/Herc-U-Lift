# PRD: Metova Integration

**PRD ID:** PRD-UNKNOWN-MetovaIntegration
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_rl_metova_integration.js (RESTlet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
RESTlet integration for Metova to create, update, fetch, and delete equipment objects and hour meter readings.

**What problem does it solve?**
Provides a programmatic API for external systems to sync object records and hour meter data into NetSuite.

**Primary Goal:**
Enable CRUD operations for object and hour meter records by external integrations.

---

## 2. Goals

1. Accept RESTlet POST/PUT for object and hour meter updates.
2. Support RESTlet GET to retrieve object details with associated hour meters.
3. Provide RESTlet DELETE for object or hour meter records.

---

## 3. User Stories

1. **As an** integration system, **I want to** create or update object records **so that** equipment stays in sync.
2. **As an** integration system, **I want to** send hour meter readings **so that** usage is tracked.
3. **As an** admin, **I want to** query by GPS serial **so that** I can retrieve object data and meter history.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `type=object` or `type=hourMeter` in RESTlet requests.
2. The system must create or update `customrecord_sna_objects` for object POST/PUT.
3. The system must create or update `customrecord_sna_hul_hour_meter` for hour meter POST/PUT.
4. The system must return objects filtered by GPS serial on GET.
5. The system must return hour meter records associated with returned objects.
6. The system must delete objects or hour meter records by ID on DELETE.

### Acceptance Criteria

- [ ] POST/PUT creates or updates the correct record type based on request `type`.
- [ ] GET returns objects filtered by `gpsSerial` and includes related hour meters.
- [ ] DELETE removes the specified record by ID.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate payload fields beyond required values.
- Enforce authentication beyond NetSuite RESTlet security.
- Perform complex transformations on incoming data.

---

## 6. Design Considerations

### User Interface
- No UI; RESTlet endpoints only.

### User Experience
- External systems use REST calls to sync data.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects
- customrecord_sna_hul_hour_meter

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [x] RESTlet - CRUD API
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_objects | name | Object ID
- customrecord_sna_objects | custrecord_sna_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_serial_no | Serial number
- customrecord_sna_objects | cseg_sna_hul_eq_seg | Equipment posting/category/group
- customrecord_sna_objects | cseg_hul_mfg | Manufacturer
- customrecord_sna_objects | custrecord_sna_equipment_model | Equipment model
- customrecord_sna_objects | custrecord_sna_year | Year
- customrecord_sna_objects | custrecord_hul_meter_key_static | Meter key (M1)
- customrecord_sna_objects | custrecordcustrecord_hul_gps_serial | GPS serial
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_object_ref | Object reference
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_external_id | External ID
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_date | Reading date
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_time | Reading time
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_hour_meter_reading | Reading value
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_ignore_in_calculation | Ignore flag
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_hr_meter_source | Source
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_source_record | Source record
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_actual_reading | Actual reading
- customrecord_sna_hul_hour_meter | custrecord_sna_hul_meter_used | Meter used

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Metova integration via RESTlet.

### Data Requirements

**Data Volume:**
- Per-object and per-hour-meter request sizes.

**Data Sources:**
- External system payloads
- Custom record data

**Data Retention:**
- Custom record retention is standard NetSuite behavior.

### Technical Constraints
- RESTlet payload validation is minimal.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Metova integration client
- **Other features:** Custom record definitions for objects and hour meters

### Governance Considerations

- **Script governance:** Record create/load/save per request.
- **Search governance:** GET builds large column lists; may be heavy.
- **API limits:** RESTlet usage limits apply.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- External systems can create/update objects and hour meters reliably.
- GET requests return expected data filtered by GPS serial.

**How we'll measure:**
- Integration logs and record validation in NetSuite.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_rl_metova_integration.js | RESTlet | CRUD API for objects and hour meters | Implemented |

### Development Approach

**Phase 1:** Validate request schema
- [ ] Confirm required fields are passed for object/hour meter

**Phase 2:** Operational checks
- [ ] Test GET/POST/PUT/DELETE flows

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST object creates a new object record.
2. POST hour meter creates an hour meter record linked to an object.
3. GET object with GPS serial returns object plus hourMeters.

**Edge Cases:**
1. PUT updates an existing record with partial fields.
2. GET with unknown GPS serial returns empty array.

**Error Handling:**
1. Delete with invalid ID returns error message.

### Test Data Requirements
- Object record with GPS serial
- Hour meter readings linked to object

### Sandbox Setup
- Deploy RESTlet with proper permissions

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration role with RESTlet access

**Permissions required:**
- Full access to custom object and hour meter records

### Data Security
- Ensure RESTlet access is restricted to integration role.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm RESTlet deployment and integration role
- [ ] Validate custom record fields

### Deployment Steps

1. Deploy RESTlet.
2. Configure integration to call RESTlet endpoints.

### Post-Deployment

- [ ] Monitor RESTlet logs
- [ ] Validate object/hour meter record creation

### Rollback Plan

**If deployment fails:**
1. Disable RESTlet deployment.
2. Fix integration payloads and re-enable.

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

- [ ] Should the GET API support additional filters beyond GPS serial?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| GET returns a large payload due to many columns | Med | Med | Narrow response fields if needed |
| DELETE handler references undefined request body | Med | Low | Review and fix request handling in script |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 RESTlet
- N/record and N/search modules

### External Resources
- Metova integration specs (if available)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
