# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateTaskCodeSublist
title: Update Task Code Details on Item Lines (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_createtaskcodesublist.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Records with item sublist and task code sublist (e.g., Estimate, Sales Order, Invoice)

---

## 1. Overview
A User Event that updates item sublist task detail fields based on the selected task code.

## 2. Business Goal
Ensures item lines inherit group, work, repair, and description details from the task code sublist.

## 3. User Story
As a service user, when I add task codes to item lines, I want task details filled automatically, so that I do not have to retype them.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | `custcol_sna_task_code` | Task code set on item line | Populate task detail fields from task code sublist |

## 5. Functional Requirements
- The system must run before submit on supported records.
- The system must read `custcol_sna_task_code` on each item line.
- The system must find the matching task code line on the `recmachcustrecord_tc_quoteestimateid` sublist.
- The system must set `custcol_sna_group_code`, `custcol_sna_work_code`, `custcol_sna_repair_code`, and `custcol_sna_task_description` based on the task code sublist values.

## 6. Data Contract
### Record Types Involved
- Records with item sublist and task code sublist (e.g., Estimate, Sales Order, Invoice)

### Fields Referenced
- Item line | `custcol_sna_task_code`
- Item line | `custcol_sna_group_code`
- Item line | `custcol_sna_work_code`
- Item line | `custcol_sna_repair_code`
- Item line | `custcol_sna_task_description`
- Task code sublist | `custrecord_tc_groupcode`
- Task code sublist | `custrecord_tc_workcode`
- Task code sublist | `custrecord_tc_repaircode`
- Task code sublist | `custrecord_tc_description`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Task code not found in sublist; no changes.
- Item line without task code; no changes.
- Exceptions logged without blocking save.

## 8. Implementation Notes (Optional)
- Depends on task code sublist being available on the record.

## 9. Acceptance Criteria
- Given a task code on an item line, when the record is saved, then task detail fields populate.
- Given a missing or unmatched task code, when the record is saved, then no changes occur.

## 10. Testing Notes
- Add a task code to an item line and save; task detail fields populate.
- Task code not found in sublist; no changes.
- Item line without task code; no changes.
- Exceptions logged without blocking save.

## 11. Deployment Notes
- Upload `sna_hul_ue_createtaskcodesublist.js`.
- Deploy User Event on supported transaction types.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should task details update on edit only when the task code changes?
- Should this run on additional record types?
- Risk: Task code sublist missing on form (Mitigation: Validate sublist presence before update)
- Risk: Large item counts increase save time (Mitigation: Optimize lookup or limit updates)

---
