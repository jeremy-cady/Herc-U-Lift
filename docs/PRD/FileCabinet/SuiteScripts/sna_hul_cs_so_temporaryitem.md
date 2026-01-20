# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOTemporaryItem
title: Sales Order Temporary Item Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_so_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A client script that validates required fields for temporary item lines on Sales Orders.

---

## 2. Business Goal
Enforce required vendor and pricing information for temporary items to prevent incomplete line entries.

---

## 3. User Story
As a sales user, when I add temporary item lines, I want required fields validated, so that data is complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| validateLine | custcol_sna_hul_itemcategory | temp item category | Require temp item fields |
| saveRecord | temp item lines | temp item category | Validate required fields across lines |

---

## 5. Functional Requirements
- On line validation, if the item category is the temp item category, ensure required fields are populated.
- Required fields include:
  - `custcol_sna_hul_item_vendor` or `custcol_sna_hul_vendor_name`
  - `custcol_sna_hul_vendor_item_code`
  - `description`
  - `quantity`
  - `porate`
  - `rate`
- On save, validate all temp item lines with the same rules.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- Line | custcol_sna_hul_itemcategory
- Line | custcol_sna_hul_item_vendor
- Line | custcol_sna_hul_vendor_item_code
- Line | custcol_sna_hul_vendor_name
- Line | description
- Line | quantity
- Line | porate
- Line | rate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Temp vendor missing and vendor name empty; alert shown.
- Missing PO rate or rate; line blocked.
- Missing temp category parameter should skip validation.

---

## 8. Implementation Notes (Optional)
- Uses script parameter `custscript_sna_hul_tempitemcat`.

---

## 9. Acceptance Criteria
- Given a temp item line with missing required fields, when validating or saving, then commit/save is blocked with an alert.

---

## 10. Testing Notes
- Temp item line with all required fields; save succeeds.
- Missing vendor or vendor name; alert shown.
- Missing PO rate or rate; line blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_so_temporaryitem.js`.
- Deploy to Sales Order form.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should a missing vendor name trigger auto-creation rules?
- Risk: Users bypass validation by changing category after entry.

---
