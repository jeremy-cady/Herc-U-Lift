# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SupportCaseEmailUE
title: Support Case Email Update on Close (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/Case/sn_hul_ue_supportcase.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case (`supportcase`)

---

## 1. Overview
A User Event script that updates the support case `email` field when a case is edited and its status changes to Closed.

## 2. Business Goal
Ensures the support case email is set from a custom notification email field when the case closes.

## 3. User Story
As a support coordinator, when a case closes, I want the case email set on close, so that notifications go to the correct address.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | `status` | EDIT or XEDIT and status changes to `5` | Copy `custevent_sna_hul_case_email_notif` into `email` |

## 5. Functional Requirements
- The system must run on `afterSubmit` for `EDIT` and `XEDIT` events.
- The system must compare old and new case statuses.
- The system must detect a change to status value `5` (Closed).
- The system must read `custevent_sna_hul_case_email_notif` from the case.
- If the notification email exists, the system must update `email` on the case via `record.submitFields`.
- The system must ignore mandatory fields during the update.

## 6. Data Contract
### Record Types Involved
- Support Case (`supportcase`)

### Fields Referenced
- Support Case | `custevent_sna_hul_case_email_notif`
- Support Case | `email`
- Support Case | `status`
- Support Case | `custevent4` (read but unused in current logic)

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Notification email is blank; no update occurs.
- Non-close edits do not update the `email` field.
- submitFields fails due to permissions; error logged by NetSuite.

## 8. Implementation Notes (Optional)
- Status comparison is string-based with `STATUS_CLOSED = '5'`.
- `beforeLoad` is defined but empty.
- `checkSystemNotes` exists but is not used (commented block).

## 9. Acceptance Criteria
- Given a case transitions to Closed, when the script runs, then the `email` field is updated from the notification email.
- Given the notification email is blank, when the script runs, then no update occurs.
- Given a non-close edit, when the script runs, then the `email` field is not updated.

## 10. Testing Notes
- Edit a case and change status to Closed with a notification email present.
- Change status to Closed without a notification email.
- Edit other fields without changing status.
- XEDIT status change to Closed.

## 11. Deployment Notes
- Upload `sn_hul_ue_supportcase.js`.
- Deploy as a User Event on support case edits.
- Validate case close behavior in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the close status be derived from a list/enum instead of a hard-coded value?
- Should the script run on create if a case is created as Closed?
- Risk: Status internal ID changes (Mitigation: Use status enum or search for closed status)
- Risk: Notification email missing (Mitigation: Keep no-op when email is blank)

---
