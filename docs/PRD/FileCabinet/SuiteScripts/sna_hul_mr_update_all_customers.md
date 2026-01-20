# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateAllCustomers
title: Update All Customers
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_update_all_customers.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer (customer)
  - Script Deployment (for internal MR orchestration logic)

---

## 1. Overview
A Map/Reduce script that loads and saves customer records in bulk to trigger downstream updates.

---

## 2. Business Goal
Provides a bulk mechanism to refresh customer records and potentially kick off related sales rep matrix updates.

---

## 3. User Story
As a sales admin, when customer records need refreshing, I want them updated in bulk, so that dependent logic can re-evaluate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | `custscript_sna_hul_customer_id` provided | Load and save each customer record |

---

## 5. Functional Requirements
- The script must read customer IDs from parameter `custscript_sna_hul_customer_id` (JSON array).
- The script must search active customers matching the provided IDs.
- The script must load and save each customer record.
- The script must log remaining usage during summarize.

---

## 6. Data Contract
### Record Types Involved
- Customer (`customer`)
- Script Deployment (for internal MR orchestration logic)

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Empty input list results in no processing.
- Invalid customer ID logs an error and continues.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One record load/save per customer.
- Constraints: Requires valid customer IDs and active status.
- Dependencies: Optional downstream MR script `customscript_sna_hul_mr_upd_matrix_oncus` if enabled.
- Risk: Large customer lists may increase runtime.

---

## 9. Acceptance Criteria
- Given customer IDs are provided, when the script runs, then each provided customer ID is processed and saved.
- Given inactive customers are present, when the script runs, then inactive customers are excluded.

---

## 10. Testing Notes
- Happy path: Valid customer IDs are loaded and saved.
- Edge case: Empty input list results in no processing.
- Error handling: Invalid customer ID logs an error and continues.
- Test data: A list of active customer IDs.
- Sandbox setup: Provide `custscript_sna_hul_customer_id` parameter as JSON array.

---

## 11. Deployment Notes
- Confirm customer ID list format and size.
- Upload `sna_hul_mr_update_all_customers.js`.
- Deploy Map/Reduce with customer ID parameter.
- Post-deployment: Spot-check a sample customer to confirm save occurred.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Fields referenced are not specified.
- Schema details are not specified.
- Should the downstream sales rep matrix MR be re-enabled in summarize?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
