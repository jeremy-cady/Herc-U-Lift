# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SoCommBookVal
title: Update SO Commissionable Book Value
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_upd_so_comm_book_val.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)

---

## 1. Overview
A Map/Reduce script that updates the Commissionable Book Value on Sales Order item lines for a specific fleet object.

---

## 2. Business Goal
Keeps commissionable book value aligned with updated fleet object values for active Sales Orders.

---

## 3. User Story
As a finance user, when fleet object values change, I want commissionable book values updated on Sales Orders, so that commissions remain accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custcol_sna_hul_fleet_no` | Saved search result | Update `custcol_sna_hul_so_commissionable_bv` |

---

## 5. Functional Requirements
- The script must read parameters `custscript_sna_mr_upd_so_object`, `custscript_sna_mr_upd_so_cmv`, and `custscript_sna_mr_upd_so_cust_applied`.
- The script must search for Sales Orders with line-level `custcol_sna_hul_fleet_no` matching the object and status in pending billing/fulfillment.
- The script must further filter Sales Orders by customer.
- For each matching Sales Order, the script must update `custcol_sna_hul_so_commissionable_bv` on matching item lines.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)

### Fields Referenced
- Sales Order Item | `custcol_sna_hul_fleet_no`
- Sales Order Item | `custcol_sna_hul_so_commissionable_bv`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching Sales Orders results in no updates.
- Invalid parameters should log errors without crash.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Loads and saves each Sales Order; line updates may be costly for large orders.
- Constraints: Requires valid fleet object and customer parameters.
- Dependencies: Sales Order status filters in search.
- Risk: Large orders increase processing time.

---

## 9. Acceptance Criteria
- Given matching Sales Orders, when the script runs, then matching Sales Order lines show the new commissionable book value.
- Given a Sales Order with multiple lines, when the script runs, then only lines matching the target fleet object are updated.

---

## 10. Testing Notes
- Happy path: Matching Sales Order lines update with new book value.
- Edge case: No matching Sales Orders results in no updates.
- Error handling: Invalid parameters should log errors without crash.
- Test data: Sales Orders with fleet number and customer matching input parameters.
- Sandbox setup: Provide valid `custscript_sna_mr_upd_so_object` and `custscript_sna_mr_upd_so_cmv` values.

---

## 11. Deployment Notes
- Verify parameter values for object, CMV, and customer.
- Upload `sna_hul_mr_upd_so_comm_book_val.js`.
- Deploy Map/Reduce with required parameters.
- Post-deployment: Validate updated lines on sample Sales Orders.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Schema details are not specified.
- Should updates include additional Sales Order statuses?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
