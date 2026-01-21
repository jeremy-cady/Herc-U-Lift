# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-StockOrderReport
title: Stock Order Report
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_stockorderreport.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - item
  - vendor
  - location

---

## 1. Overview
Suitelet that displays a stock order report UI and triggers CSV generation via Map/Reduce.

---

## 2. Business Goal
Provides a filtered report for stock ordering and generates CSV output for further processing.

---

## 3. User Story
- As a planner, when I filter stock order data, I want to generate a relevant report, so that ordering is accurate.
- As a user, when I generate a CSV, I want to share or analyze results, so that planning is informed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | item category, vendor, location, demand period, PO period, ROP quantities | Filters submitted | Submit Map/Reduce task and redirect back to form |

---

## 5. Functional Requirements
- Render filter fields for item category, vendor, location, demand period, PO period, and ROP quantities.
- Gather filter parameters and submit a Map/Reduce task for CSV generation.
- Redirect back to the form after submission.

---

## 6. Data Contract
### Record Types Involved
- item
- vendor
- location

### Fields Referenced
- Uses item category custom record and related fields from saved searches.

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing required dates prevents submission.
- MR submission errors are surfaced in logs.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: MR submission and form rendering.

---

## 9. Acceptance Criteria
- Given filters are set, when the Suitelet runs, then filter fields appear and are validated.
- Given filters are submitted, when the Suitelet runs, then MR task submits with JSON filter parameters.
- Given submission completes, when the Suitelet runs, then the user returns to the form.

---

## 10. Testing Notes
Manual tests:
- Submit filters and schedule CSV generation.
- Missing required dates prevents submission.
- MR submission errors are surfaced in logs.

---

## 11. Deployment Notes
- MR script deployed.
- Deploy Suitelet.
- Provide access to planning users.

---

## 12. Open Questions / TBDs
- Should CSV generation include a completion notification in the UI?

---
