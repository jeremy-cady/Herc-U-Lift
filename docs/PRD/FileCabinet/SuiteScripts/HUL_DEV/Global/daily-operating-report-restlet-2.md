# PRD: Daily Operating Report RESTlet (v2)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DailyOperatingReportRESTv2
title: Daily Operating Report RESTlet (v2)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/daily-operating-report-restlet-2.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (line data)
  - Time Entry (timebill)
  - Item Fulfillment
  - Item

---

## 1. Overview
A RESTlet that returns daily operating report data (sales order line revenue, COGS, and margin) with basic summary totals.

---

## 2. Business Goal
Provide an API endpoint for pulling a daily operating dataset with margin calculations without running the Map/Reduce.

---

## 3. User Story
- As a developer, I want to fetch daily operating data via REST so that I can integrate with dashboards.
- As an analyst, I want to see margins and COGS sources so that I can validate calculations.
- As an admin, I want to test daily report logic in a lighter endpoint so that I can debug issues.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet GET | lastmodifieddate, custcol_sna_linked_time, custcol_sna_so_service_code_type, custcol_sna_hul_temp_porate | Today date range and first 100 lines | Return summary totals, per-COGS-source breakdown, and line data |

---

## 5. Functional Requirements
- The system must handle GET requests only.
- The system must search sales order lines with type = SalesOrd, mainline = F, taxline = F, lastmodifieddate within today’s date range, and numbertext not starting with R.
- The system must limit output to the first 100 lines (debug/testing cap).
- The system must calculate line COGS using time entry cost when serviceCodeType = 2 and linkedTimeEntry exists, PO rate for temp item 98642 when custcol_sna_hul_temp_porate exists, and fulfillment cost derived from item cost * fulfilled quantity.
- The system must compute gross margin and margin percent per line.
- The system must return summary totals and per-COGS-source breakdown.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (line data)
- Time Entry (timebill)
- Item Fulfillment
- Item

### Fields Referenced
- type
- mainline
- taxline
- lastmodifieddate
- numbertext
- custcol_sna_linked_time
- custcol_sna_so_service_code_type
- custcol_sna_hul_temp_porate

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No lines today: summary totals zero.
- Temp item without PO rate: COGS source noFulfillmentCost.
- Search errors return success: false.

---

## 8. Implementation Notes (Optional)
- Hardcoded date range (today).
- Debug limit stops after 100 lines.

---

## 9. Acceptance Criteria
- Given a GET request, when the RESTlet runs, then it returns success: true with summary and lines.
- Given line data, when returned, then margin fields are calculated for each line.
- Given COGS sources, when summarized, then counts and totals are included.
- Given an error, when it occurs, then the response returns success: false with message details.

---

## 10. Testing Notes
- Send GET request and confirm summary and lines for today.
- Verify no lines returns zero totals.
- Verify temp item without PO rate reports noFulfillmentCost.
- Verify search errors return success: false.

---

## 11. Deployment Notes
- Deploy RESTlet and assign integration role.
- Validate response payload and security.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should the 100-line cap be parameterized?
- RESTlet used for production reporting despite debug cap.

---
