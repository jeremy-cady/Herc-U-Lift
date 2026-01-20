# PRD: Lease Sales Orders Summary Suitelet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LeaseSalesOrdersSL
title: Lease Sales Orders Summary Suitelet
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_sl.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - File
  - Script Deployment
  - Sales Order

---

## 1. Overview
A Suitelet UI that displays a lease sales orders dataset with filters, CSV export, and a rebuild workflow that triggers a Map/Reduce job.

---

## 2. Business Goal
Provide a user-friendly, performant view of lease sales orders using a cached JSON dataset instead of real-time searches.

---

## 3. User Story
- As a user, I want a filterable lease order list so that I can find records quickly.
- As an admin, I want a rebuild button so that I can refresh the dataset.
- As a user, I want to download CSV so that I can analyze data offline.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | action, fileid | action in csv, rebuild, poll | Render UI, download CSV, or trigger MR and poll progress |

---

## 5. Functional Requirements
- The Suitelet must support actions: action=csv to download CSV, action=rebuild to trigger Map/Reduce, action=poll to show rebuild progress.
- The Suitelet must render a main page with dataset status banner, filter fields, and results table with clickable order numbers.
- The Suitelet must read the dataset file ID from URL parameter fileid or script parameter custscript_hul_dataset_fileid.
- The Suitelet must load the dataset JSON and apply filters client-side.
- The CSV export must include only filtered rows.
- The rebuild action must submit MR task customscript_hul_lease_so_mr and redirect to a poll page that refreshes every 10 seconds.
- The poll page must display progress, delete the previous dataset file (best effort), find the newest dataset file in OUTPUT_FOLDER_ID, and update deployment params custscript_hul_dataset_fileid and custscript_hul_last_rebuild_iso.
- The main page must embed hidden fields with URLs for client script actions: custpage_csv_url, custpage_rebuild_url, custpage_clear_url.
- The Suitelet must inject a custom CSS/JS theme and toolbar UI.

---

## 6. Data Contract
### Record Types Involved
- File
- Script Deployment
- Sales Order

### Fields Referenced
- action
- fileid
- custscript_hul_dataset_fileid
- custscript_hul_last_rebuild_iso
- custpage_csv_url
- custpage_rebuild_url
- custpage_clear_url
- OUTPUT_FOLDER_ID

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing file ID shows "No dataset selected."
- File load error shows error card.
- Polling fails to locate new file.
- MR submission errors display a message.
- File delete or param update errors are logged.

---

## 8. Implementation Notes (Optional)
- OUTPUT_FOLDER_ID hard-coded to 5940799.
- Client script file ID hard-coded to 8441113.

---

## 9. Acceptance Criteria
- Given the main page, when loaded, then dataset renders with filters and styled table.
- Given filters, when applied, then table and CSV export include only filtered rows.
- Given rebuild action, when triggered, then MR runs and poll shows progress.
- Given completion, when poll updates, then latest dataset file is stored in deployment params.

---

## 10. Testing Notes
- Load Suitelet with valid file ID and view dataset.
- Apply filters and verify table and CSV export.
- Trigger rebuild and confirm dataset refresh.
- Verify missing file ID shows warning message.

---

## 11. Deployment Notes
- Upload hul_lease_sales_orders_sl.js.
- Deploy Suitelet with correct permissions.
- Set custscript_hul_dataset_fileid and custscript_hul_last_rebuild_iso.
- Rollback: disable Suitelet deployment.

---

## 12. Open Questions / TBDs
- Should output folder ID be configurable?
- Should MR file lookup be replaced by cache retrieval?
- Hard-coded file IDs.
- Large dataset file.

---
