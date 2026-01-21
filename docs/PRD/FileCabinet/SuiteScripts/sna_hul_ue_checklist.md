# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ChecklistHourMeter
title: Checklist Hour Meter Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_checklist.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nxc_mr
  - customrecord_sna_nxc_rc
  - supportcase
  - customrecord_nx_asset
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
User Event that creates Hour Meter records from Rental Checklist or Maintenance records based on case context.

---

## 2. Business Goal
Ensure hour meter readings are captured automatically when checklists are created.

---

## 3. User Story
As a service user, when a rental checklist or maintenance record is created, I want hour meter readings created automatically, so that equipment usage is tracked consistently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Checklist/Maintenance fields | create/copy | Create hour meter record based on case and asset data |

---

## 5. Functional Requirements
- Run afterSubmit on create/copy of rental checklist or maintenance records.
- Read case, asset, and hour reading fields based on record type.
- Look up asset object and case details to determine source type.
- Create a `customrecord_sna_hul_hour_meter` record with reading, source, and time.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nxc_mr
- customrecord_sna_nxc_rc
- supportcase
- customrecord_nx_asset
- customrecord_sna_hul_hour_meter

### Fields Referenced
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

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing hour reading does not create a record.
- Missing asset object results in blank object reference.
- Record creation errors are logged.

---

## 8. Implementation Notes (Optional)
- Source type mapping depends on revenue stream and case type text values.
- Performance/governance considerations: LookupFields for asset and case.

---

## 9. Acceptance Criteria
- Given a checklist or maintenance record with a case and hour reading, when afterSubmit runs, then an hour meter record is created.
- Given a case type or revenue stream, when the hour meter record is created, then the source type is set accordingly.

---

## 10. Testing Notes
- Create a checklist with hour reading and case; hour meter record is created.
- Missing hour reading does not create a record.
- Missing asset object results in blank object reference.
- Deploy User Event on checklist record types.

---

## 11. Deployment Notes
- Configure script parameters for source types.
- Deploy User Event on checklist record types and validate hour meter record creation.
- Monitor logs for missing case or asset values; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should hour meter creation be blocked when asset object is missing?

---
