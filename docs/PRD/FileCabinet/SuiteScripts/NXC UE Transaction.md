# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-NXCUETransaction
title: Link Transaction to Support Case (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/NXC UE Transaction.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Estimate/Quote
  - Support Case

---

## 1. Overview
A User Event script that links a newly created Sales Order or Estimate to a Support Case.

---

## 2. Business Goal
Ensure transactions created from a case are linked back to the case for traceability.

---

## 3. User Story
As a support user, when a transaction is created from a case, I want the transaction linked to the case, so that I can see activity from the case.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custbody_nx_case | create event and case ID exists | Set `custevent_nx_case_transaction` on support case to transaction ID |

---

## 5. Functional Requirements
- Run on `create` afterSubmit events.
- Read `custbody_nx_case` from the transaction.
- If a case ID exists, set `custevent_nx_case_transaction` on the support case to the transaction ID.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Estimate/Quote
- Support Case

### Fields Referenced
- Transaction | custbody_nx_case
- Support Case | custevent_nx_case_transaction

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No update occurs if `custbody_nx_case` is empty.

---

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 style afterSubmit.
- Performance/governance considerations: single submitFields call per create.

---

## 9. Acceptance Criteria
- Given a transaction with `custbody_nx_case` set, when it is created, then the support case is updated with the transaction ID.
- Given `custbody_nx_case` is empty, when the transaction is created, then no case update occurs.

---

## 10. Testing Notes
- Create transaction with `custbody_nx_case` set; confirm case updated.
- Create transaction without `custbody_nx_case`; confirm no update occurs.

---

## 11. Deployment Notes
- Upload `NXC UE Transaction.js`.
- Deploy User Event on transactions created from cases.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script validate transaction type explicitly?
- Risk: Workflow does not set `custbody_nx_case`.

---
