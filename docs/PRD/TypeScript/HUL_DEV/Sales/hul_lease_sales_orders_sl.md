# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_lease_sales_orders_sl
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: TypeScript/HUL_DEV/Sales/hul_lease_sales_orders_sl.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
Suitelet that renders the Lease Sales Orders Summary UI, handles dataset rebuilds, and exports filtered CSV.

---

## 2. Business Goal
Provide a Lease Sales Orders summary UI with rebuild and export capabilities.

---

## 3. User Story
As a user, when I open the Lease Sales Orders Summary, I want to filter, rebuild, and export the dataset, so that I can analyze lease orders.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | action | action=csv | Download filtered CSV |
| GET | action | action=rebuild | Submit Map/Reduce and redirect to polling view |
| GET | action | action=poll | Show rebuild progress and finalize dataset update |
| GET | action | action not specified | Render main summary UI |

---

## 5. Functional Requirements
- Constants / script IDs:
  - Map/Reduce: customscript_hul_lease_so_mr / customdeploy_hul_lease_so_mr
  - Output folder: 5940799
  - Client script file ID: 8441113
  - File prefix: hul_lease_so_dataset_
  - Deployment params: custscript_hul_dataset_fileid, custscript_hul_last_rebuild_iso
- Request parameters:
  - action: csv, rebuild, poll
  - fileid: dataset file ID override
  - oldfileid: dataset file ID to delete after rebuild
  - runtoken: rebuild run token
  - Filter fields: custpage_f_tranid, custpage_f_trandate_from, custpage_f_trandate_to, custpage_f_customer, custpage_f_location
- onRequest:
  - Resolve dataset file ID from URL or deployment param.
  - Dispatch to csv, rebuild, poll, or render main page.
- handleRebuildRequest:
  - Submit MR task with custscript_hul_run_token.
  - Redirect to polling view after a short delay.
- handlePoll:
  - Show progress card with status and derived percentage.
  - On completion:
    - Delete previous dataset file (best-effort).
    - Find newest dataset file in output folder by internal ID.
    - Update deployment params with new file ID and last rebuild ISO timestamp.
    - Redirect back to main view with new fileid.
- renderMainPage:
  - Render UI with status banner, toolbar, filters, and results table.
  - Load dataset JSON, apply filters, and render the table.
  - Inject hidden URLs for toolbar actions (rebuild, CSV, clear filters).
- writeCsv:
  - Load dataset JSON, apply filters, and return a CSV download.
- Filtering:
  - Case-insensitive substring matching on client-specified fields.
  - Date range filtering on trandate when bounds provided.
- UI/theme:
  - Inline CSS/JS for card-based layout, sticky headers, toolbar, and progress bar.

---

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- custpage_csv_url
- custpage_rebuild_url
- custpage_f_tranid
- custpage_f_trandate_from
- custpage_f_trandate_to
- custpage_f_customer
- custpage_f_location
- custpage_fpage (if used in UI)
- custscript_hul_dataset_fileid
- custscript_hul_last_rebuild_iso

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Best-effort deletion of old dataset file.
- Dataset file resolved from URL param or deployment param.

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
- Record field IDs used in dataset JSON
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
