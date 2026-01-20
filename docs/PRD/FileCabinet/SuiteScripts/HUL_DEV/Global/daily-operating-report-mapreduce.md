# PRD: Daily Operating Report Map/Reduce
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DailyOperatingReportMR
title: Daily Operating Report Map/Reduce
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/daily-operating-report-mapreduce.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (line data)
  - Item
  - Time Entry (timebill)
  - Purchase Order
  - customrecord_sna_hul_vendorprice

---

## 1. Overview
A Map/Reduce that generates a Daily Operating Report from sales order lines, calculates revenue and COGS by line, and saves summary + detailed files.

---

## 2. Business Goal
Provide an automated daily or open-orders report with margin calculations, vendor price enrichment, and chunked file outputs for large datasets.

---

## 3. User Story
- As a manager, I want to see daily operating results by line and totals so that I can review margins.
- As an analyst, I want to export the report to CSV so that I can analyze it externally.
- As an admin, I want to process open orders so that I can review backlog margins.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscriptcustscript_report_date, custscriptcustscript_dor_open_orders, custscript_dor_folder_id | Date mode or open-orders mode selected | Generate summary and detail files with revenue, COGS, and margin calculations |

---

## 5. Functional Requirements
- The system must accept script parameters: custscriptcustscript_report_date, custscriptcustscript_dor_open_orders, custscript_dor_folder_id (default 5661069).
- The system must search sales order lines with type = SalesOrd, mainline = F, taxline = F, numbertext not starting with R.
- In date mode, the system must filter by lastmodifieddate within target date to next day.
- In open-orders mode, the system must filter status in SalesOrd:A,B,D,E,F.
- The system must enrich each line with item category and inventory posting group and vendor purchase/contract price from customrecord_sna_hul_vendorprice.
- The system must compute COGS per line using time entry cost for service items (service code type 2 + linked time entry), linked PO rate for temp item 98642 with temp item code, and fulfillment transaction COGS when available.
- The system must compute gross margin and margin percent.
- The system must group results by COGS source and output summary + detail.
- The system must write output files: summary JSON, chunked JSON + CSV parts (5000 lines per chunk), and full CSV if only one chunk.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (line data)
- Item
- Time Entry (timebill)
- Purchase Order
- customrecord_sna_hul_vendorprice

### Fields Referenced
- custscriptcustscript_report_date
- custscriptcustscript_dor_open_orders
- custscript_dor_folder_id
- type
- mainline
- taxline
- numbertext
- lastmodifieddate
- status
- custcol_sna_linked_time
- custcol_sna_so_service_code_type
- custcol_sna_hul_temp_porate
- custcol_sna_hul_temp_item_code
- custcol_sna_linked_po
- custcol_sna_hul_fleet_no
- custitem_sna_hul_itemcategory
- custitem_sna_inv_posting_grp

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No results: summary file still created.
- Lines without fulfillment COGS: cogsSource "notFulfilled".
- Temp item without linked PO: cogsSource "noLinkedPO".
- Search or file errors are logged and do not crash summarize.

---

## 8. Implementation Notes (Optional)
- Uses search for fulfillment COGS via join.
- Temp item cost logic relies on item ID 98642 and temp item code matching.
- Chunked outputs mitigate size limits.

---

## 9. Acceptance Criteria
- Given date or open-orders mode, when the script runs, then it generates summary and output files in the target folder.
- Given output files, when generated, then summary totals and per-source breakdown are included.
- Given large datasets, when processing completes, then output is split into multiple files under size limits.
- Given errors, when they occur, then they are logged without crashing summarize.

---

## 10. Testing Notes
- Run date-based mode and confirm summary and output files are created.
- Run open-orders mode and confirm status filters are applied.
- Verify no results still produce summary output.
- Verify lines without fulfillment COGS and temp items without linked PO use expected cogsSource.

---

## 11. Deployment Notes
- Deploy Map/Reduce script with parameters.
- Schedule or trigger as needed.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should the vendor price lookup be cached to reduce usage?
- High governance usage on large datasets.

---
