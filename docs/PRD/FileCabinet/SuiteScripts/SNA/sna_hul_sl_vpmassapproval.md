# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VPMassApprovalSuitelet
title: Vendor Price Mass Approval Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_vpmassapproval.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Price (`customrecord_sna_hul_vendorprice`)
  - Item
  - Vendor
  - Item Category (`customrecord_sna_hul_itemcategory`)

---

## 1. Overview
A Suitelet UI to review vendor price records flagged for approval, select records, and trigger a Map/Reduce approval process.

## 2. Business Goal
Enables bulk approval of vendor price updates with pagination and optional item category filtering.

## 3. User Story
As a pricing admin, when reviewing approvals, I want to review vendor prices in a paged list, so that I can approve updates efficiently.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `param_page`, `param_ic` | Suitelet request | Render paged list and filters |
| POST | `custpage_fld_vptoapprove` | Submit selected IDs | Trigger Map/Reduce approval task |

## 5. Functional Requirements
- The system must render a Suitelet form with vendor price records flagged for approval.
- The system must support pagination using the `param_page` request parameter.
- The system must support item category filtering via `param_ic`.
- The system must allow selecting vendor price records using checkboxes.
- The system must submit selected vendor price IDs to a Map/Reduce script (`customscript_sna_hul_mr_approvevp`).
- The system must display a notification when the approval process starts or when no records are selected.
- The system must attach client script `sna_hul_cs_vpmassapproval.js` for UI behavior.

## 6. Data Contract
### Record Types Involved
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item
- Vendor
- Item Category (`customrecord_sna_hul_itemcategory`)

### Fields Referenced
- Vendor Price | `custrecord_sna_hul_forapproval`
- Vendor Price | `custrecordsna_hul_vendoritemnumber`
- Vendor Price | `custrecord_sna_hul_t_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_t_listprice`
- Vendor Price | `custrecord_sna_hul_t_contractprice`
- Vendor Price | `custrecord_sna_hul_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_listprice`
- Vendor Price | `custrecord_sna_hul_contractprice`
- Item | `custitem_sna_hul_itemcategory`
- Script parameters | `custscript_param_nooflinestoshow`, `custscript_param_dealernetpricethreshold`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No records selected; notification indicates no selection.
- Large result set; paging works across pages.
- Task submission fails; error is logged.

## 8. Implementation Notes (Optional)
- Item category filter is present but filter application is commented out in the search.

## 9. Acceptance Criteria
- Given the Suitelet loads, when it runs, then vendor prices display with pagination.
- Given selected records, when submit runs, then Map/Reduce is triggered with selected IDs.
- Given no records selected, when submit runs, then a notification indicates no selection.

## 10. Testing Notes
- Open Suitelet, select vendor prices, submit, and confirm notification.
- No records selected; notification indicates no selection.
- Large result set; paging works across pages.
- Task submission fails; error is logged.

## 11. Deployment Notes
- Upload `sna_hul_sl_vpmassapproval.js` and `sna_hul_cs_vpmassapproval.js`.
- Deploy Suitelet and configure parameters.
- Ensure `customscript_sna_hul_mr_approvevp` is deployed.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should item category filtering be fully enabled in search filters?
- Should approval run synchronously for small batches?
- Risk: Map/Reduce task fails silently (Mitigation: Add task status tracking and notification)
- Risk: Large result set still slow to page (Mitigation: Optimize filters and page size)

---
