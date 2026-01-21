# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteRecords
title: Map/Reduce Delete Records
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_mr_delete_records.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Deletes records in bulk based on a saved search result set.

---

## 2. Business Goal
Provide a controlled bulk deletion mechanism using a pre-defined saved search.

---

## 3. User Story
As an admin, when I run a cleanup job, I want records from a saved search deleted so that large-scale cleanup is efficient and traceable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| getInputData | saved search 497 | run | Load search results for deletion. |
| map | recordType, id | each result | Delete the record and log errors on failure. |

---

## 5. Functional Requirements
- Load saved search id 497 in `getInputData`.
- Parse each result in `map` to extract record type and id.
- Call `record.delete` for each record and log errors without stopping the run.

---

## 6. Data Contract
### Record Types Involved
- Any record types returned by saved search 497

### Fields Referenced
- Saved search result | recordType | Target record type
- Saved search result | id | Target record id

Schemas (if known):
- Saved search | id 497 | Records to delete

---

## 7. Validation & Edge Cases
- If the search returns no results, the run completes without deletion.
- Deletion failures are logged and do not halt the run.

---

## 8. Implementation Notes (Optional)
- Deletion occurs in the map stage only; no reduce/summarize behavior is required.

---

## 9. Acceptance Criteria
- Given saved search 497 returns records, when the MR runs, then all results are deleted.
- Given a deletion error occurs, when the MR runs, then the error is logged and the job continues.

---

## 10. Testing Notes
- Run with a saved search returning test records and verify deletions.
- Run with an empty search and verify no errors.
- Include a record that cannot be deleted and verify error logging.

---

## 11. Deployment Notes
- Validate saved search 497 scope before deployment.
- Deploy the Map/Reduce and schedule or run on demand.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should the saved search id be parameterized instead of hard-coded?

---
