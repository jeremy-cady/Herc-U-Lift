# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateInvTransferOnReceipt
title: Create Inventory Transfer on Receipt
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_create_inv_transfer_on_receipt.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemreceipt
  - inventorytransfer
  - subsidiary

---

## 1. Overview
User Event that creates Inventory Transfers from Item Receipts and provides a PDF print option for Inventory Transfers.

---

## 2. Business Goal
Automate moving received inventory to the SO location and support printable transfer documentation.

---

## 3. User Story
As a warehouse user, when an item receipt is created, I want inventory transfers created and printable, so that stock moves to the correct location and I can attach transfer documents to shipments.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Item Receipt lines | create/copy; location differs from `custcol_sna_hul_so_location` | Create Inventory Transfer(s), copy inventory detail, set transfer references |
| beforeLoad | Inventory Transfer | view/edit | Add Print button to generate PDF from template |

---

## 5. Functional Requirements
- On Item Receipt create/copy, group lines by `location` and `custcol_sna_hul_so_location` and create Inventory Transfers when they differ.
- Copy inventory detail assignments (receipt inventory number, bin, quantity) to the transfer.
- Set transfer references on Item Receipt lines and header.
- On Inventory Transfer beforeLoad, add a Print button that generates a PDF using a template.

---

## 6. Data Contract
### Record Types Involved
- itemreceipt
- inventorytransfer
- subsidiary

### Fields Referenced
- itemreceipt | custbody_sna_inventory_transfers | Inventory transfer references
- itemreceipt line | custcol_sna_hul_it | Inventory transfer ID
- itemreceipt line | custcol_sna_hul_so_location | SO location
- inventorytransfer | custbody_sna_item_receipt | Source item receipt
- inventorytransfer | custbody_sna_hul_created_from_so | Created from SO label

Schemas (if known):
- Template: FileCabinet/SuiteScripts/TEMPLATES/sna_hul_inventory_transfer_template.xml

---

## 7. Validation & Edge Cases
- Lines without SO location or same location do not create transfers.
- Inventory detail missing still creates transfer without assignments.
- Inventory detail errors are logged without stopping transfer creation.

---

## 8. Implementation Notes (Optional)
- Transfer PDF saved to folder defined by `custscript_inv_transfer_folder` parameter.
- Performance/governance considerations: Record loads and saves per transfer; inventory detail handling per line.

---

## 9. Acceptance Criteria
- Given an Item Receipt with differing locations, when afterSubmit runs, then Inventory Transfers are created per unique location pair.
- Given an Item Receipt with created transfers, when afterSubmit runs, then receipt lines reference the created Inventory Transfer IDs.
- Given an Inventory Transfer record, when beforeLoad runs, then a Print button generates and serves a PDF.

---

## 10. Testing Notes
- Item Receipt with different SO location creates transfer and sets line references.
- Inventory Transfer print button generates PDF.
- Lines without SO location or same location do not create transfers.
- Deploy User Event on Item Receipt and Inventory Transfer.

---

## 11. Deployment Notes
- Confirm template file and output folder ID.
- Deploy User Event on Item Receipt and Inventory Transfer and validate transfer creation and print behavior.
- Monitor logs for transfer creation issues; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should transfers be batched if many location pairs exist?

---
