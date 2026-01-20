# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InternalBillingAutomation
title: Internal Billing Automation (Customer Payments)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_internal_billing_automation.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice (record.Type.INVOICE)
  - Customer Payment (record.Type.CUSTOMER_PAYMENT)
  - Custom Record | customrecord_sna_hul_internal_billing
  - Custom Segment | customrecord_cseg_sna_revenue_st

---

## 1. Overview
A Map/Reduce script that generates customer payments for invoices as part of internal billing automation.

---

## 2. Business Goal
It automates creation of internal billing payments and logs tasks for tracking and error handling.

---

## 3. User Story
As a finance user, when internal billing payments need to be created, I want them created automatically, so that daily processing is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must load a saved search from `custscript_sna_internal_bill_search`.
- The script must flag invoices with `custbody_versapay_do_not_sync = true`.
- The script must create `customrecord_sna_hul_internal_billing` task records with invoice metadata and status.
- The script must transform invoices to customer payments and apply amounts equal to invoice amount + Avalara.
- The script must set internal billing task status to In Progress or Failed based on payment creation.

---

## 6. Data Contract
### Record Types Involved
- Invoice (`record.Type.INVOICE`)
- Customer Payment (`record.Type.CUSTOMER_PAYMENT`)
- Custom Record | `customrecord_sna_hul_internal_billing`
- Custom Segment | `customrecord_cseg_sna_revenue_st`

### Fields Referenced
- Invoice | `custbody_versapay_do_not_sync`
- Task | `custrecord_sna_hul_linked_invoice`
- Task | `custrecord_sna_hul_revenue_stream`
- Task | `custrecord_sna_hul_eq_cat_group`
- Task | `custrecord_sna_hul_manufacturer`
- Task | `custrecord_sna_hul_amt_credit`
- Task | `custrecord_sna_hul_customer`
- Task | `custrecord_sna_internal_billing_line_id`
- Task | `custrecord_sna_hul_internal_bill_status`
- Task | `custrecord_sna_hul_meta_data`
- Task | `custrecord_sna_hul_linked_payment`
- Task | `custrecord_sna_hul_error_logs`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing revenue stream mapping should still create a task but may fail payment creation.
- Payment creation failure logs error on task record and sets status to Failed.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Transforming invoices to payments per record.
- Constraints: Requires revenue stream custom segment to map internal billing accounts.
- Risk: Incorrect revenue stream mapping.

---

## 9. Acceptance Criteria
- Given invoices returned by the saved search, when the script runs, then internal billing task records are created for each invoice.
- Given an eligible invoice, when the script runs, then a customer payment is generated and applied to the invoice.
- Given a payment creation failure, when the script runs, then error details are logged on the task record.

---

## 10. Testing Notes
- Happy path: Invoice with revenue stream mapping generates a customer payment and updates task status.
- Edge case: Missing revenue stream mapping should still create a task but may fail payment creation.
- Error handling: Payment creation failure logs error on task record and sets status to Failed.
- Test data: Saved search returning invoices with revenue stream and amount fields.
- Sandbox setup: Ensure custom segment `customrecord_cseg_sna_revenue_st` has internal billing fields populated.

---

## 11. Deployment Notes
- Configure `custscript_sna_internal_bill_search` parameter.
- Upload `sna_hul_mr_internal_billing_automation.js`.
- Deploy Map/Reduce with saved search.
- Post-deployment: Validate internal billing tasks and payment creation logs.
- Rollback plan: Disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.
- How should failed tasks be retried and re-queued?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
