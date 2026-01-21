# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GetNxtSrvTask
title: Workflow Action - Check NextService Task Results
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: workflow_action
  file: FileCabinet/SuiteScripts/sna_hul_wfa_get_nxtsrvctask.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - task

---

## 1. Overview
Workflow action script that scans sales order line tasks and returns true if any task has result code 6.

---

## 2. Business Goal
Enable workflow routing based on whether linked tasks are marked "Job Complete & CPMNO."

---

## 3. User Story
As a workflow designer, when a sales order is evaluated, I want to branch based on linked task results so that approvals follow field outcomes.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| workflowAction | custcol_nx_task | action invoked | Look up task results and return 'T' if any result equals 6, else 'F'. |

---

## 5. Functional Requirements
- Iterate item lines and read `custcol_nx_task`.
- For each task id, look up `custevent_nxc_task_result`.
- Return `'T'` if any task result equals 6.
- Return `'F'` if no task result equals 6.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (or deployed record type)
- Task

### Fields Referenced
- Item line | custcol_nx_task | NextService task
- Task | custevent_nxc_task_result | Task result

Schemas (if known):
- Task | custevent_nxc_task_result | Result code lookup

---

## 7. Validation & Edge Cases
- Empty task ids are skipped without error.
- Missing task result values should return `'F'`.

---

## 8. Implementation Notes (Optional)
- Uses `context.newRecord` and lookupFields for task results.

---

## 9. Acceptance Criteria
- Given a line task with result 6, when the workflow action runs, then it returns `'T'`.
- Given no line tasks with result 6, when the action runs, then it returns `'F'`.
- Given empty task ids, when the action runs, then it completes without error.

---

## 10. Testing Notes
- Run workflow action on a sales order with a task result 6 and verify `'T'`.
- Run on a sales order with no tasks and verify `'F'`.
- Run with tasks missing results and verify `'F'`.

---

## 11. Deployment Notes
- Deploy the workflow action script and attach it to the workflow condition.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should task result values be parameterized instead of hard-coded to 6?

---
