# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvOtherCharges
title: Invoice Other Charges
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_inv_other_charges.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - customrecord_sna_service_code_type

---

## 1. Overview
User Event that calculates and adds "Other Charges" (shop fee) lines to invoices based on service code type and revenue stream rules.

---

## 2. Business Goal
Automate shop fee calculation and line insertion on invoices, including tax handling.

---

## 3. User Story
As a billing user, when an invoice is saved with misc fees allowed, I want shop fee lines added automatically, so that invoices reflect required other charges.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | Invoice lines | misc fee allowed and not generated | Calculate shop fees and insert Other Charge lines |

---

## 5. Functional Requirements
- Run beforeSubmit on invoice records.
- Exit if `custbody_sna_misc_fee_allowed` is false or `custbody_sna_misc_fee_generated` is true.
- Group invoice lines by `cseg_sna_revenue_st` and `custcol_sna_so_service_code_type` and sum amounts.
- Look up shop fee configuration from `customrecord_sna_service_code_type`.
- Insert an Other Charge item line with computed amount and tax code when applicable.
- Update `custbody_sna_tax_processed` when Avatax POS tax code is detected.

---

## 6. Data Contract
### Record Types Involved
- invoice
- customrecord_sna_service_code_type

### Fields Referenced
- invoice | custbody_sna_misc_fee_allowed | Misc fee allowed
- invoice | custbody_sna_misc_fee_generated | Misc fee generated
- invoice | custbody_sna_tax_processed | Tax processed
- invoice | custbody_sna_order_fulfillment_method | Fulfillment method
- invoice line | cseg_sna_revenue_st | Revenue stream
- invoice line | custcol_sna_so_service_code_type | Service code type
- invoice line | taxcode | Tax code
- invoice line | location | Location
- customrecord_sna_service_code_type | custrecord_sna_shop_fee_code_item | Other charge item
- customrecord_sna_service_code_type | custrecord_sna_shop_fee_percent | Shop fee percent
- customrecord_sna_service_code_type | custrecord_sna_min_shop_fee | Minimum shop fee
- customrecord_sna_service_code_type | custrecord_sna_max_shop_fee | Maximum shop fee

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Misc fee generated flag prevents insertion.
- Revenue stream/service type missing skips calculation.
- Service code lookup errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses `./sna_hul_mod_sales_tax.js` for tax line updates.
- Performance/governance considerations: Iterates invoice lines and inserts new lines; service code search per grouping.

---

## 9. Acceptance Criteria
- Given misc fee allowed and not generated, when beforeSubmit runs, then Other Charge lines are inserted for eligible groupings.
- Given shop fee configuration, when lines are inserted, then min/max constraints are respected and tax code is set when applicable.

---

## 10. Testing Notes
- Invoice with misc fee allowed inserts other charge line.
- Misc fee generated flag prevents insertion.
- Revenue stream/service type missing skips calculation.
- Deploy User Event on Invoice.

---

## 11. Deployment Notes
- Confirm service code configuration records exist.
- Deploy User Event on Invoice and validate other charge line insertion.
- Monitor logs for calculation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should other charge lines be re-evaluated on invoice edits?

---
