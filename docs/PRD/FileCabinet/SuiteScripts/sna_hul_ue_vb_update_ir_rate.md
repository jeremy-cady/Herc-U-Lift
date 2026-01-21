# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VbUpdateIrRate
title: Update Item Receipt Rates from Vendor Bill
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_vb_update_ir_rate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - vendorbill
  - itemreceipt

---

## 1. Overview
Updates item receipt line rates to match vendor bill rates when the override flag is selected.

---

## 2. Business Goal
Keep inventory costs aligned with vendor bill adjustments when overrides are requested.

---

## 3. User Story
As an accounting user, when I save a vendor bill with override flags, I want related item receipt rates updated so that costs reflect actual vendor pricing.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custcol_sna_override_ir_price | non-delete | Load vendor bill, find related IR lines, and update rates where override is true. |

---

## 5. Functional Requirements
- On afterSubmit (non-delete), load the vendor bill and iterate item lines.
- For lines with `custcol_sna_override_ir_price` true, locate related item receipt lines using `customsearch_sna_po_ir_vb_trans_con_line`.
- Update the related item receipt line rate to match the vendor bill rate and save the receipt.

---

## 6. Data Contract
### Record Types Involved
- Vendor Bill
- Item Receipt

### Fields Referenced
- Vendor Bill line | custcol_sna_override_ir_price | Override IR price

Schemas (if known):
- Saved search | customsearch_sna_po_ir_vb_trans_con_line | PO/IR/VB line linkage

---

## 7. Validation & Edge Cases
- Vendor bills without override flags do not update receipts.
- If no related item receipt is found, no updates occur.
- Delete context does not trigger updates.

---

## 8. Implementation Notes (Optional)
- Uses record load/save per related item receipt line.
- Saved search drives VB-to-IR linkage.

---

## 9. Acceptance Criteria
- Given a vendor bill line with override true, when the bill is saved, then related item receipt lines are updated to the vendor bill rate.
- Given no override lines, when the bill is saved, then no item receipt updates occur.
- Given delete context, when afterSubmit runs, then no updates occur.

---

## 10. Testing Notes
- Save a vendor bill with override flag and verify related IR line rate updates.
- Save a vendor bill without overrides and verify no IR changes.
- Delete a vendor bill and verify no updates occur.

---

## 11. Deployment Notes
- Ensure saved search `customsearch_sna_po_ir_vb_trans_con_line` is available.
- Deploy the user event to Vendor Bill.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should updates be batched to reduce record loads on large bills?

---
