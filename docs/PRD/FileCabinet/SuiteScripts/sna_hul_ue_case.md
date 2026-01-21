# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CaseSiteAssetButton
title: Case Site Asset Button and Project Sync
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_case.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - supportcase
  - job

---

## 1. Overview
User Event on support cases that adds a "Save and Create NXC Site Asset" button and syncs location/revenue/asset data to the related project.

---

## 2. Business Goal
Streamline site asset creation from cases and keep project fields aligned with case data.

---

## 3. User Story
As a support user, when working a case tied to a project, I want to create an NXC Site Asset and keep project fields aligned with case data, so that asset records are created quickly and reporting remains consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Case form | UI create/edit (non-view) | Add "Save and Create NXC Site Asset" button and attach client script |
| beforeSubmit | custevent_sna_hul_caselocation | create | Default case location from related project |
| afterSubmit | Project fields | project is Billable and fields missing | Update project fields from case |

---

## 5. Functional Requirements
- Add a "Save and Create NXC Site Asset" button on case forms in UI mode (non-view).
- Attach client script `sna_hul_cs_case.js` to handle the prompt.
- On case create, default `custevent_sna_hul_caselocation` from the related project location.
- After submit, if the project is Billable and key fields are missing, update project fields from the case.

---

## 6. Data Contract
### Record Types Involved
- supportcase
- job

### Fields Referenced
- supportcase | custevent_nx_case_asset | Site asset reference
- supportcase | custevent_sna_hul_caselocation | Case location
- supportcase | cseg_sna_revenue_st | Revenue stream
- supportcase | custevent_nxc_case_assets | Equipment asset reference
- job | custentity_nx_project_type | Project type
- job | cseg_sna_revenue_st | Revenue stream
- job | custentity_nxc_project_assets | Project equipment asset
- job | custentity_sna_hul_location | Project location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Button only shows for UI contexts that are not View.
- Project fields already set should not be overwritten.
- lookupFields errors are logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Script relies on client script `sna_hul_cs_case.js` for the UI prompt.
- Performance/governance considerations: Single lookup per case.

---

## 9. Acceptance Criteria
- Given a case in UI create/edit, when the form loads, then the "Save and Create NXC Site Asset" button is visible.
- Given a case create with a related project, when beforeSubmit runs, then case location defaults from the project.
- Given a Billable project with missing fields, when afterSubmit runs, then project fields update from the case.

---

## 10. Testing Notes
- Create a case and confirm location defaults from project.
- Save a Billable case with revenue stream and equipment asset to update project.
- Case in view mode should not show the button.
- Project fields already set should not be overwritten.

---

## 11. Deployment Notes
- Confirm client script `sna_hul_cs_case.js` is deployed and accessible.
- Deploy User Event on Support Case and validate UI button and project updates.
- Monitor logs for lookup/update errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the button be hidden if a site asset already exists?

---
