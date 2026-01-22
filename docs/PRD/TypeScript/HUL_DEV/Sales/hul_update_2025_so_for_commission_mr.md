# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_update_2025_so_for_commission_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Sales/hul_update_2025_so_for_commission_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
Map/Reduce backfill that marks Sales Orders as processed for commission to trigger the commission UE in EDIT context.

---

## 2. Business Goal
Backfill Sales Orders to trigger commission processing via User Event.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want qualifying Sales Orders marked processed so that commission logic runs in EDIT context.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custbody_hul_processed_for_commission | Sales Order in saved search and not already processed | Set field to true and save to trigger UE |

---

## 5. Functional Requirements
- getInputData: Load saved search customsearch_hul_commission_backfill.
- map:
  - Load each Sales Order from the search.
  - Skip if custbody_hul_processed_for_commission is already true.
  - Set custbody_hul_processed_for_commission to true and save the record to fire the commission UE.
- summarize: Log usage, concurrency, yields, and map errors.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- custbody_hul_processed_for_commission
- Saved search: customsearch_hul_commission_backfill

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Sales Orders already processed are skipped.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
