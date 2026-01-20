# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetDefaultValue
title: Sales Order Default Values Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_set_default_value.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Employee

---

## 1. Overview
A client script that sets default location, department, and revenue stream on Rental Sales Orders.

---

## 2. Business Goal
Ensure required defaults are applied automatically for a specific sales order form.

---

## 3. User Story
As a sales user, when I create a Rental Sales Order, I want defaults set automatically, so that I do not manually set location and department.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | customform | create mode and form ID 121 | Set location, department, and revenue stream defaults |
| fieldChanged | entity, customform | form ID 121 | Reapply defaults |

---

## 5. Functional Requirements
- On page init in create mode, if form ID is 121, set:
  - `location` to the current employee location
  - `department` to 23
  - `cseg_sna_revenue_st` to 416
- On field change for `entity` or `customform`, if form ID is 121, reapply the same defaults.
- If department is missing after changes, reset it to 23.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Employee

### Fields Referenced
- Header | customform
- Header | location
- Header | department
- Header | cseg_sna_revenue_st

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Different form ID; defaults should not apply.
- Employee has no location; location remains unchanged.

---

## 8. Implementation Notes (Optional)
- Form ID 121 is hard-coded.
- Looks up employee location via `search.lookupFields`.

---

## 9. Acceptance Criteria
- Given Rental Sales Order form (121), when creating, then defaults are set.
- Given customer or form changes, when updated, then defaults reapply.

---

## 10. Testing Notes
- Create Rental Sales Order (form 121); verify defaults.
- Use a different form; defaults should not apply.
- Change customer; defaults remain set.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_set_default_value.js`.
- Deploy to Sales Order form 121.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should form ID be parameterized instead of hard-coded?
- Risk: Form ID changes.

---
