# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoSetCodesItemLines
title: Set Task Codes on Item Lines
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_set_codes_item_lines.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - transaction
  - supportcase
  - customrecord_cseg_sna_revenue_st

---

## 1. Overview
Copies repair, work, and group codes onto item lines based on the revenue stream of the linked NXC support case.

---

## 2. Business Goal
Ensure line-level task codes align with the revenue stream assigned to the related service case.

---

## 3. User Story
As a service coordinator, when a case is linked, I want task codes populated, so that lines are coded consistently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custbody_nx_case | non-delete | Populate or copy repair/work/group codes on item lines |

---

## 5. Functional Requirements
- On afterSubmit, load the current transaction record and skip deletes.
- If `custbody_nx_case` is empty, exit without changes.
- If the linked case has a revenue stream with repair/work/group codes, set those codes on all item lines.
- If the revenue stream does not provide codes, copy codes from the previous line when `custcol_sna_hul_nxc_retain_task_codes` is true.
- Save the record after updates.

---

## 6. Data Contract
### Record Types Involved
- transaction
- supportcase
- customrecord_cseg_sna_revenue_st

### Fields Referenced
- Transaction header | custbody_nx_case | Linked support case
- Item line | custcol_sna_repair_code | Repair code
- Item line | custcol_sna_work_code | Work code
- Item line | custcol_sna_group_code | Group code
- Item line | custcol_sna_hul_nxc_retain_task_codes | Retain task codes flag

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- The script exits when there is no linked case.
- Revenue stream without codes uses retain-flag previous line values.
- Missing support case record logs error and exits.

---

## 8. Implementation Notes (Optional)
- Uses support case revenue stream lookup and custom segment record lookup.
- Runs record.load and record.save after submit.

---

## 9. Acceptance Criteria
- Given revenue stream codes, when afterSubmit runs, then item lines receive repair/work/group codes.
- Given no revenue stream codes and retain flag set, when afterSubmit runs, then codes are copied from the previous line.

---

## 10. Testing Notes
- Save a transaction with a case revenue stream that has codes; verify all lines populated.
- Revenue stream has no codes; retain-flag lines copy prior line values.
- First line retain flag with no prior line does not crash.
- Ensure custom segment records include code fields.

---

## 11. Deployment Notes
- Revenue stream custom segment records configured.
- Deploy User Event to the target transaction type.
- Validate line codes on a new transaction.

---

## 12. Open Questions / TBDs
- Should lines without retain flag be left unchanged when revenue stream codes are empty?

---
