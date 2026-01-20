# PRD: Hide Line Item Columns by Form and Role (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-HideLineItemColumnsUE
title: Hide Line Item Columns by Form and Role (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_columns_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions with item sublist

---

## 1. Overview
A User Event script that hides a large set of item sublist columns on a specific transaction form for designated roles.

---

## 2. Business Goal
Reduce UI clutter and limit visibility of internal fields when users with partner roles view or edit records on a specific custom form.

---

## 3. User Story
- As a partner user, I want internal columns hidden so that forms are easier to use.
- As an admin, I want the rule limited to a specific form so that other forms remain unchanged.
- As a support user, I want the behavior consistent on view/edit so that partners see the same layout.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (view/edit) | customform | customform = 106 and role in 1495, 1175, 1174, 1185, 1163, 1168, 1152 | Hide specified item sublist fields |

---

## 5. Functional Requirements
- The system must run on beforeLoad for VIEW and EDIT.
- The system must query the transaction’s customform and only proceed if it equals 106.
- The system must check the current user role against 1495, 1175, 1174, 1185, 1163, 1168, 1152.
- When role and form match, the system must hide the following item sublist fields: custcol_sna_hul_act_service_hours, custcol_ava_multitaxtypes, custcol_sn_hul_billingsched, custcol_sna_sales_rep, custcol_sna_hul_comm_rate, custcol_sna_hul_sales_rep_comm_type, custcol_sna_hul_eligible_for_comm, custcol_sna_commission_amount, custcol_sna_override_commission, custcol_sna_commission_plan, custcol_sna_sales_rep_matrix, custcol_sna_hul_sales_rep_csm, custcol_sna_cpg_resource, custcol_sna_hul_returns_handling, custcol_sna_hul_temp_item_uom, custcol_sna_linked_transaction, custcol_sna_hul_gen_prodpost_grp, custcol_sna_so_service_code_type, custcol_sna_po_fleet_code, custcol_sna_source_transaction, custcol_sna_service_itemcode, custcol_sna_default_rev_stream, custcol_sn_for_warranty_claim, custcol_sna_exc_notes, custcol_sna_used_qty_exc, custcol_nx_asset, custcol_nx_consumable, custcol_nx_task, custcol_nxc_case, custcol_nxc_equip_asset, commitmentfirm, custcol_ava_shiptousecode, cseg_sna_hul_eq_seg, cseg_hul_mfg, custcol_sna_hul_fleet_no, custcol_sna_hul_obj_model, custcol_sna_obj_serialno, custcol_sna_obj_fleetcode, custcol_sna_week_bestprice, custcol_sna_day_bestprice, orderpriority, expectedshipdate, excludefromraterequest, custcol_sna_extra_days, itemfulfillmentchoice, custcol_sna_group_code, custcol_sna_hul_item_category, custcol_sn_internal_billing_processed, custcol_sna_hul_newunitcost, custcolsna_hul_newunitcost_wodisc, custcol_sna_task_assigned_to, custcol_sna_taskcase, custcol_sna_task_company, custcol_sna_taskdate, custcol_sna_time_posted, custcol_sna_work_code, custcol_sna_repair_code.
- Missing fields must be logged but not block execution.

---

## 6. Data Contract
### Record Types Involved
- Transactions with item sublist

### Fields Referenced
- customform
- Role IDs: 1495, 1175, 1174, 1185, 1163, 1168, 1152
- Item sublist fields listed in Functional Requirements

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SuiteQL fails: columns remain visible.
- Sublist field missing: no error thrown.

---

## 8. Implementation Notes (Optional)
- SuiteQL used to fetch customform.

---

## 9. Acceptance Criteria
- Given form 106 and a listed role, when viewing/editing, then specified columns are hidden.
- Given other forms or roles, when viewing/editing, then columns remain visible.
- Given missing fields, when encountered, then no errors are thrown.

---

## 10. Testing Notes
- Open a record on form 106 as a listed role and verify columns hidden.
- Open a record on a different form and verify columns visible.
- Verify missing fields do not throw errors.

---

## 11. Deployment Notes
- Upload hul_hide_line_item_columns_ue.js.
- Deploy as a User Event on target transaction record types.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should the form ID be configurable?
- Should the role list be centralized in a config record?
- Form ID changes.
- Role IDs change.

---
