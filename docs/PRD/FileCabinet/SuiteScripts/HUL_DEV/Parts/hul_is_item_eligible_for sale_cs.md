# PRD: Validate Item Eligibility for Sale (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemEligibleForSaleCS
title: Validate Item Eligibility for Sale (Client Script)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item

---

## 1. Overview
A client script that validates inventory items on line entry and blocks non-eligible items, showing a SweetAlert warning with an alternate part suggestion.

---

## 2. Business Goal
Prevent sales of parts that are marked as not eligible and guide users to an alternate part when available.

---

## 3. User Story
- As a parts user, I want ineligible items blocked so that I don’t sell the wrong part.
- As an admin, I want alternate part suggestions so that users can correct quickly.
- As a support user, I want a clear warning so that I understand why the line is blocked.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | sweetAlert.preload | Page load | Preload SweetAlert2 |
| validateLine | item | Item type InvtPart and custitem_hul_eligible_for_sale = false | Show warning and block line |

---

## 5. Functional Requirements
- The system must preload SweetAlert on pageInit.
- On validateLine for the item sublist, the system must read the current item value and query item type via SuiteQL.
- If the item type is InvtPart, the system must query custitem_hul_eligible_for_sale and custitem_hul_alt_part, and if eligibility is false, fetch the alternate part item ID and itemid.
- When eligibility is false, the system must show sweetAlert.partsIsEligibleSwalMessage(altPartName) and return false to block the line.
- When eligibility is true or errors occur, the system must allow the line.

---

## 6. Data Contract
### Record Types Involved
- Item

### Fields Referenced
- item
- custitem_hul_eligible_for_sale
- custitem_hul_alt_part

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Non-inventory item added: validation does nothing.
- Alternate part missing: warning still displays.
- SuiteQL error allows line to proceed.

---

## 8. Implementation Notes (Optional)
- Uses SuiteQL client-side; assumes permission to query item data.

---

## 9. Acceptance Criteria
- Given an ineligible inventory item, when validating a line, then the line is blocked and a warning displays.
- Given an eligible item, when validating a line, then it passes validation.
- Given an error, when it occurs, then the line is allowed.

---

## 10. Testing Notes
- Add eligible inventory item and confirm line saves.
- Add ineligible inventory item with alternate part and confirm warning + block.
- Add non-inventory item and confirm no validation.
- Verify SuiteQL errors allow line.

---

## 11. Deployment Notes
- Upload hul_is_item_eligible_for sale_cs.js.
- Deploy as a client script on transaction forms with item sublist.
- Verify SweetAlert library access.
- Rollback: disable the client script deployment.

---

## 12. Open Questions / TBDs
- Should eligibility checks move server-side?
- Should alternate part be required when ineligible?
- Client-side SuiteQL latency.
- Missing alternate part.

---
