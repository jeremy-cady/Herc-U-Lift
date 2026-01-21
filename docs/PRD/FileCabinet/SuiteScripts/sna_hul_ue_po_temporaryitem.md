# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-POTemporaryItem
title: PO Temporary Item Handling
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_po_temporaryitem.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - purchaseorder
  - salesorder
  - location

---

## 1. Overview
User Event that updates special order Purchase Orders for temporary items, syncing temp codes, locations, quantities, and memo from Sales Orders.

---

## 2. Business Goal
Ensure temporary item POs reflect the correct Sales Order data and location hierarchy for fulfillment.

---

## 3. User Story
As a buyer, when special order POs are created for temp items, I want PO lines synced to SO lines, so that POs match Sales Order requirements.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | SO line reference | PO create/copy | Remove non-matching lines and set PO memo/ship method |
| afterSubmit | Temp item fields | special order/dropship/PO type | Sync temp codes, locations, memo from SO lines and remove mismatched ship method lines |

---

## 5. Functional Requirements
- On beforeLoad create/copy, remove non-matching lines for a targeted SO line and set the PO memo/ship method.
- On afterSubmit for special orders/dropship/PO type, sync temp codes, locations, and memo from SO lines.
- Set PO line location to parent of SO location when available.
- Remove PO lines with mismatched ship methods when special order or dropship.

---

## 6. Data Contract
### Record Types Involved
- purchaseorder
- salesorder
- location

### Fields Referenced
- purchaseorder | custbody_sna_hul_orderid | Order line key
- purchaseorder | custbody_sna_soline_memo | SO line memo
- purchaseorder line | custcol_sna_hul_temp_item_code | Temp item code
- purchaseorder line | custcol_sna_hul_itemcategory | Item category
- purchaseorder line | custcol_sna_hul_ship_meth_vendor | Ship method vendor
- purchaseorder line | custcol_sna_hul_so_location | SO location
- purchaseorder line | description | Line memo
- salesorder line | custcol_sna_hul_temp_item_code | Temp item code
- salesorder line | custcol_sna_hul_itemcategory | Item category
- salesorder line | custcol_nx_task | NX task
- salesorder line | location | Line location
- salesorder line | memo | Line memo

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- PO lines with different ship method are removed.
- Parent location missing uses SO location.
- Save errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses location parent lookup for line location.
- Only applies to special orders, dropship, or configured PO type values.

---

## 9. Acceptance Criteria
- Given a special order PO, when afterSubmit runs, then temp item lines match SO line data.
- Given a parent location, when syncing, then PO line location is set to parent of SO location.
- Given ship method mismatches, when syncing, then non-matching lines are removed.

---

## 10. Testing Notes
- Special order PO syncs temp item codes and locations from SO.
- PO lines with different ship method are removed.
- Parent location missing uses SO location.
- Deploy User Event on Purchase Order.

---

## 11. Deployment Notes
- Configure temp item category parameters.
- Deploy User Event on Purchase Order and validate temp item PO line updates.
- Monitor logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the suitelet auto-receive logic be re-enabled?

---
