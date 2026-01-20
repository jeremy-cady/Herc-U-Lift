# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-StockOrderReportLib
title: Stock Order Report Suitelet Client Library
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_lib_stockordereport.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None (Suitelet-driven report)

---

## 1. Overview
A client-side library for the Stock Order Report Suitelet that manages filter behavior and triggers CSV generation when filters are empty.

---

## 2. Business Goal
Prevent timeouts by warning users about unfiltered queries and offer CSV generation via a server-side process.

---

## 3. User Story
As a user, when I run the stock order report, I want warnings and CSV options for unfiltered runs, so that I can avoid timeouts and still get results.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custpage_filter_loc | location changed | Set custpage_filter_locname from selected text |
| saveRecord | filter fields | all filters empty | Prompt and trigger CSV generation if confirmed |

---

## 5. Functional Requirements
- When `custpage_filter_loc` changes, set `custpage_filter_locname` to the location name extracted from the selected text.
- On save, detect if all filter fields are empty and show a confirmation dialog.
- If the user confirms, call the Suitelet with `isCSV=true` and pass query parameters to schedule CSV generation.
- Display a confirmation message and reload the page after triggering CSV generation.

---

## 6. Data Contract
### Record Types Involved
- None (Suitelet-driven report)

### Fields Referenced
- Suitelet | custpage_filter_itemcat
- Suitelet | custpage_filter_vendor
- Suitelet | custpage_filter_loc
- Suitelet | custpage_filter_locname
- Suitelet | custpage_filter_demper
- Suitelet | custpage_filter_demper_end
- Suitelet | custpage_filter_poper
- Suitelet | custpage_filter_poper_end
- Suitelet | custpage_filter_diffmin
- Suitelet | custpage_filter_diffmax
- Suitelet | custpage_filter_ropqty

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Save with at least one filter; no warning shown.
- Suitelet POST failure; error handling TBD.

---

## 8. Implementation Notes (Optional)
- Calls Suitelet `customscript_sna_hul_sl_stockorderreport` with CSV parameters.
- Uses HTTPS POST from the client to trigger the Suitelet.

---

## 9. Acceptance Criteria
- Given all filters empty, when saving, then a warning is shown and CSV generation can be triggered.
- Given location selection changes, when updated, then `custpage_filter_locname` is updated.

---

## 10. Testing Notes
- Set location filter and verify `custpage_filter_locname` update.
- Save with no filters; confirm dialog and CSV generation message.
- Save with filters; no warning.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_lib_stockordereport.js`.
- Deploy on the stock order report Suitelet.
- Rollback: remove client script deployment from Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the client block save entirely when no filters are set?
- Risk: Unfiltered requests still possible if dialog dismissed.

---
