# PRD: Inventory Reorder Analysis (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InventoryReorderMR
title: Inventory Reorder Analysis (Map/Reduce)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/inventory_reorder_analysis_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Inventory Item
  - Vendor
  - Sales Order

---

## 1. Overview
A Map/Reduce script that analyzes inventory items daily, calculates reorder recommendations, and emails a CSV report to the purchasing team.

---

## 2. Business Goal
Manual reorder analysis is time-consuming and error-prone; this script automates analysis using reorder points, sales velocity, lead time, and backorders.

---

## 3. User Story
- As a buyer, I want daily reorder recommendations so that I can plan purchases.
- As an inventory manager, I want urgency indicators so that I prioritize critical items.
- As an admin, I want automated reporting so that manual analysis is reduced.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custscript_reorder_email_recipient | Daily inventory analysis | Generate CSV report, email summary, save File Cabinet file |

---

## 5. Functional Requirements
- The system must search active inventory items (InvtPart) and analyze them by location.
- The system must calculate sales velocity over 30 and 90 days.
- The system must determine reorder need based on below reorder point with recent sales, backorders, or stockout within vendor lead time.
- The system must compute recommended order quantity: target preferred stock level (or reorder point * 2 / lead-time fallback) and net available = available + on order - backordered.
- The system must calculate urgency levels (CRITICAL, HIGH, MEDIUM, LOW, OK).
- The system must group items by vendor in reduce stage.
- The system must generate a CSV report containing item metrics and recommendations.
- The system must email the report to custscript_reorder_email_recipient.
- The system must save the CSV file to a configured File Cabinet folder.

---

## 6. Data Contract
### Record Types Involved
- Inventory Item
- Vendor
- Sales Order

### Fields Referenced
- custscript_reorder_email_recipient
- itemid

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Items with no vendor return "No Vendor".
- Items with no recent sales do not reorder unless backordered.
- Lead time missing defaults to 14 days.
- Map/reduce errors logged in summarize.
- CSV file creation failures are logged.

---

## 8. Implementation Notes (Optional)
- Current script contains a test filter on itemid = 91B6100912.
- Folder ID in getFolderId() must be updated to a valid folder.

---

## 9. Acceptance Criteria
- Given items below reorder thresholds, when processed, then they are flagged with reasons.
- Given recommendations, when calculated, then order quantities are included in the report.
- Given the report, when generated, then a CSV file is created and saved to File Cabinet.
- Given the run completes, when email is sent, then it includes urgency counts and totals.

---

## 10. Testing Notes
- Verify items below reorder point with sales velocity appear in report.
- Verify CSV file is created and emailed.
- Verify no vendor items return "No Vendor".
- Verify lead time missing defaults to 14 days.

---

## 11. Deployment Notes
- Update getFolderId() with a valid File Cabinet folder ID.
- Remove test filter on itemid before production.
- Create the Map/Reduce script record.
- Set custscript_reorder_email_recipient.
- Schedule daily at 6:00 AM.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- What is the correct File Cabinet folder ID for reports?
- Should reorder rules be configurable by location?
- Should zero-velocity items be excluded even if below reorder point?
- Test filter left in place.
- Invalid folder ID.
- High per-item lookups.

---
