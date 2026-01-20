# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ImportBillingSched
title: Billing Schedule Import from CSV
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_import_billingsched.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Billing Schedule (billingschedule)

---

## 1. Overview
A Map/Reduce script that creates custom billing schedules by importing a CSV file.

---

## 2. Business Goal
It automates the creation of billing schedules and recurrence lines from CSV data.

---

## 3. User Story
As a billing admin, when I need to import schedules from CSV, I want to avoid manual setup, so that schedules are created efficiently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must read the CSV file referenced by `custscript_sna_file_id`.
- The script must parse invoice date and amount-per-period for each line.
- The script must group CSV rows by primary key and create one billing schedule per group.
- The script must set billing schedule fields: `name`, `initialamount`, `frequency=Custom`, and `ispublic=true`.
- The script must create a recurrence line for each CSV row with date and amount.

---

## 6. Data Contract
### Record Types Involved
- Billing Schedule (`billingschedule`)

### Fields Referenced
- Billing Schedule | `name`
- Billing Schedule | `initialamount`
- Billing Schedule | `frequency`
- Billing Schedule | `ispublic`
- Billing Schedule Recurrence Line | `recurrencedate`
- Billing Schedule Recurrence Line | `amount`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Empty CSV lines are skipped.
- Invalid date values should be logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One billing schedule created per group of CSV rows.

---

## 9. Acceptance Criteria
- Given a CSV with schedule data, when the script runs, then billing schedules are created with recurrence lines matching CSV data.
- Given a CSV primary key, when a billing schedule is created, then the schedule name matches the CSV primary key.

---

## 10. Testing Notes
- Happy path: CSV with two schedules creates two billing schedule records with correct lines.
- Edge case: Empty CSV lines are skipped.
- Error handling: Invalid date values should be logged.
- Test data: CSV file containing primary key and invoice dates.
- Sandbox setup: Ensure billing schedules can be created by the deployment role.

---

## 11. Deployment Notes
- Confirm `custscript_sna_file_id` parameter is set to a CSV file.
- Upload `sna_hul_mr_import_billingsched.js`.
- Deploy Map/Reduce with file parameter.
- Post-deployment: Validate new billing schedules.
- Rollback plan: Disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.

---
