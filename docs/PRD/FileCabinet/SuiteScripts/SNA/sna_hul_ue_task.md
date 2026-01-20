# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TaskNotifEmail
title: Task Notification Email Sync (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_task.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Task
  - Support Case
  - Customer
  - Asset (`customrecord_nx_asset`)

---

## 1. Overview
A User Event on Task records that manages notification email defaults and updates the related support case when a task is completed.

## 2. Business Goal
Ensures task and case notification emails are set based on asset and customer data, and keeps the case updated when tasks complete.

## 3. User Story
As a service user, when tasks are created or edited, I want task notification emails set automatically, so that I do not maintain them manually.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | `custevent_sna_hul_nx_notif_email` | Task create/edit | Default notification email based on case/asset/customer data |
| afterSubmit | `status` | Task completion | Copy task notification email to support case |

## 5. Functional Requirements
- On task create/edit, the system must read the related support case.
- If the case is a shop case, the system must clear `custevent_sna_hul_nx_notif_email`.
- If notification email is empty, the system must set it from the asset site contact email, else from customer email fields.
- On edit, if customer has `custentity_sn_hul_no_servicereport`, the system must clear the notification email.
- On task completion, the system must copy the task notification email to the support case field `custevent_sna_hul_nx_notif_email`.

## 6. Data Contract
### Record Types Involved
- Task
- Support Case
- Customer
- Asset (`customrecord_nx_asset`)

### Fields Referenced
- Task | `custevent_sna_hul_nx_notif_email`
- Task | `supportcase`
- Support Case | `custevent_sna_hul_nx_notif_email`
- Support Case | `custevent_hul_shopcase`
- Support Case | `custevent_nx_case_asset`
- Customer | `custentity_sna_hul_case_email_notif`
- Customer | `custentity_sn_hul_no_servicereport`
- Asset | `custrecord_sn_hul_site_contact_email`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Shop case; notification email cleared.
- Customer with no-service-report flag; notification email cleared.
- Lookup failures are logged without blocking save.

## 8. Implementation Notes (Optional)
- Uses `shared/sna_hul_mod_utils` for `isEmpty`.
- Notification email logic depends on support case lookup fields.

## 9. Acceptance Criteria
- Given a task create/edit with empty notification email, when the script runs, then the email is defaulted.
- Given a shop case or customer opt-out, when the script runs, then the notification email is cleared.
- Given task completion, when the script runs, then the support case email is updated.

## 10. Testing Notes
- Create task with empty notification email; it is populated.
- Complete task; support case email is updated.
- Shop case; notification email cleared.
- Customer with no-service-report flag; notification email cleared.
- Lookup failures are logged without blocking save.

## 11. Deployment Notes
- Upload `sna_hul_ue_task.js`.
- Deploy User Event on Task record.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should notification email update on task edit when status is not complete?
- Should support case email also be updated in beforeSubmit?
- Risk: Missing asset contact email results in blank notification (Mitigation: Add fallback to customer email)
- Risk: Multiple updates on edit add governance usage (Mitigation: Optimize lookup usage)

---
