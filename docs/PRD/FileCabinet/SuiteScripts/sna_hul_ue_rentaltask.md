# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalTask
title: Rental Task Updates
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_rentaltask.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - task
  - supportcase
  - customrecord_sna_objects
  - customrecord_sna_equipment_asset
  - salesorder
  - itemfulfillment

---

## 1. Overview
User Event that updates rental objects, assets, and related sales orders based on NextService task activity.

---

## 2. Business Goal
Keep rental asset status, sales order data, and task links in sync with delivery, pickup, check-in, and workshop tasks.

---

## 3. User Story
As a dispatcher, when tasks complete, I want asset and order statuses updated, so that rental operations stay accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | task status/type | task create/edit (non-delete) | Update object status, rental status, SO returns, and task links |

---

## 5. Functional Requirements
- On task create/edit (excluding delete), load the task, linked asset, and support case details.
- For pickup and delivery tasks, update object status and rental status per configured task/case types.
- For completed pickup tasks, update related sales order return values and latest hour meters.
- For delivery tasks, update the sales order and create fulfillment data as needed for delivered equipment.
- When a case is linked and the sales order has no task reference, set `custbody_nx_task` on the sales order.
- For workshop tasks marked complete, update asset site/customer based on employee location.

---

## 6. Data Contract
### Record Types Involved
- task
- supportcase
- customrecord_sna_objects
- customrecord_sna_equipment_asset
- salesorder
- itemfulfillment

### Fields Referenced
- task | custevent_nx_task_type | Task type
- task | custevent_nx_task_asset | Task asset
- task | custevent_nxc_task_result | Task result
- supportcase | custevent_nx_case_type | Case type
- supportcase | custevent_nx_case_transaction | Related transaction
- salesorder | custbody_nx_task | Task reference
- customrecord_sna_objects | custrecord_sna_rental_status | Rental status
- customrecord_sna_objects | custrecord_sna_status | Object status

Schemas (if known):
- Saved search: customsearch_sn_hul_latest_hm

---

## 7. Validation & Edge Cases
- Task without asset or support case should not update records.
- Missing parameter values should log errors without breaking task save.
- PO update errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses script parameters for task types and status values.
- Performance/governance considerations: Multiple searches and submitFields, plus fulfillment creation.

---

## 9. Acceptance Criteria
- Given pickup/delivery tasks, when afterSubmit runs, then object and rental statuses update as configured.
- Given completed pickup tasks, when afterSubmit runs, then SO return details and hour meters update.
- Given linked case and missing task reference, when afterSubmit runs, then SO task reference is set.

---

## 10. Testing Notes
- Complete a pickup task and verify SO return details update.
- Complete a delivery task and verify object status and SO updates.
- Task without asset or support case should not update records.
- Deploy User Event on task record.

---

## 11. Deployment Notes
- Configure script parameters for task and case types.
- Deploy User Event on task record and validate updates on task completion.
- Monitor logs for missing data warnings; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Which task types should create or update item fulfillments?

---
