# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-EditSaveTransaction
title: Edit/Save Transactions Map/Reduce
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_mr_editsave_transaction.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any transaction types returned by the saved search

---

## 1. Overview
A Map/Reduce script that loads transactions from a saved search and re-saves them.

## 2. Business Goal
Allows batch re-save of transactions to trigger workflows, updates, or recalculations.

## 3. User Story
As an admin, when I need to resave a set of transactions, I want to resave a set of transactions, so that dependent logic re-runs.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custscript_editsave_savedsearch` | Script run | Load and save each transaction |

## 5. Functional Requirements
- The system must load the saved search from `custscript_editsave_savedsearch`.
- The system must load each record from the search results.
- The system must save each record with `ignoreMandatoryFields` set to true.
- The system must log summary details after execution.

## 6. Data Contract
### Record Types Involved
- Any transaction types returned by the saved search

### Fields Referenced
- Script parameter | `custscript_editsave_savedsearch`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Search returns records of multiple types; all should process.
- Record save fails; error is logged and next record continues.
- Load/save errors logged in map stage.

## 8. Implementation Notes (Optional)
- Reduce stage is not implemented.

## 9. Acceptance Criteria
- Given a saved search, when the script runs, then transactions are re-saved.
- Given errors occur, when the script runs, then they are logged without stopping the entire run.

## 10. Testing Notes
- Run against a saved search with a few transactions and confirm resave.
- Search returns records of multiple types; all should process.
- Record save fails; error is logged and next record continues.
- Load/save errors logged in map stage.

## 11. Deployment Notes
- Upload `sna_mr_editsave_transaction.js`.
- Set `custscript_editsave_savedsearch` parameter.
- Schedule or run the Map/Reduce script.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should reduce stage aggregate results for reporting?
- Should mandatory fields be enforced for certain records?
- Risk: Large searches consume governance or time (Mitigation: Limit search results or use batches)
- Risk: Resaving triggers unintended workflows (Mitigation: Confirm scope of saved search)

---
