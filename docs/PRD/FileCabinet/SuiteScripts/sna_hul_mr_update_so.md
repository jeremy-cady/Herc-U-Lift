# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSalesOrder
title: Update Sales Order
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_update_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder

---

## 1. Overview
Triggers a save on Sales Orders returned by a saved search to fire downstream User Event logic.

---

## 2. Business Goal
Allows bulk invocation of the "SNA HUL | UE | SO/Quote Lines Update" User Event without manual edits.

---

## 3. User Story
- As an administrator, when I re-run SO/Quote line updates in bulk, I want data to stay consistent, so that records remain aligned.
- As an analyst, when I target a saved search, I want only relevant orders processed, so that scope is controlled.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | TBD | Saved search parameter `custscript_sna_update_so_srch` | Load and save each Sales Order to trigger User Event logic |

---

## 5. Functional Requirements
- Load a saved search specified by script parameter.
- Load each Sales Order record from the search results.
- Save each Sales Order record to trigger User Event logic.
- Log execution metrics for usage and throughput.

---

## 6. Data Contract
### Record Types Involved
- salesorder

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Saved search returns no results; script exits cleanly.
- Record load error is logged and does not stop execution.
- Invalid saved search ID is logged and stops input stage.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Map/Reduce governance limits for large searches.

---

## 9. Acceptance Criteria
- Given a saved search parameter is provided, when the job runs, then the record set is driven by that saved search.
- Given Sales Orders are returned, when the job runs, then each Sales Order is loaded and saved once.
- Given the job completes, when the summary is reviewed, then usage, concurrency, and yields are logged.

---

## 10. Testing Notes
Manual tests:
- Saved search returns a small set of Sales Orders; each is saved.
- Saved search returns no results; script exits cleanly.
- Record load error is logged and does not stop execution.
- Invalid saved search ID is logged and stops input stage.

---

## 11. Deployment Notes
- Set saved search parameter.
- Validate target search in sandbox.
- Deploy Map/Reduce with search parameter.
- Execute script on target set.

---

## 12. Open Questions / TBDs
- Should Quotes be included in the search scope?

---
