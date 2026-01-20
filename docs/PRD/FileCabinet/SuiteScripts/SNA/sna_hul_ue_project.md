# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ProjectDefaults
title: Project Default Location (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_project.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Project (Job)

---

## 1. Overview
A User Event on Project records that defaults the project location from the current user when missing.

## 2. Business Goal
Ensures projects are created with a location when users do not set one manually.

## 3. User Story
As a project admin, when I create a project without a location, I want a default location, so that projects are not created without one.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | `custentity_sna_hul_location` | CREATE and location is empty | Set location to current user's location |

## 5. Functional Requirements
- The system must run on project create events.
- If `custentity_sna_hul_location` is empty, the system must set it to the current user's location.

## 6. Data Contract
### Record Types Involved
- Project (Job)

### Fields Referenced
- Project | `custentity_sna_hul_location`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- User has no location; field remains empty.
- Errors are logged without blocking create.

## 8. Implementation Notes (Optional)
- Project-from-SO field updates are present but not active.

## 9. Acceptance Criteria
- Given a project created with empty location, when the script runs, then the location defaults to the current user's location.

## 10. Testing Notes
- Create project with empty location; location defaults to user location.
- User has no location; field remains empty.

## 11. Deployment Notes
- Upload `sna_hul_ue_project.js`.
- Deploy on Project record.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the project-from-SO field updates be re-enabled?
- Risk: Users without location lead to empty field (Mitigation: Enforce location in UI or validation)

---
