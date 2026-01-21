# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetTaxNonTaxable
title: Set Tax Non-Taxable
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_set_tax_nontaxable.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - creditmemo

---

## 1. Overview
Suitelet that updates invoice or credit memo tax codes based on revenue stream and internal tax logic.

---

## 2. Business Goal
Ensures lines are set to Not Taxable for internal revenue streams and correct tax calculation behavior.

---

## 3. User Story
- As a finance user, when I set internal lines to non-taxable, I want tax calculated correctly, so that compliance is maintained.
- As an admin, when I trigger tax updates via a Suitelet, I want UE logic invoked, so that downstream updates run.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | custparam_recordId, custparam_recordType | Parameters provided | Update tax codes and calculation flags, then save and redirect |

---

## 5. Functional Requirements
- Accept `custparam_recordId` and `custparam_recordType`.
- Load the transaction and call `mod_tax.updateLines`.
- For internal revenue streams, set `taxcode` to Not Taxable and `custcol_ava_taxamount` to 0.
- For external revenue streams on invoices, set `taxcode` to AvaTax.
- For credit memos, unapply and reapply applied documents when internal logic is used.
- Save the transaction and redirect back to the record.

---

## 6. Data Contract
### Record Types Involved
- invoice
- creditmemo

### Fields Referenced
- Transaction | custbody_ava_disable_tax_calculation | AvaTax disable flag
- Transaction Line | cseg_sna_revenue_st | Revenue stream
- Transaction Line | custcol_ava_taxamount | AvaTax tax amount

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing record ID redirects back without changes.
- Credit memo with applied docs re-applies after update.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record load/save and line updates.

---

## 9. Acceptance Criteria
- Given internal revenue stream lines, when the Suitelet runs, then lines are set to Not Taxable and tax amounts reset.
- Given external revenue stream lines on invoices, when the Suitelet runs, then AvaTax tax code is retained.
- Given credit memo applications, when the Suitelet runs, then applications are restored after update.

---

## 10. Testing Notes
Manual tests:
- Internal lines set to Not Taxable on invoice.
- External lines keep AvaTax tax code.
- Credit memo with applied docs re-applies after update.
- Missing record ID redirects back without changes.

---

## 11. Deployment Notes
- Validate AvaTax settings.
- Deploy Suitelet.
- Add link/button on transactions.

---

## 12. Open Questions / TBDs
- Should internal detection use a field ID instead of text match?

---
