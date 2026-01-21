# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TimeBillLinkedSo
title: Time Bill Linked Sales Order Sync
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_timebill.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - timebill
  - salesorder

---

## 1. Overview
Triggers a Suitelet to sync time bill changes to a linked sales order line after save.

---

## 2. Business Goal
Ensure time entry updates are propagated to the sales order workflow for resource items.

---

## 3. User Story
As a dispatcher, when I save a time bill linked to a sales order, I want the related sales order line synchronized so that service hours stay accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custcol_sna_linked_so | any | Read linked sales order and time bill details. |
| afterSubmit | N/A | non-delete, linked sales order present | Invoke Suitelet to sync time bill data to the linked sales order line. |

---

## 5. Functional Requirements
- Read `custcol_sna_linked_so`, hours, and posted values from the time bill in beforeSubmit.
- If linked to a sales order, locate the linked line via `custcol_sna_linked_time`.
- On afterSubmit (non-delete), call the Suitelet with time bill and sales order details.
- In UI context, redirect to the Suitelet; in Suitelet context, POST to the Suitelet URL.

---

## 6. Data Contract
### Record Types Involved
- Time Bill
- Sales Order

### Fields Referenced
- Time Bill | custcol_sna_linked_so | Linked sales order
- Sales Order line | custcol_sna_linked_time | Linked time id
- Sales Order line | custcol_sna_hul_act_service_hours | Actual service hours
- Sales Order line | custcol_nx_task | NXC task
- Sales Order line | custcol_sna_service_itemcode | Service code type

Schemas (if known):
- Suitelet | customscript_sna_hul_sl_time_so | Time bill to sales order sync handler

---

## 7. Validation & Edge Cases
- Deletes do not trigger the Suitelet.
- If no linked sales order exists, no Suitelet call is made.
- Suitelet failures are logged and do not block save.

---

## 8. Implementation Notes (Optional)
- UI context uses redirect; non-UI context uses HTTPS POST to the Suitelet URL.

---

## 9. Acceptance Criteria
- Given a time bill linked to a sales order, when the time bill is saved, then the Suitelet is invoked with time bill and sales order details.
- Given a time bill is deleted, when the delete occurs, then no Suitelet call is made.
- Given a time bill without a linked sales order, when the time bill is saved, then no Suitelet call is made.

---

## 10. Testing Notes
- Save a time bill linked to a sales order and verify Suitelet invocation/logs.
- Save a time bill without a linked sales order and verify no Suitelet call.
- Delete a time bill and verify no Suitelet call.

---

## 11. Deployment Notes
- Deploy Suitelet `customscript_sna_hul_sl_time_so`.
- Deploy the user event to Time Bill.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should UI redirect be replaced with background processing?

---
