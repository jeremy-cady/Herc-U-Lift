# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_dupe_ea_to_static_create_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Service/hul_dupe_ea_to_static_create_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Project (Job)

---

## 1. Overview
User Event that duplicates a Project equipment asset field into a static field on create/edit.

---

## 2. Business Goal
Maintain a static copy of the Project equipment asset field.

---

## 3. User Story
As a user, when a Project is created or edited, I want the equipment asset field duplicated to a static field, so that downstream processes can reference it.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (afterSubmit) | custentity_nxc_project_assets | Field present | Copy to custentity_hul_nxc_eqiup_asset |
| EDIT (afterSubmit) | custentity_nxc_project_assets | Field present | Copy to custentity_hul_nxc_eqiup_asset |

---

## 5. Functional Requirements
- On create/edit, read custentity_nxc_project_assets from the Project (Job).
- If present, write the value to custentity_hul_nxc_eqiup_asset via record.submitFields.
- Log debug information and errors.

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
- No update performed if source field is empty.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
