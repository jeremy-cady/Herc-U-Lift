# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateTaskDataUE
title: Populate Task Data on Case on Edit (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_new_task_data_on_case_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case

---

## 1. Overview
A User Event that captures task data on edit, compares changes, and updates current/previous task fields on the related support case.

## 2. Business Goal
Keeps support case task summary fields synchronized with task edits in near real time.

## 3. User Story
As a service user, when tasks change, I want case task data updated, so that summaries stay current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | TBD | EDIT | Build task data JSON for comparison |
| beforeSubmit | TBD | EDIT | Store task data JSON in `custevent_hul_task_data_json` |
| afterSubmit | TBD | EDIT | Compare task data and update case task summary fields |

## 5. Functional Requirements
- The system must run on `beforeLoad`, `beforeSubmit`, and `afterSubmit` for `EDIT`.
- The system must build a task data JSON object with fields: support case, task ID, start/end dates, status, result, notes, actions, assigned tech, case type.
- The system must store the JSON object in `custevent_hul_task_data_json`.
- On `afterSubmit`, the system must parse the stored JSON and compare it to new task values.
- If data changed and case type is `4`, the system must update the case; if current/previous task numbers match, populate both sets of fields, otherwise populate only current task fields.
- Errors must be logged without blocking task edits.

## 6. Data Contract
### Record Types Involved
- Task
- Support Case

### Fields Referenced
- Task | `custevent_hul_task_data_json`
- Case | `custevent_hul_current_task_number`
- Case | `custevent_hul_previous_task_number`
- Case | Various task summary fields (current/previous)

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Case type must be `4` to update case fields.
- Missing JSON data triggers a rebuild in `beforeSubmit`.
- JSON parse errors are logged and exit.

## 8. Implementation Notes (Optional)
- Case type check (`caseType === '4'`) gates updates.

## 9. Acceptance Criteria
- Given task values change on edit, when the script runs, then case task summary fields update.
- Given current and previous task numbers match, when the script runs, then both sets of fields are populated.
- Given an error occurs, when the script runs, then it is logged without stopping edits.

## 10. Testing Notes
- Edit a task and confirm case fields update.
- Missing JSON data triggers a rebuild in `beforeSubmit`.
- Case type not 4 results in no updates.
- JSON parse errors are logged and exit.

## 11. Deployment Notes
- Upload `hul_populate_new_task_data_on_case_ue.js`.
- Deploy as User Event on task record.
- Validate case updates on edit.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the case type filter be configurable?
- Should this logic run on create as well?
- Risk: JSON compare order mismatch (Mitigation: Normalize data before compare)
- Risk: Field name changes (Mitigation: Centralize in config)

---
