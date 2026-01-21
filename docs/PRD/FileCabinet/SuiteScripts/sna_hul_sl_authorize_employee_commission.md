# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AuthorizeEmployeeCommission
title: Authorize Employee Commission
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_authorize_employee_commission.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - customrecord_sna_hul_employee_spiff
  - customtransaction_sna_commission_payable
  - employee

---

## 1. Overview
Suitelet that displays eligible Employee Commission or Employee Spiff transactions and creates Commission Payable records based on user selections.

---

## 2. Business Goal
Provides a controlled workflow for authorizing commissions and linking source transactions to payable records.

---

## 3. User Story
- As a finance user, when I authorize commissions in bulk, I want payables created efficiently, so that processing is streamlined.
- As a finance user, when I filter by sales rep and period, I want only relevant transactions to appear, so that the list is scoped.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | TBD | Filters applied for commission type, posting date/period, accounts, subsidiary, and sales reps | Display eligible records and create Commission Payable transactions per sales rep |

---

## 5. Functional Requirements
- Render a filter form for commission type, posting date/period, accounts, subsidiary, and sales reps.
- Load results from a saved search based on commission type and filters.
- Display eligible records in a selectable sublist.
- Group selected rows by sales rep and create a Commission Payable transaction per rep.
- Link source records to the created Commission Payable record.

---

## 6. Data Contract
### Record Types Involved
- invoice
- customrecord_sna_hul_employee_spiff
- customtransaction_sna_commission_payable
- employee

### Fields Referenced
- invoiceline.custcol_sna_sales_rep
- invoiceline.custcol_sna_hul_sales_rep_comm_type
- invoiceline.custcol_sna_commission_amount
- invoiceline.custcol_sna_hul_eligible_for_comm
- invoiceline.custcol_sna_hul_rel_comms_payable
- invoiceline.custcol_sna_hul_authorized_emp_spiff
- customrecord_sna_hul_employee_spiff.custrecord_sna_hul_sales_rep_csm_2
- customrecord_sna_hul_employee_spiff.custrecord_sna_hul_spiff_amount
- customrecord_sna_hul_employee_spiff.custrecord_sna_hul_orig_transaction
- customrecord_sna_hul_employee_spiff.custrecord_sna_hul_emp_spiff_authorized
- customrecord_sna_hul_employee_spiff.custrecord_sna_hul_related_comm_payable

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Multiple sales reps produce multiple payable records.
- No records selected results in no payable creation.
- Missing account selections handled by default values.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Search-driven paging and record loads/saves.

---

## 9. Acceptance Criteria
- Given eligible commission/spiff records exist, when filters are applied, then records display in the results list.
- Given selected rows, when the Suitelet submits, then Commission Payable records are created with debit/credit lines.
- Given Commission Payable records are created, when the Suitelet completes, then source transactions are updated with links.

---

## 10. Testing Notes
Manual tests:
- Employee Commission selections create payable and update invoices.
- Employee Spiff selections create payable and update spiff records and originating transactions.
- Multiple sales reps produce multiple payable records.
- No records selected results in no payable creation.
- Missing account selections handled by default values.

---

## 11. Deployment Notes
- Confirm saved searches exist.
- Confirm account defaults.
- Deploy Suitelet and client script.
- Add navigation for commission authorization.

---

## 12. Open Questions / TBDs
- Should commission authorization support additional transaction types?

---
