# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-BPUpdateRelatedCommPayable
title: Bill Payment Commission Payable Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_bp_update_related_comm_payable.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - billpayment
  - customtransaction_sna_commission_payable

---

## 1. Overview
User Event script on Bill Payment that marks related Commission Payable transactions as paid.

---

## 2. Business Goal
Keep commission payable status aligned with bill payment processing.

---

## 3. User Story
As an accounting user, when a bill payment is created or paybills occurs, I want commission payables marked as paid automatically, so that I do not have to update them manually.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Bill Payment apply sublist line type | create or paybills; line type is "Commission Payable" | Update related Commission Payable transaction to Paid |

---

## 5. Functional Requirements
- Run afterSubmit on Bill Payment create or paybills.
- Scan the apply sublist for lines of type "Commission Payable".
- Update related `customtransaction_sna_commission_payable` records to status Paid.

---

## 6. Data Contract
### Record Types Involved
- billpayment
- customtransaction_sna_commission_payable

### Fields Referenced
- Bill Payment | apply sublist line type | Detect Commission Payable lines
- customtransaction_sna_commission_payable | transtatus | Commission payable status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Bill Payment with no Commission Payable lines does nothing.
- submitFields errors are logged and do not block payment save.
- Commission Payable lines are detected by the apply sublist line type text.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Minimal; uses submitFields per matching line.

---

## 9. Acceptance Criteria
- Given a Bill Payment with Commission Payable apply lines, when afterSubmit runs, then related Commission Payable transactions are updated to status Paid (B).
- Given a Bill Payment without Commission Payable apply lines, when afterSubmit runs, then no Commission Payable records are updated.

---

## 10. Testing Notes
- Bill Payment applied to Commission Payable updates status to Paid.
- Bill Payment with no Commission Payable lines does nothing.
- submitFields errors are logged and do not block payment save.

---

## 11. Deployment Notes
- Confirm Commission Payable transaction type exists.
- Deploy User Event on Bill Payment and validate updates on a test payment.
- Monitor for failed updates in logs; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should additional statuses besides Paid be mapped in the future?

---
