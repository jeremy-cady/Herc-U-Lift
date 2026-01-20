# PRD: Address Change Asset Update (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddressChangeMR
title: Address Change Asset Update (Map/Reduce)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_mr_address_change_update.js
  script_id: customscript_hul_mr_address_change_update
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - job
  - Support Case
  - Task

---

## 1. Overview
A Map/Reduce that performs bulk updates when a customer’s site address changes, updating equipment, projects, cases, and tasks in a required sequence.

---

## 2. Business Goal
Large address-change batches exceed Suitelet real-time limits; this MR handles the heavy updates while enforcing FSM sequencing constraints.

---

## 3. User Story
- As a service admin, I want to process large address-change batches so that updates complete reliably.
- As an FSM user, I want to maintain equipment-first sequencing so that downstream record updates are valid.
- As an operator, I want to receive a completion email so that I know if errors occurred.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_acu_customer_id, custscript_acu_old_site_id, custscript_acu_new_site_id, custscript_acu_equipment_ids, custscript_acu_case_ids, custscript_acu_project_ids, custscript_acu_task_ids, custscript_acu_user_email | Phased work items created from Suitelet-supplied IDs | Update records in equipment -> project -> case -> task order and email summary |

---

## 5. Functional Requirements
- The system must accept parameters: custscript_acu_customer_id, custscript_acu_old_site_id, custscript_acu_new_site_id, custscript_acu_equipment_ids, custscript_acu_case_ids, custscript_acu_project_ids, custscript_acu_task_ids, custscript_acu_user_email.
- The system must generate phased work items: Phase 1 Equipment (update parent), Phase 2 Projects (update custentity_nx_asset + name), Phase 3 Cases (update custevent_nx_case_asset + title), Phase 4 Tasks (update custevent_nx_task_asset + title + address/lat/long).
- The system must enforce ordering using phase_sequence keys.
- Projects must rebuild name from type + number + site name (83 char limit).
- Cases/Tasks must replace old site name in title with new site name.
- Project and case equipment assets must be preserved.
- Tasks must update address fields from the new site asset.
- The system must send a summary email to custscript_acu_user_email.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- job
- Support Case
- Task

### Fields Referenced
- custscript_acu_customer_id
- custscript_acu_old_site_id
- custscript_acu_new_site_id
- custscript_acu_equipment_ids
- custscript_acu_case_ids
- custscript_acu_project_ids
- custscript_acu_task_ids
- custscript_acu_user_email
- custentity_nx_asset
- custentity_nxc_project_assets
- custevent_nx_case_asset
- custevent_nxc_case_assets
- custevent_nx_task_asset
- custevent_nx_address
- custevent_nx_latitude
- custevent_nx_longitude

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No tasks or cases: only equipment/projects update.
- Missing site name: titles remain unchanged.
- Record save failure: error captured and emailed.

---

## 8. Implementation Notes (Optional)
- FSM requires equipment updates before dependent records.
- Uses name replacement for case/task titles; project name is rebuilt.

---

## 9. Acceptance Criteria
- Given a batch, when processed, then equipment updates complete before project/case/task updates.
- Given project names, when updated, then names are rebuilt and truncated to 83 characters.
- Given case/task titles, when updated, then titles reflect the new site name.
- Given tasks, when updated, then address, latitude, and longitude are updated from the site asset.
- Given completion, when processing ends, then a summary email contains counts and errors.

---

## 10. Testing Notes
- Run a batch with equipment, projects, cases, tasks and confirm order and updates.
- Run with no tasks or cases and confirm only equipment/projects update.
- Verify missing site name leaves titles unchanged.
- Verify errors are captured and emailed.

---

## 11. Deployment Notes
- Deploy Map/Reduce.
- Configure Suitelet to trigger MR for large batches.
- Rollback: disable Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the phase order be configurable?
- Name replacement misses edge cases.

---
