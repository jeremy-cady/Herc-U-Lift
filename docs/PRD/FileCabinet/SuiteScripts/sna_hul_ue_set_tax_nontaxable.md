# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetTaxNontaxable
title: Set Tax Not Taxable
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_set_tax_nontaxable.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - transaction

---

## 1. Overview
User Event that redirects to a suitelet to set line tax codes to Not Taxable for internal revenue streams.

---

## 2. Business Goal
Ensure tax codes are correctly set after transaction changes without blocking the save.

---

## 3. User Story
As a finance user, when internal revenue transactions are saved, I want non-taxable lines enforced, so that taxes are correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | record id/type | non-delete | Redirect to Set NonTaxable suitelet |

---

## 5. Functional Requirements
- On afterSubmit (excluding delete), redirect to the Set NonTaxable suitelet.
- Pass the record id and type to the suitelet.

---

## 6. Data Contract
### Record Types Involved
- transaction

### Fields Referenced
- None.

Schemas (if known):
- Suitelet: customscript_sna_hul_sl_set_nontaxable

---

## 7. Validation & Edge Cases
- Delete events do not trigger the suitelet.
- Suitelet deployment missing should log an error.

---

## 8. Implementation Notes (Optional)
- Requires suitelet deployment to be active.

---

## 9. Acceptance Criteria
- Given a saved transaction, when afterSubmit runs, then the suitelet is invoked with correct parameters.
- Given a delete event, when afterSubmit runs, then no redirect occurs.

---

## 10. Testing Notes
- Save a transaction and verify suitelet runs.
- Delete a transaction and verify no redirect occurs.
- Deploy User Event on target transaction types.

---

## 11. Deployment Notes
- Confirm suitelet deployment is active.
- Deploy User Event on target transactions and verify suitelet execution.
- Monitor suitelet errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should this redirect be conditional on transaction type?

---
