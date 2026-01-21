# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoTemporaryItem
title: SO Temporary Item PO Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_so_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - purchaseorder

---

## 1. Overview
Suitelet that creates special Purchase Orders from a Sales Order for temporary items.

---

## 2. Business Goal
Automates PO creation for temp items by vendor and shipping method, including temp inventory assignments.

---

## 3. User Story
- As a buyer, when I auto-create temp item POs, I want purchasing to be faster, so that procurement is efficient.
- As a planner, when I group POs by vendor and shipping, I want logistics to be consistent, so that fulfillment is smooth.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | soid, poinfo | JSON body provided | Create/update vendor-specific temp item POs |

---

## 5. Functional Requirements
- Accept a JSON body with `soid`, `poinfo`, and flags.
- Create POs by vendor and shipping method and set PO type.
- Remove non-temp item lines and lines not matching vendor/ship group.
- Set temp item rates and inventory assignments when temp codes exist.
- Update existing POs when quantities differ.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- purchaseorder

### Fields Referenced
- SO Line | custcol_sna_hul_item_vendor | Temp vendor
- SO Line | custcol_sna_hul_temp_item_code | Temp item code
- SO Line | custcol_sna_hul_itemcategory | Item category
- SO Line | custcol_sna_hul_temp_porate | Temp PO rate
- SO Line | custcol_sna_hul_ship_meth_vendor | Ship method
- SO Line | custcol_sna_linked_po | Linked PO
- SO Line | custcol_nx_task | Task
- SO Line | custcol_sna_hul_createpo | PO creation type
- SO Line | custcol_sna_po_itemcat | PO item category

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Lines with existing linked POs are skipped.
- Quantity mismatches trigger PO updates.
- PO save errors are logged and processing continues.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: PO creation and line updates.

---

## 9. Acceptance Criteria
- Given vendor and shipping groupings, when the Suitelet runs, then POs are created per vendor and shipping method group.
- Given non-temp lines, when the Suitelet runs, then non-temp items are removed from temp POs.
- Given temp item lines, when the Suitelet runs, then temp item lines have correct rate and inventory detail.

---

## 10. Testing Notes
Manual tests:
- Temp item lines create POs with inventory detail.
- Lines with existing linked POs are skipped.
- Quantity mismatches trigger PO updates.
- PO save errors are logged and processing continues.

---

## 11. Deployment Notes
- Temp item categories configured.
- Deploy Suitelet.
- Trigger from Sales Order workflow.

---

## 12. Open Questions / TBDs
- Should PO grouping include item category in addition to vendor and ship method?

---
