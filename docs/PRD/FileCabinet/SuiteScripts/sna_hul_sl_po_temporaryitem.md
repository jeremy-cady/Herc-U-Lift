# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PoTemporaryItem
title: PO Temporary Item Processing
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_po_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder
  - itemreceipt
  - vendorbill

---

## 1. Overview
Suitelet that transforms a Purchase Order into an Item Receipt and Vendor Bill for temporary items.

---

## 2. Business Goal
Automates receipt and billing for temporary items with proper inventory assignments and line filtering.

---

## 3. User Story
- As a purchasing user, when I automate temporary item receipts, I want processing to be faster, so that receiving is efficient.
- As an AP user, when I auto-generate vendor bills, I want billing aligned with temp items, so that payables are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | poid | Request body JSON provided | Transform PO to Item Receipt and Vendor Bill for temp items |

---

## 5. Functional Requirements
- Read `poid` from the request body JSON.
- Transform the PO into an Item Receipt.
- For temp items with a temp code and matching categories, set inventory assignment lines.
- Set `itemreceive` based on whether a task is present.
- Save the Item Receipt and, if successful, transform the PO to a Vendor Bill.
- Remove Vendor Bill lines not matching temp categories or missing tasks.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder
- itemreceipt
- vendorbill

### Fields Referenced
- PO Line | custcol_sna_hul_temp_item_code | Temp item code
- PO Line | custcol_sna_hul_itemcategory | Item category
- PO Line | custcol_nx_task | Task
- PO Line | custcol_sna_hul_vendor_name | Vendor name

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Non-temp items are not received or billed.
- Missing task prevents auto-receive and billing for that line.
- Invalid PO ID results in no transformation.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record transforms and line updates.

---

## 9. Acceptance Criteria
- Given temp item lines with tasks, when the Suitelet runs, then an Item Receipt is created with inventory assignment for temp items.
- Given the Vendor Bill is created, when the Suitelet runs, then only valid temp item lines with tasks are included.

---

## 10. Testing Notes
Manual tests:
- Temp item lines with tasks produce IR and VB lines.
- Non-temp items are not received or billed.
- Missing task prevents auto-receive and billing for that line.
- Invalid PO ID results in no transformation.

---

## 11. Deployment Notes
- Verify temp item category parameters.
- Deploy Suitelet.
- Call from integration or workflow with PO ID payload.

---

## 12. Open Questions / TBDs
- Should the Suitelet validate temp code format?

---
