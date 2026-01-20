# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalInvoicing
title: Rental Invoicing Map/Reduce
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_rentalinvoicing.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order (salesorder)
  - Invoice (invoice)

---

## 1. Overview
A Map/Reduce script that transforms selected Rental Sales Orders into Invoices.

---

## 2. Business Goal
Automates invoice creation for rental orders without manual transformation.

---

## 3. User Story
As a billing user, when rental Sales Orders need invoicing, I want them auto-invoiced, so that billing is faster.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must read Sales Order IDs from parameter `custscript_sna_rentalsoids`.
- The script must transform each Sales Order to an Invoice.
- The script must set the Invoice `account` field from parameter `custscript_sna_ar_account`.
- The script must save the Invoice and log the created ID.
- The script must email the initiating user on errors when `custscript_sna_current_user` is set.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (`salesorder`)
- Invoice (`invoice`)

### Fields Referenced
- Invoice | `account`

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Empty input list results in no processing.
- Invalid Sales Order ID triggers error logging and optional email.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One transform per Sales Order.
- Constraints: Requires valid Sales Order IDs and a valid A/R account.
- Risk: Incorrect account configured.

---

## 9. Acceptance Criteria
- Given Sales Order IDs are provided, when the script runs, then each input Sales Order generates an Invoice.
- Given the A/R account parameter is set, when an Invoice is created, then the Invoice uses the configured A/R account.
- Given `custscript_sna_current_user` is set, when errors occur, then errors are logged and emailed.

---

## 10. Testing Notes
- Happy path: A valid Sales Order ID produces a new Invoice.
- Edge case: Empty input list results in no processing.
- Error handling: Invalid Sales Order ID triggers error logging and optional email.
- Test data: Sample rental Sales Orders ready for invoicing.
- Sandbox setup: Configure `custscript_sna_rentalsoids` and `custscript_sna_ar_account`.

---

## 11. Deployment Notes
- Configure A/R account parameter and user notification parameter.
- Upload `sna_hul_mr_rentalinvoicing.js`.
- Deploy Map/Reduce with parameters.
- Post-deployment: Verify invoices created for a test batch.
- Rollback plan: Disable the script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Schema details are not specified.
- Should the commented line-filtering logic be re-enabled for billing dates?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
