# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LinkPO
title: Link Purchase Orders on Sales Orders
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_link_po.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder

---

## 1. Overview
User Event that populates Sales Order line field `custcol_sna_linked_po` with the created Purchase Order ID.

---

## 2. Business Goal
Ensure Sales Order lines track the PO created from them.

---

## 3. User Story
As a buyer, when POs are created from SO lines, I want the linked PO populated, so that I can track purchasing progress.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | createdpo | Sales Order create/edit/dropship/special order/approve | Set `custcol_sna_linked_po` from created PO |

---

## 5. Functional Requirements
- Run afterSubmit on Sales Order create/edit/dropship/special order/approve.
- Load the Sales Order and iterate lines.
- If `createdpo` exists on a line, set `custcol_sna_linked_po` to that value.

---

## 6. Data Contract
### Record Types Involved
- salesorder

### Fields Referenced
- salesorder line | createdpo | Created PO
- salesorder line | custcol_sna_linked_po | Linked PO

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Lines without created POs remain blank.
- Record save errors are logged.

---

## 8. Implementation Notes (Optional)
- Runs on multiple event types including dropship/special order.

---

## 9. Acceptance Criteria
- Given an SO line with a created PO, when afterSubmit runs, then `custcol_sna_linked_po` is populated.

---

## 10. Testing Notes
- Create PO from SO line and verify linked PO is populated.
- Lines without created POs remain blank.
- Deploy User Event on Sales Order.

---

## 11. Deployment Notes
- Confirm linked PO custom field exists on SO lines.
- Deploy User Event on Sales Order and validate linked PO updates.
- Monitor logs for save errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should linked PO update run on delete events?

---
