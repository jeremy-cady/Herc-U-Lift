# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VBSetOverrideCheckbox
title: Vendor Bill Override IR Price Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_vb_setoverridecheckbox.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Bill
  - Purchase Order

---

## 1. Overview
A client script that toggles IR price override flags on Vendor Bill lines based on price differences from related purchase orders.

---

## 2. Business Goal
Ensure IR price override flags are set when vendor bill rates differ from related PO rates.

---

## 3. User Story
As an AP user, when vendor bill rates differ from PO rates, I want override flags set automatically, so that IR prices reflect vendor bill differences.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custcol_sna_hul_ir_price_diff | value changed | Mirror to custcol_sna_override_ir_price |
| fieldChanged | rate | rate changed | Compare to PO rate and set flags if different |

---

## 5. Functional Requirements
- When `custcol_sna_hul_ir_price_diff` changes, set `custcol_sna_override_ir_price` to the same value.
- When `rate` changes on a line, load related PO rate data using saved search `customsearch_sna_bill_purchaseorders`.
- If the related PO rate differs from the line rate, set:
  - `custcol_sna_hul_ir_price_diff` to true
  - `custcol_sna_override_ir_price` to true
- Cache related PO lookup results per item.

---

## 6. Data Contract
### Record Types Involved
- Vendor Bill
- Purchase Order

### Fields Referenced
- Line | custcol_sna_hul_ir_price_diff
- Line | custcol_sna_override_ir_price
- Line | item
- Line | rate

Schemas (if known):
- Saved search: customsearch_sna_bill_purchaseorders

---

## 7. Validation & Edge Cases
- No related PO line; flags not set.
- Rate equals PO rate; flags remain false.
- Saved search missing; no updates should occur.

---

## 8. Implementation Notes (Optional)
- Uses saved search data tied to applying transaction.
- Client-side search and caching per item.

---

## 9. Acceptance Criteria
- Given rate differs from PO rate, when changed, then override flags are set.
- Given `custcol_sna_hul_ir_price_diff` toggled, when changed, then override flag mirrors it.

---

## 10. Testing Notes
- Change rate and verify override flags set when PO rate differs.
- No related PO line; flags not set.
- Rate equals PO rate; flags remain false.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_vb_setoverridecheckbox.js`.
- Deploy to Vendor Bill form.
- Rollback: remove client script deployment from Vendor Bill form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the cached lookup reset when vendor bill lines change items?
- Risk: Saved search returns multiple PO lines.

---
