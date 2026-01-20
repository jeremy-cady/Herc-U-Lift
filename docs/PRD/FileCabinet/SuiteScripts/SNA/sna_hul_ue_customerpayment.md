# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CustomerPaymentCleanup
title: Customer Payment Delete Cleanup (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_customerpayment.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer Payment
  - Invoice
  - Internal Billing (`customrecord_sna_hul_internal_billing`)

---

## 1. Overview
A User Event that untags invoice line items when a customer payment is deleted for internal billing processing.

## 2. Business Goal
Ensures invoice lines can be reprocessed if the payment tied to internal billing is removed.

## 3. User Story
As an accounting user, when a payment is deleted, I want invoice lines reset when a payment is deleted, so that internal billing can be rerun.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| DELETE | `custrecord_sna_hul_linked_payment` | Customer payment delete | Clear internal billing processed flags on invoice lines |

## 5. Functional Requirements
- The system must run only on `DELETE` operations for customer payments.
- The system must search `customrecord_sna_hul_internal_billing` for records linked to the payment.
- The system must group invoice line IDs by invoice.
- The system must set `custcol_sn_internal_billing_processed` to `false` on those invoice lines.

## 6. Data Contract
### Record Types Involved
- Customer Payment
- Invoice
- Internal Billing (`customrecord_sna_hul_internal_billing`)

### Fields Referenced
- Internal Billing | `custrecord_sna_hul_linked_payment`
- Internal Billing | `custrecord_sna_hul_linked_invoice`
- Internal Billing | `custrecord_sna_internal_billing_line_id`
- Invoice line | `custcol_sn_internal_billing_processed`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Payment has no linked internal billing records; no updates occur.
- Invoice line IDs are missing or invalid; errors are logged.
- Invoice load/save errors are logged.

## 8. Implementation Notes (Optional)
- Uses promise-based record load/save; execution timing depends on NetSuite async handling.

## 9. Acceptance Criteria
- Given a linked payment is deleted, when the script runs, then invoice line flags reset.
- Given errors occur, when the script runs, then they are logged without blocking the delete operation.

## 10. Testing Notes
- Delete a customer payment and verify invoice line flags reset.
- Payment has no linked internal billing records; no updates occur.
- Invoice line IDs are missing or invalid; errors are logged.
- Invoice load/save errors are logged.

## 11. Deployment Notes
- Upload `sna_hul_ue_customerpayment.js`.
- Deploy on Customer Payment record.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should internal billing records be updated or cleaned up after delete?
- Should invoice updates be performed synchronously or via a scheduled script?
- Risk: Async promises do not complete before delete finalizes (Mitigation: Consider Map/Reduce or Scheduled fallback)
- Risk: Large invoice updates consume governance (Mitigation: Batch updates if needed)

---
