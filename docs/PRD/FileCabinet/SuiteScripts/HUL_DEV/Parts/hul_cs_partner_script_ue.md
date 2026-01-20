# PRD: Partner Role Line Column Hiding (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PartnerColumnHideUE
title: Partner Role Line Column Hiding (User Event)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_cs_partner_script_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions with item sublist

---

## 1. Overview
A User Event script that hides specific item sublist columns on transaction forms for a defined set of partner-related roles.

---

## 2. Business Goal
Limit visibility of internal pricing/commission and operational fields for partner roles, reducing clutter and exposure.

---

## 3. User Story
- As a partner user, I want fewer internal columns so that the form is clearer.
- As an admin, I want sensitive fields hidden so that partners don’t see internal data.
- As a support user, I want the behavior consistent across view/edit/create so that training is simple.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (view/edit/create) | item sublist fields | Role in 3, 1495, 1174, 1175, 1185, 1163, 1168, 1152 | Set display type to HIDDEN for specified columns |

---

## 5. Functional Requirements
- The system must run on beforeLoad.
- The system must execute for VIEW, EDIT, and CREATE contexts.
- The system must check the current user role against 3, 1495, 1174, 1175, 1185, 1163, 1168, 1152.
- When the role matches, the system must hide the following item sublist fields: custcol_sna_hul_act_service_hours, custcol_ava_multitaxtypes, custcol_sn_hul_billingsched, custcol_sna_sales_rep, custcol_sna_hul_comm_rate, custcol_sna_hul_sales_rep_comm_type, custcol_sna_hul_eligible_for_comm, custcol_sna_commission_amount, custcol_sna_override_commission, custcol_sna_commission_plan, custcol_sna_sales_rep_matrix, custcol_sna_hul_sales_rep_csm, custcol_sna_cpg_resource, custcol_sna_hul_returns_handling, custcol_sna_hul_temp_item_uom, custcol_sna_linked_transaction, custcol_sna_hul_gen_prodpost_grp, custcol_sna_so_service_code_type, custcol_sna_po_fleet_code, custcol_sna_source_transaction, custcol_sna_service_itemcode, custcol_sna_default_rev_stream, custcol_sn_for_warranty_claim, custcol_sna_exc_notes, custcol_sna_used_qty_exc, custcol_nx_asset, custcol_nx_consumable, custcol_nx_task, custcol_nxc_case, custcol_nxc_equip_asset, commitmentfirm, custcol_ava_shiptousecode, cseg_sna_hul_eq_seg, cseg_hul_mfg, custcol_sna_hul_fleet_no, custcol_sna_hul_obj_model, custcol_sna_obj_serialno, custcol_sna_obj_fleetcode, custcol_sna_week_bestprice, custcol_sna_day_bestprice, orderpriority, expectedshipdate, excludefromraterequest, custcol_sna_extra_days, itemfulfillmentchoice, custcol_sna_group_code, custcol_sna_hul_item_category, custcol_sn_internal_billing_processed, custcol_sna_hul_newunitcost, custcolsna_hul_newunitcost_wodisc, custcol_sna_task_assigned_to, custcol_sna_taskcase, custcol_sna_task_company, custcol_sna_taskdate, custcol_sna_time_posted, custcol_sna_work_code, custcol_sna_repair_code.
- Missing columns must be logged but not block execution.

---

## 6. Data Contract
### Record Types Involved
- Transactions with item sublist

### Fields Referenced
- Role IDs: 3, 1495, 1174, 1175, 1185, 1163, 1168, 1152
- Item sublist fields listed in Functional Requirements

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing sublist fields are logged and do not block execution.
- Non-partner roles are unaffected.

---

## 8. Implementation Notes (Optional)
- UI-only; does not enforce record-level permissions.

---

## 9. Acceptance Criteria
- Given partner roles, when viewing/editing/creating, then specified item columns are hidden.
- Given non-partner roles, when viewing/editing/creating, then columns remain visible.
- Given missing fields, when encountered, then no errors are thrown.

---

## 10. Testing Notes
- Log in with a partner role and verify columns hidden on view/edit/create.
- Log in with a non-partner role and verify columns visible.
- Verify missing fields do not throw errors.

---

## 11. Deployment Notes
- Upload hul_cs_partner_script_ue.js.
- Create User Event script record and deploy on target transaction types.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should role IDs be maintained in a configuration record?
- Are all columns still relevant for hiding?
- Role IDs change.
- Hidden fields assumed secure.

---
