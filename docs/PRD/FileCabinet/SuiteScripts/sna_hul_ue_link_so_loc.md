# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LinkSOLoc
title: Link Sales Order and Location on Purchase Orders
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_link_so_loc.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder
  - salesorder
  - location

---

## 1. Overview
User Event that links Purchase Order lines to the originating Sales Order and sets header/line locations based on Sales Order location hierarchy.

---

## 2. Business Goal
Ensure Purchase Orders use consistent location values and maintain a link to the originating Sales Order.

---

## 3. User Story
As a buyer, when a PO is created from a Sales Order, I want linked SO and location values populated, so that routing is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | createdfrom, location | PO create/special order | Set header/line locations and linked SO fields |

---

## 5. Functional Requirements
- Run beforeSubmit on PO create and special order events.
- If `createdfrom` exists, load the Sales Order and determine its header location.
- Set PO header `location` to the parent of the SO location.
- Set PO line fields `custcol_sna_linked_so`, `location`, and `custcol_sna_hul_so_location`.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder
- salesorder
- location

### Fields Referenced
- purchaseorder line | custcol_sna_linked_so | Linked Sales Order
- purchaseorder line | custcol_sna_hul_so_location | SO location reference

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SO without parent location leaves location blank.
- Load errors are logged.
- Only runs on PO create/special order events.

---

## 8. Implementation Notes (Optional)
- Uses location parent hierarchy.

---

## 9. Acceptance Criteria
- Given a PO created from an SO, when beforeSubmit runs, then header location is set to the parent location of the SO location.
- Given a PO created from an SO, when beforeSubmit runs, then linked SO and SO location fields are set on PO lines.

---

## 10. Testing Notes
- PO created from SO inherits parent location and linked SO references.
- SO without parent location leaves location blank.
- Deploy User Event on Purchase Order.

---

## 11. Deployment Notes
- Confirm location hierarchy data exists.
- Deploy User Event on Purchase Order and validate location updates.
- Monitor logs for missing location data; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should line locations use SO line locations instead of header location?

---
