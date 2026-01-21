# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateBinTransfer
title: Create Bin Transfer from CSV
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_mr_hul_create_bintransfer.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - bintransfer
  - item
  - bin
  - location

---

## 1. Overview
Creates bin transfer transactions from a CSV file uploaded via a Suitelet.

---

## 2. Business Goal
Automate bulk bin transfers by converting CSV input into NetSuite bin transfer records.

---

## 3. User Story
As a warehouse user, when I upload a CSV of bin moves, I want bin transfer records created automatically so that bulk transfers are efficient.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| getInputData | custscript_sna_hul_bintransfer | run | Load CSV file and parse rows into transfer lines. |
| map | warehouse | each row | Group lines by warehouse. |
| reduce | warehouse | grouped rows | Create a bin transfer per warehouse and add inventory assignments. |
| summarize | N/A | run completes | Email created record links and delete the CSV file. |

---

## 5. Functional Requirements
- Load the CSV file id from `custscript_sna_hul_bintransfer` and parse each row into warehouse, item, from bin, to bin, and quantity.
- Group rows by warehouse in map.
- For each warehouse group, create one bin transfer and add inventory lines with from/to bins and quantities.
- Resolve item internal ids by item name and bin internal ids by bin number and location.
- Email the current user with created record links and delete the CSV file after processing.

---

## 6. Data Contract
### Record Types Involved
- Bin Transfer
- Item
- Bin
- Location

### Fields Referenced
- Script parameter | custscript_sna_hul_bintransfer | CSV file id
- CSV columns | warehouse, item, frombins, tobins, quantity | Input fields

Schemas (if known):
- Suitelet | sna_sl_hul_fileupload.js | CSV uploader

---

## 7. Validation & Edge Cases
- Invalid item or bin values should be logged and reported in the email summary.
- Empty CSV results in no transfers created.
- CSV file is deleted after processing to avoid accumulation.

---

## 8. Implementation Notes (Optional)
- Item lookup uses item name; bin lookup uses bin number and location.
- One bin transfer is created per warehouse group.

---

## 9. Acceptance Criteria
- Given a CSV with multiple warehouses, when the MR runs, then one bin transfer is created per warehouse.
- Given valid lines, when the MR runs, then inventory assignments use the correct bins and quantities.
- Given the run completes, when summarize runs, then the user receives an email with created record links and the CSV file is deleted.

---

## 10. Testing Notes
- Upload a CSV with valid lines and verify bin transfers and email notification.
- Upload a CSV with invalid item/bin values and verify error logging in the email.
- Upload an empty CSV and verify no transfers are created.

---

## 11. Deployment Notes
- Ensure the Suitelet uploads CSV files and passes `custscript_sna_hul_bintransfer`.
- Deploy the Map/Reduce and ensure permissions to create bin transfers and read items/bins/locations.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should item lookup use internal id instead of item name to avoid ambiguity?

---
