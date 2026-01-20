# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TaxAutomation
title: Tax Automation Map/Reduce
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_tax_automation.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transactions (Sales Order or other transaction types returned by search)

---

## 1. Overview
A Map/Reduce script that applies tax codes on transactions based on order fulfillment method.

---

## 2. Business Goal
Automates tax code updates for transactions by applying POS or ship tax codes across header and lines.

---

## 3. User Story
As a tax admin, when transactions are processed, I want tax codes applied consistently, so that transactions use correct tax settings.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custbody_sna_order_fulfillment_method` | Saved search result | Set header and line tax codes and mark processed |

---

## 5. Functional Requirements
- The script must load saved search `customsearch_sna_bulk_tax_automation`.
- The script must read `custbody_sna_order_fulfillment_method` from each transaction.
- The script must select a tax code based on parameters `custscript_sna_ofm_willcall`, `custscript_sna_ofm_ship`, `custscript_sna_tax_avataxpos`, and `custscript_sna_tax_avatax`.
- The script must set `shippingtaxcode` and `custbody_sna_tax_processed` on the transaction.
- The script must update each item line `taxcode` with the selected tax code.

---

## 6. Data Contract
### Record Types Involved
- Transactions (Sales Order or other transaction types returned by search)

### Fields Referenced
- Transaction | `custbody_sna_order_fulfillment_method`
- Transaction | `custbody_sna_tax_processed`
- Transaction | `shippingtaxcode`
- Line | `taxcode`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing fulfillment method results in no update.
- Invalid tax code values are logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Updates each line in dynamic mode per transaction.
- Constraints: Requires correct configuration of order fulfillment method values and tax codes.
- Dependencies: Saved search configuration.
- Risk: Misconfigured tax code parameters.

---

## 9. Acceptance Criteria
- Given transactions in the saved search, when the script runs, then transactions are updated with the correct header and line tax codes.
- Given a transaction is processed, when the script runs, then `custbody_sna_tax_processed` is set to true.

---

## 10. Testing Notes
- Happy path: Transaction with will-call method gets POS tax code.
- Happy path: Transaction with ship method gets standard AvaTax code.
- Edge case: Missing fulfillment method results in no update.
- Error handling: Invalid tax code values are logged.
- Test data: Transactions matching the saved search with differing fulfillment methods.
- Sandbox setup: Configure script parameters for fulfillment method and tax codes.

---

## 11. Deployment Notes
- Validate saved search `customsearch_sna_bulk_tax_automation`.
- Upload `sna_hul_mr_tax_automation.js`.
- Deploy Map/Reduce with required parameters.
- Post-deployment: Review a sample transaction for tax code updates.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Schema details are not specified.
- Should tax updates run for transaction types beyond Sales Orders?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
