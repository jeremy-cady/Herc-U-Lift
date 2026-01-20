# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddCustomButtons
title: Support Case Create Transaction Buttons (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_add_custom_buttons.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Sales Order
  - Estimate
  - Task

---

## 1. Overview
A User Event that adds custom buttons on Support Case records to create Sales Orders or Estimates, and pre-populates transaction fields when those records are created from the case.

## 2. Business Goal
Streamlines creation of Sales Orders and Estimates from support cases, ensuring consistent defaults and preventing duplicate Sales Orders.

## 3. User Story
As a support user, when I need to create a transaction from a case, I want buttons to create Sales Orders and Estimates, so that I can act quickly on cases.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | `supportcase` | Support Case view | Add "Create Sales Order" and "Create Estimate/Quote" buttons |
| beforeLoad | `supportcase` | Sales Order/Estimate create from case | Prefill transaction fields and update case |

## 5. Functional Requirements
- On Support Case view, the system must add "Create Sales Order" and "Create Estimate/Quote" buttons.
- The system must select the Sales Order and Estimate custom forms based on case department and script parameters.
- The Sales Order creation button must warn users if an open Sales Order already exists for the case.
- When creating Sales Orders or Estimates with `supportcase` parameter, the system must pre-fill key fields (customer, subsidiary, department, location, contact, asset, revenue stream).
- When creating a Sales Order, the system must set `custbody_nx_case` and `custbody_nx_task` defaults.
- The system must update the support case with the created Sales Order ID in `custevent_nx_case_transaction`.

## 6. Data Contract
### Record Types Involved
- Support Case
- Sales Order
- Estimate
- Task

### Fields Referenced
- Support Case | `custevent_nx_customer`
- Support Case | `custevent_sna_hul_casedept`
- Support Case | `custevent_sna_hul_caselocation`
- Support Case | `custevent_nx_case_asset`
- Support Case | `custevent_nxc_case_assets`
- Support Case | `cseg_sna_revenue_st`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_task`
- Support Case | `custevent_nx_case_transaction`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Existing open Sales Order for case triggers confirmation.
- Case lacks task records; Sales Order still opens without task default.
- Lookup or query errors are logged without blocking UI.

## 8. Implementation Notes (Optional)
- SuiteQL query to fetch earliest task for the case.
- Duplicate detection only checks open Sales Orders.
- Form selection is driven by hardcoded department IDs.

## 9. Acceptance Criteria
- Given support case view, when the record is viewed, then buttons appear.
- Given a button click, when the action runs, then the correct custom form opens.
- Given transaction creation from case, when the record loads, then default fields are pre-filled.
- Given an open Sales Order exists, when creating a new Sales Order, then a duplicate warning is shown.

## 10. Testing Notes
- Open support case and click "Create Sales Order"; verify defaults and task assignment.
- Open support case and click "Create Estimate/Quote"; verify defaults.
- Existing open Sales Order for case triggers confirmation.
- Case lacks task records; Sales Order still opens without task default.
- Lookup or query errors are logged without blocking UI.

## 11. Deployment Notes
- Upload `sna_hul_ue_add_custom_buttons.js`.
- Set custom form parameters for Sales Orders and Estimates.
- Deploy User Event to Support Case, Sales Order, and Estimate as needed.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should duplicate Sales Order detection include closed statuses?
- Should Estimate creation also check for duplicates?
- Risk: Incorrect custom form parameter leads to wrong form (Mitigation: Validate parameter values per environment)
- Risk: Missing task data leaves Sales Order without task link (Mitigation: Add fallback or prompt user to select task)

---
