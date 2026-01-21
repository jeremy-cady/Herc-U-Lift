# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ConsumableLookups
title: Consumable Lookups
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_consumable_lookups.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_nx_consumable
  - customrecord_nx_asset

---

## 1. Overview
User Event that sources fields from NX Consumable records to Sales Order lines created or edited by NX.

---

## 2. Business Goal
Populate Sales Order line and header fields with consumable metadata without manual entry.

---

## 3. User Story
As an order processor, when consumables are added to a Sales Order, I want consumable details auto-populated, so that orders include correct vendor and service data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | Sales Order lines | create/edit with unprocessed consumable lines | Source mapped consumable fields to lines and header |

---

## 5. Functional Requirements
- Run beforeSubmit on Sales Order create/edit.
- Identify unprocessed lines with `custcol_nx_consumable`.
- Source mapped fields from `customrecord_nx_consumable` to line fields.
- Set `custcol_sn_hul_nx_consum_src_done` to prevent reprocessing.
- Update Sales Order header fields for task and equipment when provided.
- Clear equipment asset values if the consumable asset does not match the native asset.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_nx_consumable
- customrecord_nx_asset

### Fields Referenced
- salesorder line | custcol_nx_consumable | Consumable reference
- salesorder line | custcol_sn_hul_nx_consum_src_done | Processing flag
- salesorder line | custcol_sna_work_code | Work code
- salesorder line | custcol_sna_repair_code | Repair code
- salesorder line | custcol_sna_group_code | Group code
- salesorder line | custcol_sna_hul_act_service_hours | Service hours
- salesorder line | custcol_nxc_equip_asset | Equipment asset
- salesorder line | custcol_sna_hul_nxc_retain_task_codes | Retain task codes
- salesorder line | custcol_sna_hul_item_vendor | Vendor
- salesorder line | custcol_sna_hul_vendor_item_code | Vendor item code
- salesorder line | custcol_sna_hul_vendor_name | Vendor name
- salesorder line | custcol_sna_hul_vendor_sub | Vendor subsidiary
- salesorder line | custcol_sna_hul_vendor_address1 | Vendor address 1
- salesorder line | custcol_sna_hul_vendor_address2 | Vendor address 2
- salesorder line | custcol_sna_hul_vendor_zipcode | Vendor zip
- salesorder line | custcol_sna_hul_vendor_phone_no | Vendor phone
- salesorder line | porate | PO rate
- salesorder line | description | Description
- salesorder | custbody_nx_task | Task
- salesorder | custbody_sna_hul_nxc_eq_asset | Equipment asset
- salesorder | custbody_sna_equipment_object | Asset object
- customrecord_nx_consumable | custrecord_sna_cons_eq_asset | Equipment asset
- customrecord_nx_consumable | custrecord_nx_constask | Task

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Lines already processed do not update.
- Consumable with mismatched asset parent clears equipment asset.
- Missing consumable values are handled without errors.

---

## 8. Implementation Notes (Optional)
- Equipment asset values are cleared if consumable asset parent does not match native asset.
- Performance/governance considerations: Moderate for orders with many lines.

---

## 9. Acceptance Criteria
- Given a Sales Order with new consumable lines, when beforeSubmit runs, then mapped consumable fields are copied to line fields.
- Given header task/equipment data on consumable, when beforeSubmit runs, then Sales Order header fields update.
- Given processed lines, when beforeSubmit runs, then lines remain unchanged.

---

## 10. Testing Notes
- Add consumable line and verify mapped fields are populated.
- Consumable with mismatched asset parent clears equipment asset.
- Line already processed does not update.
- Deploy User Event on Sales Order.

---

## 11. Deployment Notes
- Confirm consumable field mappings match record definitions.
- Deploy User Event on Sales Order and validate consumable field sourcing.
- Monitor logs for missing consumable data; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should lines be re-sourced if consumable data changes after save?

---
