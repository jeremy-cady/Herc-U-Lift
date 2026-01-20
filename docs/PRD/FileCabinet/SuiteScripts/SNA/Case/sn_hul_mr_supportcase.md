# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SupportCaseEmailMR
title: Support Case Email Backfill (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/Case/sn_hul_mr_supportcase.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case (`supportcase`)

---

## 1. Overview
A Map/Reduce script that loads a saved search and updates support case email fields based on grouped search results.

## 2. Business Goal
Automates backfilling or correcting support case email values from a saved search without manual edits.

## 3. User Story
As an admin, when I need to backfill case emails in bulk, I want to backfill case emails in bulk, so that data stays consistent.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Script run with `custscript_sn_case_search_eml` | Update support case `email` based on grouped search results |

## 5. Functional Requirements
- The system must load a saved search ID from `custscript_sn_case_search_eml`.
- The system must process each search result in the map stage and pass it to reduce.
- The system must parse grouped search values in reduce to extract `GROUP(internalid)` and `GROUP(email.CUSTEVENT_NX_CUSTOMER)`.
- The system must update `supportcase.email` with the grouped email value when present.
- The system must log debug output during map and reduce.

## 6. Data Contract
### Record Types Involved
- Support Case (`supportcase`)

### Fields Referenced
- `GROUP(internalid)`
- `GROUP(email.CUSTEVENT_NX_CUSTOMER)`
- Support Case | `email`
- Script parameter | `custscript_sn_case_search_eml`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Search returns a row with missing email; case is not updated.
- Saved search ID is invalid.
- `record.submitFields` fails; error logged and run continues.

## 8. Implementation Notes (Optional)
- Assumes search results include `GROUP(internalid)` and `GROUP(email.CUSTEVENT_NX_CUSTOMER)`.
- The `summarize` stage is empty.

## 9. Acceptance Criteria
- Given the saved search parameter, when the script runs, then the search is loaded.
- Given grouped email values are present, when the script runs, then cases are updated.
- Given grouped email values are empty, when the script runs, then no updates occur.
- Given errors during update, when the script runs, then they do not halt the entire run.

## 10. Testing Notes
- Saved search returns grouped case IDs with email values; cases update.
- Search returns a row with missing email; case is not updated.
- Saved search ID is invalid.
- `record.submitFields` fails; error logged and run continues.

## 11. Deployment Notes
- Upload `sn_hul_mr_supportcase.js`.
- Set script parameter `custscript_sn_case_search_eml` to a saved search ID.
- Deploy and run the Map/Reduce in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the script validate the saved search columns before running?
- Should it update additional case fields based on the search?
- Risk: Saved search schema changes (Mitigation: Lock search columns or validate before run)
- Risk: Large runs consume governance (Mitigation: Monitor usage and consider rescheduling)

---
