# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LinkSO
title: Link Sales Order on Purchase Orders
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_link_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder

---

## 1. Overview
User Event that links Purchase Order lines to the originating Sales Order and sets PO type for dropship or special order.

---

## 2. Business Goal
Ensure Purchase Orders maintain a direct reference to the originating Sales Order and correct PO type classification.

---

## 3. User Story
As a buyer, when POs are created from Sales Orders, I want linked SO references and PO types set, so that I can track fulfillment context.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custbody_po_type, createdfrom | PO create/dropship/special order | Set PO type and populate linked SO on item lines |

---

## 5. Functional Requirements
- Run afterSubmit on PO create/dropship/special order events.
- If dropship, set `custbody_po_type` to 3.
- If special order, set `custbody_po_type` to 6.
- If `createdfrom` exists, set `custcol_sna_linked_so` on all item lines.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder

### Fields Referenced
- purchaseorder | custbody_po_type | PO type
- purchaseorder line | custcol_sna_linked_so | Linked Sales Order

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- PO without createdfrom does not update linked SO.
- Record save errors are logged.
- Only runs for create/dropship/special order events.

---

## 8. Implementation Notes (Optional)
- PO type values are hard-coded (dropship = 3, special order = 6).

---

## 9. Acceptance Criteria
- Given a dropship or special order PO, when afterSubmit runs, then PO type is set to the correct value.
- Given a PO created from an SO, when afterSubmit runs, then `custcol_sna_linked_so` is populated.

---

## 10. Testing Notes
- Create dropship PO from SO and verify PO type and linked SO.
- PO without createdfrom does not update linked SO.
- Deploy User Event on Purchase Order.

---

## 11. Deployment Notes
- Confirm PO type values for dropship/special order.
- Deploy User Event on Purchase Order and validate linked SO values.
- Monitor logs for save errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should PO type values be configuration-driven?

---
