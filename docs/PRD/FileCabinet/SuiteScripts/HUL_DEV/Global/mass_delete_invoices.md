# PRD: Mass Delete Invoices (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-MassDeleteInvoices
title: Mass Delete Invoices (Map/Reduce)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/mass_delete_invoices.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A Map/Reduce utility that deletes invoices in bulk using a list of internal IDs provided via script parameters.

---

## 2. Business Goal
Mass cleanup of incorrect or test invoices is time-consuming through the UI; this script automates deletion with a dry-run option.

---

## 3. User Story
- As an admin, I want to delete a list of invoices so that cleanup is fast and consistent.
- As a reviewer, I want a dry-run mode so that I can verify IDs before deleting.
- As a support user, I want errors logged so that failed deletions can be investigated.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_inv_ids_text, custscript_inv_ids_file, custscript_inv_delete_dryrun | IDs provided | Delete invoices or log dry-run actions |

---

## 5. Functional Requirements
- The system must accept invoice IDs from custscript_inv_ids_text (comma/newline/tab-separated) and custscript_inv_ids_file (CSV/TXT file).
- The system must parse IDs, stripping quotes and non-numeric values.
- The system must de-duplicate IDs.
- The system must throw an error if no IDs are provided.
- The system must support custscript_inv_delete_dryrun to log actions without deleting.
- For each ID, the system must delete the invoice using record.delete.
- The system must log failures per ID.

---

## 6. Data Contract
### Record Types Involved
- Invoice

### Fields Referenced
- custscript_inv_ids_text
- custscript_inv_ids_file
- custscript_inv_delete_dryrun

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invalid/non-numeric IDs are ignored.
- No IDs provided: script errors out.
- Deletion error logs include invoice ID.

---

## 8. Implementation Notes (Optional)
- Dry-run logs “would delete” messages and deletes nothing.

---

## 9. Acceptance Criteria
- Given IDs from file and/or text, when processed, then IDs are de-duplicated.
- Given dry-run mode, when enabled, then deletes are not performed and actions are logged.
- Given valid IDs, when dry-run is off, then invoices are deleted.
- Given errors, when they occur, then they are logged with invoice ID.

---

## 10. Testing Notes
- Provide CSV of invoice IDs and delete them.
- Provide pasted IDs and delete them.
- Provide invalid IDs and confirm they are ignored.
- Provide no IDs and confirm script errors out.

---

## 11. Deployment Notes
- Upload mass_delete_invoices.js and create Map/Reduce script record.
- Configure custscript_inv_ids_text, custscript_inv_ids_file, custscript_inv_delete_dryrun.
- Run in sandbox with dry-run enabled.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the script produce a summary file of deleted IDs?
- Should there be a confirmation email after completion?
- Accidental deletion.
- Incorrect ID list.

---
