# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RecalcRateRevStream
title: Recalculate Rate and Revenue Stream
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_recalc_rate_rev_stream.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_so_lines_processed
  - salesorder

---

## 1. Overview
Suitelet that triggers a Map/Reduce to recalculate sales order line rates and/or revenue streams, and displays progress.

---

## 2. Business Goal
Provides a UI to run recalculation jobs and monitor processed line counts.

---

## 3. User Story
- As a user, when I recalculate rates, I want line values updated, so that pricing is correct.
- As an admin, when I see progress, I want to know when processing is complete, so that I can manage timing.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | custparam_actionType, custparam_soId | Parameters provided | Create/load tracking record, submit MR, and display status |

---

## 5. Functional Requirements
- Accept `custparam_actionType` and `custparam_soId` parameters.
- Create or locate a `customrecord_sna_hul_so_lines_processed` record.
- Submit the Map/Reduce script `customscript_sna_hul_mr_recalc_rate_revs` with parameters.
- Show a refreshable status page with processed line count.
- When `custparam_actionType=refreshSuitelet`, display current process status and line counts.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_so_lines_processed
- salesorder

### Fields Referenced
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_sales_order | Sales order
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_so_lines_processed | Lines processed
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_process_status | Process status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Existing in-progress record redirects to refresh view.
- MR submission failure logs error and does not crash UI.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Custom record create/load and MR submit.

---

## 9. Acceptance Criteria
- Given a sales order process starts, when the Suitelet runs, then Map/Reduce is submitted once per sales order process.
- Given status is requested, when the Suitelet runs, then the status page shows sales order, status, and lines processed.
- Given the Refresh button is used, when the Suitelet reloads, then status is updated.

---

## 10. Testing Notes
Manual tests:
- Suitelet submits MR and shows progress fields.
- Existing in-progress record redirects to refresh view.
- MR submission failure logs error and does not crash UI.

---

## 11. Deployment Notes
- MR script deployed.
- Client script available.
- Deploy Suitelet.
- Add link/button on sales order.

---

## 12. Open Questions / TBDs
- Should completed tracking records be archived?

---
