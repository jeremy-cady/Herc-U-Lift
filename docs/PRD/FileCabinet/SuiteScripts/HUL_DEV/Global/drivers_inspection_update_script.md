# PRD: Driver Inspection Date Update
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DriverInspectionUpdate
title: Driver Inspection Date Update
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/drivers_inspection_update_script.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_hul_employee_drivers_inspec
  - Employee

---

## 1. Overview
A scheduled script that updates each employee’s last driver inspection date based on the latest inspection record for their assigned location.

---

## 2. Business Goal
Ensure employee records reflect the most recent driver inspection activity by location, and clear outdated dates when no inspection exists.

---

## 3. User Story
- As a safety manager, I want to see the last driver inspection date on employee records so that compliance is visible.
- As an admin, I want to auto-sync inspection dates so that I don’t update records manually.
- As an auditor, I want to trust inspection dates are current so that compliance checks are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled | custrecord_hul_driveinp_drivers_inp_loc, custrecord_hul_driveinp_datetime, custentity_nx_location, custentity_last_drivers_insp_date | Latest inspection per location | Update or clear employee last inspection date |

---

## 5. Functional Requirements
- The system must run as a Scheduled Script.
- The system must group inspection records by location and take the max datetime for customrecord_hul_employee_drivers_inspec using custrecord_hul_driveinp_drivers_inp_loc and custrecord_hul_driveinp_datetime.
- The system must search active employees with custentity_nx_location not empty.
- For each employee, if a newer inspection date exists for their location, update custentity_last_drivers_insp_date.
- For each employee, if no inspection exists for the location, clear custentity_last_drivers_insp_date.
- The system must stop updating if governance drops below 100 units.

---

## 6. Data Contract
### Record Types Involved
- customrecord_hul_employee_drivers_inspec
- Employee

### Fields Referenced
- custrecord_hul_driveinp_drivers_inp_loc
- custrecord_hul_driveinp_datetime
- custentity_nx_location
- custentity_last_drivers_insp_date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Employee with location but no inspection: date cleared.
- Employee already up-to-date: no update.
- submitFields failures are logged and counted.
- Script stops if governance drops below 100 units.

---

## 8. Implementation Notes (Optional)
- Uses summary search to get latest inspection per location.

---

## 9. Acceptance Criteria
- Given inspections by location, when the script runs, then employees show the latest inspection datetime.
- Given a location with no inspections, when the script runs, then employee last inspection dates are cleared.
- Given updates, when processed, then counts for updated/cleared/errors are logged.
- Given low governance, when remaining units drop below 100, then updates stop.

---

## 10. Testing Notes
- Run with locations that have recent inspections and confirm employee dates update.
- Run with a location with no inspection and confirm employee dates clear.
- Verify submitFields failures are logged and counted.

---

## 11. Deployment Notes
- Deploy scheduled script.
- Schedule periodic execution.
- Rollback: disable the scheduled script.

---

## 12. Open Questions / TBDs
- Should the governance threshold be configurable?
- Large employee count hits governance limit.

---
