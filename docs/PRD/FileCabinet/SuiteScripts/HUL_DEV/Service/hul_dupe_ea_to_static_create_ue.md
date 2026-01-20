# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DupeEquipmentAssetUE
title: Duplicate Equipment Asset to Static Field (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_dupe_ea_to_static_create_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Project (Job)

---

## 1. Overview
A User Event that copies the equipment asset field from a project to a static equipment asset field on create and edit.

---

## 2. Business Goal
Ensure a static equipment asset reference is populated for downstream processes when a project’s equipment asset changes.

---

## 3. User Story
- As an admin, I want equipment asset data copied so that reports use a stable field.
- As a support user, I want updates to run on edit so that changes are synchronized.
- As a developer, I want the script to run automatically so that manual updates are not needed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit (create/edit) | custentity_nxc_project_assets | Equipment asset present | Set custentity_hul_nxc_eqiup_asset via submitFields |

---

## 5. Functional Requirements
- The system must run on afterSubmit for CREATE and EDIT.
- The system must read custentity_nxc_project_assets.
- If the equipment asset is missing, the system must log and exit.
- The system must set custentity_hul_nxc_eqiup_asset to the equipment asset ID via submitFields.
- Errors must be logged without blocking the transaction.

---

## 6. Data Contract
### Record Types Involved
- Project (Job)

### Fields Referenced
- custentity_nxc_project_assets
- custentity_hul_nxc_eqiup_asset

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Equipment asset blank: log and exit.
- submitFields error logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Uses submitFields after submit.

---

## 9. Acceptance Criteria
- Given a project with equipment asset, when created or edited, then the static field is populated.
- Given a project without equipment asset, when saved, then no update occurs.
- Given errors, when they occur, then they are logged without blocking the save.

---

## 10. Testing Notes
- Create a project with equipment asset; confirm static field set.
- Edit a project and change equipment asset; confirm static field updates.
- Test with blank equipment asset; confirm no update.

---

## 11. Deployment Notes
- Upload hul_dupe_ea_to_static_create_ue.js.
- Deploy as a User Event on project (job) record.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should the sync happen only on create, not edit?
- Should the static field be updated via beforeSubmit instead?
- Field ID typo (eqiup).
- Project save re-triggers downstream logic.

---
