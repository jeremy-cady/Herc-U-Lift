# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TaskCodeCS
title: Task Code Entry and Validation (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_createtaskcode.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions that include the task code sublist and item sublist
  - Custom Task Code record linked via `recmachcustrecord_tc_quoteestimateid`

---

## 1. Overview
A client script that manages task code entry, validation, and synchronization between a custom task code sublist and item lines.

## 2. Business Goal
Ensures task codes are unique and that item lines inherit the correct group/work/repair codes and descriptions from the task code list.

## 3. User Story
As a service coordinator, when entering task codes, I want task codes validated, so that duplicates are prevented.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | `custrecord_tc_workcode`, `custrecord_tc_groupcode` | Task code sublist | Update `custrecord_tc_description` from sublist text |
| fieldChanged | `custcol_sna_task_code` | Item sublist | Populate group/work/repair codes and description |
| validateLine | `custrecord_tc_taskcode`, `custrecord_tc_description` | Task code sublist | Require fields and prevent duplicates |

## 5. Functional Requirements
- The system must run on `fieldChanged` and `validateLine` for task code and item sublists.
- When adding/updating a task code in `recmachcustrecord_tc_quoteestimateid`, the system must require `custrecord_tc_taskcode` and `custrecord_tc_description` and prevent duplicate task codes by checking existing lines.
- When `custrecord_tc_workcode` or `custrecord_tc_groupcode` changes, the system must update `custrecord_tc_description` using sublist text values.
- When `custcol_sna_task_code` changes on item lines, the system must populate `custcol_sna_group_code`, `custcol_sna_work_code`, `custcol_sna_repair_code`, and `custcol_sna_task_description`.

## 6. Data Contract
### Record Types Involved
- Transactions that include the task code sublist and item sublist
- Custom Task Code record linked via `recmachcustrecord_tc_quoteestimateid`

### Fields Referenced
- Task Code sublist | `custrecord_tc_taskcode`
- Task Code sublist | `custrecord_tc_description`
- Task Code sublist | `custrecord_tc_groupcode`
- Task Code sublist | `custrecord_tc_workcode`
- Task Code sublist | `custrecord_tc_repaircode`
- Item line | `custcol_sna_task_code`
- Item line | `custcol_sna_group_code`
- Item line | `custcol_sna_work_code`
- Item line | `custcol_sna_repair_code`
- Item line | `custcol_sna_task_description`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Duplicate task code entered; validation stops line save.
- Missing description; validation stops line save.
- Task code not found in sublist for item line; no values set.

## 8. Implementation Notes (Optional)
- Uses `getCurrentSublistText` to derive display values for description.

## 9. Acceptance Criteria
- Given a duplicate task code, when the line is validated, then an alert blocks the line.
- Given missing task code or description, when the line is validated, then the line is blocked.
- Given a task code selection on an item line, when the field changes, then related task fields are populated.
- Given a group or work code change, when the field changes, then the task description is updated.

## 10. Testing Notes
- Add a task code line with valid values; line saves.
- Select a task code on an item line; fields populate.
- Duplicate task code entered; validation stops line save.
- Missing description; validation stops line save.
- Task code not found in sublist for item line; no values set.

## 11. Deployment Notes
- Upload `sna_hul_cs_createtaskcode.js`.
- Deploy to forms that include the task code sublist.
- Validate task code entry behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the script block duplicate descriptions as well as codes?
- Should task code validation run on saveRecord?
- Risk: Task code sublist not present on form (Mitigation: Add form validation or guard clauses)
- Risk: Client script conflicts with other pricing scripts (Mitigation: Coordinate deployment order)

---
