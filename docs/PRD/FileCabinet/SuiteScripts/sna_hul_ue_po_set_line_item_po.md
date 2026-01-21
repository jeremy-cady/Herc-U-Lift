# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-POSetLineItemPO
title: PO Line Internal ID Stamp
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_po_set_line_item_po.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder

---

## 1. Overview
User Event that stamps the Purchase Order internal ID onto each PO line item.

---

## 2. Business Goal
Provide a line-level reference to the PO ID for reporting or downstream processes.

---

## 3. User Story
As a reporting user, when I export PO line data, I want the PO ID on each line, so that line data includes its header reference.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Line items | PO create/edit (non-delete) | Set `custcol_sna_item_po_number` on each line |

---

## 5. Functional Requirements
- Run afterSubmit on PO create/edit (non-delete).
- Load the PO and set `custcol_sna_item_po_number` on each line.
- Save the PO with updated line values.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder

### Fields Referenced
- purchaseorder line | custcol_sna_item_po_number | PO internal ID

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Delete event does not update lines.
- Save errors are logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: PO load/save per event.

---

## 9. Acceptance Criteria
- Given a saved PO, when afterSubmit runs, then all lines contain the PO internal ID.

---

## 10. Testing Notes
- Save PO and verify line field values.
- Delete event does not update lines.
- Deploy User Event on Purchase Order.

---

## 11. Deployment Notes
- Confirm line custom field exists on PO.
- Deploy User Event on Purchase Order and validate line field updates.
- Monitor logs for save errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should line field update be skipped for large POs to reduce load?

---
