# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BulkInvoiceUpdateMR
title: Bulk Invoice Update Trigger (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mr_bulk_update.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A Map/Reduce script that loads invoices from a saved search and re-saves them to trigger User Event logic.

## 2. Business Goal
Provides a controlled way to reprocess invoices in bulk when User Events need to re-run.

## 3. User Story
As an admin, when I need to re-run invoice User Events in bulk, I want a bulk trigger, so that I can rerun logic without manual edits.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custscript_sna_bulk_srch_upd` | Script run | Load and save invoices to trigger User Events |

## 5. Functional Requirements
- The system must load a saved search ID from `custscript_sna_bulk_srch_upd`.
- The system must parse each search result and load the invoice record by ID.
- The system must save the invoice record without changes to trigger User Events.
- The system must log updated invoice IDs.
- The system must log any map errors in the summarize stage.

## 6. Data Contract
### Record Types Involved
- Invoice

### Fields Referenced
- Script parameter | `custscript_sna_bulk_srch_upd`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Saved search ID missing or invalid.
- Invoice load fails for a result.
- Map errors are logged in summarize.

## 8. Implementation Notes (Optional)
- Map stage saves invoices without modification.
- Reduce stage is unused.

## 9. Acceptance Criteria
- Given a saved search, when the script runs, then invoices are loaded and saved.
- Given the script runs, when invoices are saved, then User Event scripts are triggered.
- Given errors occur, when the script runs, then they are logged in summarize.

## 10. Testing Notes
- Saved search returns invoices; each is saved and logged.
- Saved search ID missing or invalid.
- Invoice load fails for a result.
- Map errors are logged in summarize.

## 11. Deployment Notes
- Upload `sna_hul_mr_bulk_update.js`.
- Set `custscript_sna_bulk_srch_upd` to a saved search ID.
- Run the Map/Reduce in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the script support record types other than invoices?
- Should map stage include error retries for failed saves?
- Risk: Large searches consume governance (Mitigation: Limit search size or schedule runs)
- Risk: Re-saving triggers unintended side effects (Mitigation: Validate UE logic before run)

---
