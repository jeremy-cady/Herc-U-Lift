# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOOpt
title: Optimized SO Line Codes and PO Link (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sn_hul_ue_so_opt.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Support Case
  - Revenue Stream (customrecord_cseg_sna_revenue_st)

---

## 1. Overview
An optimized User Event that sets task code fields on Sales Order item lines based on case revenue stream and links created POs back to the line.

---

## 2. Business Goal
Ensure consistent repair/work/group code population and maintain PO linkage on Sales Order lines.

---

## 3. User Story
As a service user, when Sales Orders are created or edited with a case, I want line codes set automatically and POs linked, so that coding is consistent and procurement is traceable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custbody_nx_case | create, edit, dropship, special order, approve | Set line codes based on revenue stream and link created POs |
| beforeSubmit | custcol_sn_nx_task_type | edit and rental delivery criteria met | Set `isclosed` on rental delivery lines |

---

## 5. Functional Requirements
- Run on create, edit, dropship, special order, and approve contexts.
- When `custbody_nx_case` is present, lookup revenue stream codes and set `custcol_sna_repair_code`, `custcol_sna_work_code`, and `custcol_sna_group_code` on each item line.
- If revenue stream codes are empty and `custcol_sna_hul_nxc_retain_task_codes` is true, copy prior line codes.
- Set `custcol_sna_linked_po` when `createdpo` is present.
- On edit, set `isclosed` for rental delivery lines when item, task type, and amount conditions are met.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Support Case
- Revenue Stream (customrecord_cseg_sna_revenue_st)

### Fields Referenced
- Sales Order | custbody_nx_case
- Sales Order line | custcol_sna_repair_code
- Sales Order line | custcol_sna_work_code
- Sales Order line | custcol_sna_group_code
- Sales Order line | custcol_sna_linked_po
- Sales Order line | custcol_sna_hul_nxc_retain_task_codes
- Sales Order line | custcol_sn_nx_task_type
- Script parameters | custscript_sn_rental_delivery_internal, custscript_sn_task_type_check_in

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Revenue stream codes missing and retain flag false; no code updates.
- Rental delivery line meets criteria; line is closed.

---

## 8. Implementation Notes (Optional)
- Uses lookupFields for revenue stream codes.
- Performance/governance considerations: lookupFields per transaction and line updates per line.

---

## 9. Acceptance Criteria
- Given a Sales Order with a case and revenue stream codes, when saved, then item lines receive correct codes.
- Given a line with created PO, when saved, then `custcol_sna_linked_po` is set.
- Given rental delivery line criteria are met, when editing, then the line is closed.

---

## 10. Testing Notes
- SO with case and revenue stream codes; verify line code updates.
- SO line with created PO; verify linked PO field set.
- Rental delivery line criteria met; verify line closed.

---

## 11. Deployment Notes
- Upload `sn_hul_ue_so_opt.js`.
- Deploy on Sales Order.
- Configure script parameters.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should code values be re-applied on edit when case changes?
- Risk: Incorrect retain logic results in wrong codes.

---
