# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-StockOrderReportCsv
title: Stock Order Report CSV Generator
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_stockorderreport_csv.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item and Inventory data via saved search
  - Transactions (Sales Orders, Purchase Orders, Work Orders) via saved search

---

## 1. Overview
A Map/Reduce script that generates a Stock Order Report CSV and emails it to the requesting user.

---

## 2. Business Goal
Automates report generation from the Stock Order Report Suitelet filters without manual exports.

---

## 3. User Story
As a purchasing user, when I run report filters, I want a CSV generated, so that I can review stock order needs.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custscript_sna_form_filters` | Suitelet request | Generate CSV and email to requesting user |

---

## 5. Functional Requirements
- The script must read filter parameters from `custscript_sna_form_filters`.
- The script must load the base saved search from `custscript_sna_hul_mr_ss` and append filter expressions.
- The script must output CSV lines during processing and aggregate them in summarize.
- The script must create a CSV file in the folder from `custscript_sna_hul_folder_id`.
- The script must append data in chunks to the file to avoid size limits.
- The script must email the requesting user from `custscript_sna_form_currentuser_id` with attachment or URL depending on file size.

---

## 6. Data Contract
### Record Types Involved
- Item and Inventory data via saved search
- Transactions (Sales Orders, Purchase Orders, Work Orders) via saved search

### Fields Referenced
- Item | `custitem_sna_hul_itemcategory`
- Item | `custrecord_sna_hul_vendor`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Large result set produces an email with download link.
- Invalid folder ID or file creation failure is logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: File creation and email send consume usage in summarize stage.
- Constraints: File attachments larger than 10 MB are sent as URLs.
- Dependencies: Suitelet passes filter JSON.
- Risk: Large CSV generation timeouts.

---

## 9. Acceptance Criteria
- Given filter parameters, when the script runs, then a CSV is generated with headers and data rows.
- Given the configured folder ID, when the script runs, then the file is saved in the configured folder.
- Given the file size, when the script runs, then an email is sent with attachment or URL based on size.

---

## 10. Testing Notes
- Happy path: Valid filter set produces a CSV and email attachment.
- Edge case: Large result set produces an email with download link.
- Error handling: Invalid folder ID or file creation failure is logged.
- Test data: Search results with inventory and transaction data.
- Sandbox setup: Configure File Cabinet folder ID and Suitelet filter JSON.

---

## 11. Deployment Notes
- Configure saved search ID and File Cabinet folder ID.
- Upload `sna_hul_mr_stockorderreport_csv.js`.
- Deploy Map/Reduce with parameters.
- Post-deployment: Validate email delivery and file storage.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Schema details are not specified.
- Should CSV files be auto-deleted after delivery?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
