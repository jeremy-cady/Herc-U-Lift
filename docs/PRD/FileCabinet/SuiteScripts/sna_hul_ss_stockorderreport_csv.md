# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-StockOrderReportCsv
title: Stock Order Report CSV
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: scheduled
  file: FileCabinet/SuiteScripts/sna_hul_ss_stockorderreport_csv.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - item
  - transaction
  - file

---

## 1. Overview
Scheduled script that generates a stock order report CSV and emails it to the requesting user.

---

## 2. Business Goal
Handles heavy report generation outside the Suitelet and delivers a CSV via email.

---

## 3. User Story
- As a planner, when I receive a stock order CSV, I want to analyze demand and reorder quantities, so that planning is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Scheduled execution | custscript_sna_ss_params | JSON parameters provided | Generate CSV, save to file cabinet, email to user |

---

## 5. Functional Requirements
- Read JSON parameters from `custscript_sna_ss_params`.
- Load the transaction and item saved searches using script parameters.
- Apply filters for item category, vendor, location, demand period, PO period, and ROP quantities.
- Generate CSV content from search results and item details.
- Save the CSV to the folder defined by `custscript_sna_ss_folder_id`.
- Email the CSV to the current user.

---

## 6. Data Contract
### Record Types Involved
- item
- transaction
- file

### Fields Referenced
- Item | custitem_sna_hul_itemcategory | Item category
- Item | custitem8 | ROP quantity (used in filter)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No results still generates CSV header only.
- Search load failure throws an error with log details.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Heavy search processing and file operations.

---

## 9. Acceptance Criteria
- Given filters are provided, when the script runs, then CSV file is generated and saved.
- Given the CSV file is generated, when the script completes, then an email is sent with the CSV attachment.
- Given Suitelet inputs, when the script runs, then filters reflect those parameters.

---

## 10. Testing Notes
Manual tests:
- Filtered CSV is generated and emailed.
- No results still generates CSV header only.
- Search load failure throws an error with log details.

---

## 11. Deployment Notes
- Saved searches configured.
- Output folder parameter set.
- Deploy scheduled script.
- Trigger from Suitelet.

---

## 12. Open Questions / TBDs
- Should the CSV be attached in the UI as well as email?

---
