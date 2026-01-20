# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DeleteFinanceChargeMR
title: Delete Finance Charge Invoices (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/SNA/sna_hul_mr_delete_finance_charge_invoice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice (or record types returned by the search)

---

## 1. Overview
A Map/Reduce script that deletes finance charge invoices based on a saved search and emails a summary of successes and failures.

## 2. Business Goal
Automates bulk deletion of finance charge invoices for customers flagged as no-finance-charge and reports results to the user.

## 3. User Story
As an AR admin, when I need finance charge invoices removed in bulk, I want finance charge invoices removed in bulk, so that accounts are corrected.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Script run on `customsearch_sna_fin_chrg_cust` | Delete invoices and send summary email |

## 5. Functional Requirements
- The system must load saved search `customsearch_sna_fin_chrg_cust` as input.
- The system must delete each record returned by the search using `record.delete`.
- The system must log successful deletions and track failures.
- The system must generate a summary email with counts and failed record links.
- The system must send the email to `custscript_sna_delete_inv_emailto`.

## 6. Data Contract
### Record Types Involved
- Invoice (or record types returned by the search)

### Fields Referenced
- Script parameter | `custscript_sna_delete_inv_emailto`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No results; summary email indicates no deletions.
- Delete fails for a record; failure included in email.
- Email send fails; error logged.

## 8. Implementation Notes (Optional)
- Deletion is unconditional (no sandbox-only guard enabled).
- Emails are sent to a single configured recipient.

## 9. Acceptance Criteria
- Given the saved search results, when the script runs, then invoices are deleted.
- Given failures, when the script runs, then failures are captured with record links.
- Given the run completes, when the script runs, then the summary email contains counts and failures.

## 10. Testing Notes
- Saved search returns invoices; script deletes and emails summary.
- No results; summary email indicates no deletions.
- Delete fails for a record; failure included in email.
- Email send fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_mr_delete_finance_charge_invoice.js`.
- Set `custscript_sna_delete_inv_emailto` recipient.
- Run in sandbox before production.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should deletions be restricted to sandbox environments?
- Should failed deletions be retried automatically?
- Risk: Accidental deletion of valid invoices (Mitigation: Review saved search criteria before run)
- Risk: Email recipient misconfigured (Mitigation: Validate parameter before running)

---
