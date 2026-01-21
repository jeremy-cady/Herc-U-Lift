# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoVanBin
title: Set Van Bin and Update Object on Item Receipt
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_so_van_bin.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemreceipt
  - salesorder
  - item
  - customrecord_sna_van_bin_assignment
  - customrecord_sna_objects

---

## 1. Overview
Populates van bin values on item receipt lines and updates related Object records based on receipt data.

---

## 2. Business Goal
Keep van bin assignments and Object status/identifiers synchronized when items are received.

---

## 3. User Story
As a warehouse or inventory user, when I receive items, I want van bin and object details updated automatically so that picking and asset data remain accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custcol_sna_van_bin | item receipt line | Set van bin using `customrecord_sna_van_bin_assignment` by item and location. |
| beforeSubmit | custrecord_sna_status | item receipt line, itemreceive true, fleet no present | Update related Object status based on sales order linkage. |
| beforeSubmit | custrecord_sna_fleet_code, custrecord_sna_serial_no | item receipt line, itemreceive true | Copy fleet code and serial number from line to Object record. |
| beforeSubmit | custrecord_sna_responsibility_center | item receipt line, itemreceive true, service code type = 6 | Set Object responsibility center. |

---

## 5. Functional Requirements
- Set `custcol_sna_van_bin` on each item receipt line using item/location assignment.
- When `custcol_sna_hul_fleet_no` is present and the line is received, update the related Object record.
- Set Object `custrecord_sna_fleet_code` and `custrecord_sna_serial_no` from line values when present.
- Set Object status to 11 when linked to a sales order; otherwise set to 10.
- Set Object responsibility center only when the item service code type equals 6 (Object).

---

## 6. Data Contract
### Record Types Involved
- Item Receipt
- Sales Order
- Item
- Custom record: customrecord_sna_van_bin_assignment
- Custom record: customrecord_sna_objects

### Fields Referenced
- Item line | custcol_sna_van_bin | Van bin
- Item line | custcol_sna_hul_fleet_no | Fleet number (Object id)
- Item line | custcol_sna_po_fleet_code | Fleet code
- Item line | custcol_sna_hul_eq_serial | Equipment serial number
- Item | custitem_sna_item_service_code_type | Service code type
- Object | custrecord_sna_status | Object status
- Object | custrecord_sna_responsibility_center | Responsibility center
- Object | custrecord_sna_fleet_code | Fleet code
- Object | custrecord_sna_serial_no | Serial number

Schemas (if known):
- Custom record | customrecord_sna_van_bin_assignment | Item/location to van bin mapping
- Custom record | customrecord_sna_objects | Object master data

---

## 7. Validation & Edge Cases
- If no van bin assignment exists, the van bin remains blank.
- Object updates only occur when `itemreceive` is true and a fleet number is provided.
- If the Object record is missing, the script should log and continue.

---

## 8. Implementation Notes (Optional)
- Uses per-line lookups to resolve van bin assignments and Object records.
- Object status differs based on sales order linkage.

---

## 9. Acceptance Criteria
- Given an item receipt line with an assignment, when the record is saved, then `custcol_sna_van_bin` is populated.
- Given a received line with a fleet number, when the record is saved, then the linked Object status updates to 10 or 11 depending on sales order linkage.
- Given fleet code and serial values on the line, when the record is saved, then the Object record reflects those values.

---

## 10. Testing Notes
- Save an item receipt with a fleet number and bin assignment; verify line van bin and Object updates.
- Save an item receipt line with itemreceive false; verify Object is not updated.
- Save an item receipt with no bin assignment; verify van bin remains blank.

---

## 11. Deployment Notes
- Populate van bin assignment records before deployment.
- Deploy the user event to Item Receipt.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should responsibility center update apply only for service code type 6 (Object)?

---
