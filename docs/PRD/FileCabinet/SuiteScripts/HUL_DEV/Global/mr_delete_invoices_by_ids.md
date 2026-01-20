# PRD: Delete Invoices by IDs (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteInvoicesByIds
title: Delete Invoices by IDs (Map/Reduce)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/mr_delete_invoices_by_ids.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A Map/Reduce script that deletes invoices in bulk based on a list of internal IDs provided via parameters.

---

## 2. Business Goal
Enables fast cleanup of invoices without manual deletion, with a dry-run option for safety.

---

## 3. User Story
- As an admin, I want to delete a list of invoices so that cleanup is efficient.
- As a reviewer, I want a dry-run mode so that I can verify IDs before deletion.
- As a support user, I want detailed error logs so that failures are diagnosable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_inv_ids_text, custscript_inv_ids_file, custscript_inv_delete_dryrun | IDs provided | Delete invoices or log dry-run actions |

---

## 5. Functional Requirements
- The system must accept IDs from custscript_inv_ids_text (comma/newline/tab-separated) and custscript_inv_ids_file (CSV/TXT file).
- The system must parse IDs, remove quotes/spaces, and keep numeric IDs only.
- The system must de-duplicate IDs.
- The system must error if no IDs are provided.
- The system must respect custscript_inv_delete_dryrun for dry-run mode.
- The system must delete invoices using record.delete.
- The system must log detailed error messages and stack if available.

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
- No IDs provided triggers an error.
- Deletion failure logs invoice ID and stack when available.

---

## 8. Implementation Notes (Optional)
- Dry-run logs actions without deleting.

---

## 9. Acceptance Criteria
- Given IDs from text/file, when processed, then they are de-duplicated.
- Given dry-run mode, when enabled, then deletions are not performed.
- Given valid IDs, when dry-run is off, then deletions occur.
- Given errors, when they occur, then logs include invoice ID and message/stack.

---

## 10. Testing Notes
- Provide IDs via file and delete them.
- Provide IDs via text and delete them.
- Verify invalid IDs are ignored.
- Verify no IDs provided triggers an error.

---

## 11. Deployment Notes
- Upload mr_delete_invoices_by_ids.js and create Map/Reduce script record.
- Configure custscript_inv_ids_text, custscript_inv_ids_file, custscript_inv_delete_dryrun.
- Run in sandbox with dry-run enabled.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should deletions be emailed to admins after completion?
- Should a confirmation summary file be generated?
- Accidental deletion.
- Hidden dependencies block delete.

---
