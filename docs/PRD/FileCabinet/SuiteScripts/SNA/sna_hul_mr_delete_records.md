# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteRecordsMR
title: Bulk Record Deletion (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mr_delete_records.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record type returned by the saved search

---

## 1. Overview
A Map/Reduce script that deletes records returned by a saved search and emails a detailed HTML summary report.

## 2. Business Goal
Provides a configurable, auditable way to delete records in bulk using saved search criteria.

## 3. User Story
As an admin, when I need bulk deletions driven by a saved search, I want bulk deletions driven by a saved search, so that criteria are configurable.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custscript_sna_hul_deletion_reference` | Script run | Delete records from saved search and email summary report |

## 5. Functional Requirements
- The system must read the saved search ID from `custscript_sna_hul_deletion_reference`.
- If the search parameter is missing, the system must log an error and exit.
- The system must delete each record from the search in the map stage.
- The system must log deletions and write output rows for reporting.
- The system must build HTML tables for deleted records and errors in summarize.
- The system must load the email template `./custom-templates/record-deletion.html` and substitute placeholders.
- The system must email the report to recipients in `custscript_sna_hul_deletion_recipients`.

## 6. Data Contract
### Record Types Involved
- Any record type returned by the saved search

### Fields Referenced
- Script parameter | `custscript_sna_hul_deletion_reference`
- Script parameter | `custscript_sna_hul_deletion_recipients`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing search parameter is logged and prevents processing.
- Empty search results; report shows no records processed.
- Record deletion fails; error appears in report.

## 8. Implementation Notes (Optional)
- Email template path must be valid in the File Cabinet.
- Recipients parameter must be a comma-delimited list.
- Uses `FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_utils.js` for `isEmpty`.

## 9. Acceptance Criteria
- Given the saved search parameter, when the script runs, then records returned by the search are deleted.
- Given the run completes, when the script runs, then the summary email includes deleted record IDs and error details.
- Given the search parameter is missing, when the script runs, then processing stops and the error is logged.

## 10. Testing Notes
- Provide a saved search with test records; records delete and email sends.
- Missing search parameter; script logs error and exits.
- Empty search results; report shows no records processed.
- Record deletion fails; error appears in report.

## 11. Deployment Notes
- Upload `sna_hul_mr_delete_records.js`.
- Set `custscript_sna_hul_deletion_reference` and `custscript_sna_hul_deletion_recipients`.
- Ensure the email template file exists.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should deletions be limited to sandbox only?
- Should the report include record type names and links?
- Risk: Incorrect search criteria deletes wrong records (Mitigation: Review search before run)
- Risk: Missing email template breaks report (Mitigation: Validate template path in deployment)

---
