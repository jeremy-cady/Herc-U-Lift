# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_hide_line_item_columns_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Parts/hul_hide_line_item_columns_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction

---

## 1. Overview
User Event script that hides many item sublist columns on specific Sales Order forms for certain roles.

---

## 2. Business Goal
Hide non-essential item columns for specific roles on a targeted Sales Order form.

---

## 3. User Story
As a user in an allowed role, when I view or edit a Sales Order on the specified form, I want certain item columns hidden, so that the form is simplified.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| VIEW (beforeLoad) | item sublist fields | Custom form ID is 106 and role is allowed | Hide specified item columns |
| EDIT (beforeLoad) | item sublist fields | Custom form ID is 106 and role is allowed | Hide specified item columns |

---

## 5. Functional Requirements
- On VIEW and EDIT, read the transaction custom form ID via SuiteQL.
- If form ID is 106 and role is in allowed list (1495, 1175, 1174, 1185, 1163, 1168, 1152), hide the specified item sublist columns.
- Hide the following item sublist fields:
  - custcol_sna_hul_act_service_hours
  - custcol_ava_multitaxtypes
  - custcol_sn_hul_billingsched
  - custcol_sna_sales_rep
  - custcol_sna_hul_comm_rate
  - custcol_sna_hul_sales_rep_comm_type
  - custcol_sna_hul_eligible_for_comm
  - custcol_sna_commission_amount
  - custcol_sna_override_commission
  - custcol_sna_commission_plan
  - custcol_sna_sales_rep_matrix
  - custcol_sna_hul_sales_rep_csm
  - custcol_sna_cpg_resource
  - custcol_sna_hul_returns_handling
  - custcol_sna_hul_temp_item_uom
  - custcol_sna_linked_transaction
  - custcol_sna_hul_gen_prodpost_grp
  - custcol_sna_so_service_code_type
  - custcol_sna_po_fleet_code
  - custcol_sna_source_transaction
  - custcol_sna_service_itemcode
  - custcol_sna_default_rev_stream
  - custcol_sn_for_warranty_claim
  - custcol_sna_exc_notes
  - custcol_sna_used_qty_exc
  - custcol_nx_asset
  - custcol_nx_consumable
  - custcol_nx_task
  - custcol_nxc_case
  - custcol_nxc_equip_asset
  - commitmentfirm
  - custcol_ava_shiptousecode
  - cseg_sna_hul_eq_seg
  - cseg_hul_mfg
  - custcol_sna_hul_fleet_no
  - custcol_sna_hul_obj_model
  - custcol_sna_obj_serialno
  - custcol_sna_obj_fleetcode
  - custcol_sna_week_bestprice
  - custcol_sna_day_bestprice
  - orderpriority
  - expectedshipdate
  - excludefromraterequest
  - custcol_sna_extra_days
  - itemfulfillmentchoice
  - custcol_sna_group_code
  - custcol_sna_hul_item_category
  - custcol_sn_internal_billing_processed
  - custcol_sna_hul_newunitcost
  - custcolsna_hul_newunitcost_wodisc
  - custcol_sna_task_assigned_to
  - custcol_sna_taskcase
  - custcol_sna_task_company
  - custcol_sna_taskdate
  - custcol_sna_time_posted
  - custcol_sna_work_code
  - custcol_sna_repair_code

---

## 6. Data Contract
### Record Types Involved
- Transaction

### Fields Referenced
- customform
- Item sublist fields listed in Functional Requirements

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Applies only when custom form ID is 106.

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
- Specific transaction type(s)
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
