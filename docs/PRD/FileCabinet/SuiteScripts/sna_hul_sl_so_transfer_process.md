# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoTransferProcess
title: SO Transfer Process
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_so_transfer_process.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - transferorder
  - inventorytransfer
  - location

---

## 1. Overview
Suitelet that displays sales order lines and creates transfer orders or inventory transfers.

---

## 2. Business Goal
Automates creation of inventory transfers/transfer orders for sales order lines requiring transfer shipping.

---

## 3. User Story
- As a logistics user, when I create transfers from SO lines, I want inventory to move correctly, so that fulfillment is accurate.
- As an inventory manager, when I enter bin transfer details, I want bin-level accuracy maintained, so that stock is correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | soId, subsidiary | Parameters provided | Create transfer transactions for selected lines and link back to SO |

---

## 5. Functional Requirements
- Accept `soId` and subsidiary parameters.
- Search SO lines meeting transfer criteria and build a sublist.
- Distinguish Transfer Orders vs Inventory Transfers based on location type.
- Create transfer transactions from selected lines, including inventory detail bins.
- Update SO lines with `custcol_sna_hul_so_linked_transfer` references.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- transferorder
- inventorytransfer
- location

### Fields Referenced
- SO Line | custcol_sna_hul_so_linked_transfer | Linked transfer
- SO Line | custcol_sna_hul_ship_meth_vendor | Ship method
- Location | custrecord_hul_loc_type | Location type

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No eligible lines yields empty sublist.
- Inventory detail missing logs errors and skips lines.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple record creates and SO updates.

---

## 9. Acceptance Criteria
- Given eligible lines, when the Suitelet runs, then lines appear in the sublist with quantities and locations.
- Given selected lines, when the Suitelet runs, then transfer transactions are created successfully.
- Given transfers are created, when the Suitelet completes, then SO lines link back to the transfers.

---

## 10. Testing Notes
Manual tests:
- Lines create Transfer Orders for non-van locations.
- Lines create Inventory Transfers for van locations.
- No eligible lines yields empty sublist.
- Inventory detail missing logs errors and skips lines.

---

## 11. Deployment Notes
- Client script deployed.
- Deploy Suitelet.
- Link to SO UI action.

---

## 12. Open Questions / TBDs
- Should transfer creation enforce quantity availability limits?

---
