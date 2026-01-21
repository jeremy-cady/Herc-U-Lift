# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddTempItem
title: Add Temporary Item
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_addtempitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - item
  - vendor
  - customrecord_shipping_list
  - transaction

---

## 1. Overview
Suitelet for the "Add Temporary Item" button that creates a popup form and inserts an item line into the parent transaction.

---

## 2. Business Goal
Allows users to add temporary or special items to transactions with vendor and shipping details.

---

## 3. User Story
- As a sales user, when I add a temporary item quickly, I want to complete an order, so that the transaction can proceed.
- As a purchasing user, when I specify vendor and PO rate, I want costs captured correctly, so that the transaction is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | TBD | "Add Temporary Item" button opens popup | Render form and insert line item on submit |

---

## 5. Functional Requirements
- Render a form with required fields: item, vendor, vendor item code, quantity, PO rate, description.
- List item options filtered by configured temporary item categories.
- List shipping methods from `customrecord_shipping_list`.
- On submit, inject a line item into the parent record using `window.opener` calls.
- Set PO rate to `porate` for Sales Orders and `custcol_sna_hul_estimated_po_rate` for other records.

---

## 6. Data Contract
### Record Types Involved
- item
- vendor
- customrecord_shipping_list
- transaction

### Fields Referenced
- item.custitem_sna_hul_itemcategory
- transactionline.custcol_sna_hul_ship_meth_vendor
- transactionline.custcol_sna_hul_item_vendor
- transactionline.custcol_sna_hul_vendor_item_code
- transactionline.custcol_sna_hul_estimated_po_rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Non-SO record uses `custcol_sna_hul_estimated_po_rate` for rate.
- No items available for categories results in empty item list.
- Missing required fields prevents submit.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Uses legacy `nlapi*` calls from the parent window.

---

## 9. Acceptance Criteria
- Given configured temporary item categories, when the form loads, then item options reflect those categories.
- Given required fields are missing, when the user submits, then submission is blocked.
- Given a valid submission, when the Suitelet runs, then the line item is added to the parent record with provided values.

---

## 10. Testing Notes
Manual tests:
- Form loads and lists temporary items.
- Submission adds item line with vendor, quantity, rate, and description.
- Non-SO record uses `custcol_sna_hul_estimated_po_rate` for rate.
- No items available for categories results in empty item list.
- Missing required fields prevents submit.

---

## 11. Deployment Notes
- Configure category parameters.
- Confirm client script deployment.
- Deploy Suitelet.
- Add button on parent transaction to launch Suitelet.

---

## 12. Open Questions / TBDs
- Should the Suitelet validate vendor-item combinations?

---
