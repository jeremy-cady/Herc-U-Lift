# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ValidateRwPo
title: Validate RW PO
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_validate_rw_po.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder
  - salesorder

---

## 1. Overview
Validates Purchase Orders created from the Requisition Worksheet and links them to Sales Order lines.

---

## 2. Business Goal
Ensures Sales Order lines reference the correct linked PO when procurement is created from requisition workflows.

---

## 3. User Story
- As a procurement user, when POs are created from the Requisition Worksheet, I want them linked to Sales Order lines, so that fulfillment and billing are consistent.
- As an admin, when validation is complete, I want flags cleared, so that records are not reprocessed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custbody_sna_hul_validate_with_so | Purchase Orders flagged for validation | Link PO lines to Sales Order lines and clear validation flag |

---

## 5. Functional Requirements
- Search for Purchase Orders where `custbody_sna_hul_validate_with_so` is true.
- Load each PO and collect item, vendor, linked SO, and SO line ID data from PO lines.
- Load linked Sales Orders and set `custcol_sna_linked_po` on matching lines when empty.
- Set `custbody_sna_hul_validate_with_so` to false after successful processing.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder
- salesorder

### Fields Referenced
- purchaseorder.custbody_sna_hul_validate_with_so
- purchaseorder.custbody_sna_buy_from
- purchaseorderline.custcol_sna_linked_so
- purchaseorderline.custcol_sn_hul_so_line_id
- salesorderline.custcol_sna_csi_povendor
- salesorderline.custcol_sna_linked_po

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- PO lines missing linked SO or line ID are skipped.
- SO lines already linked are not overwritten.
- Invalid Sales Order ID does not stop overall processing.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record load/save usage for each linked Sales Order.

---

## 9. Acceptance Criteria
- Given Sales Order lines match item, vendor, and line ID, when the job runs, then those lines receive the PO link.
- Given a PO is processed, when the job completes, then the PO validation flag is cleared.
- Given lines already contain a linked PO, when the job runs, then those lines are not overwritten.

---

## 10. Testing Notes
Manual tests:
- PO with linked SO and line IDs updates matching SO lines.
- PO lines missing linked SO or line ID are skipped.
- SO lines already linked are not overwritten.
- Invalid Sales Order ID does not stop overall processing.

---

## 11. Deployment Notes
- Confirm validation flag is used in workflow.
- Validate field mapping.
- Deploy Map/Reduce.
- Execute on flagged POs.

---

## 12. Open Questions / TBDs
- Should validation include quantity or rate matching?

---
