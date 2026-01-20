# PRD: Address Change Asset Update (Suitelet)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddressChangeSL
title: Address Change Asset Update (Suitelet)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_sl_address_change_update.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer
  - customrecord_nx_asset
  - job
  - Support Case
  - Task

---

## 1. Overview
A multi-step Suitelet wizard that updates equipment, projects, cases, and tasks when a customer’s site address changes, with real-time processing for small batches and Map/Reduce for large ones.

---

## 2. Business Goal
Large address-change updates can exceed UI execution limits and require strict FSM sequencing; this wizard guides selection and executes updates safely.

---

## 3. User Story
- As a service admin, I want to update a site’s related records so that equipment, projects, cases, and tasks stay in sync.
- As an FSM user, I want equipment updated first so that dependent records remain valid.
- As a user, I want a preview of changes so that I can confirm before applying updates.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | Customer, Old/New Site, record selections | 5-step wizard flow | Preview and execute updates or trigger Map/Reduce for large batches |

---

## 5. Functional Requirements
- The system must present a 5-step wizard: Step 1 Customer search, Step 2 Old/New site selection, Step 3 Record selection, Step 4 Preview and processing mode, Step 5 Results or Map/Reduce confirmation.
- The system must search customers by name or ID and return up to 50 results.
- The system must list active site assets (custrecord_nxc_na_asset_type = '1') for the selected customer.
- The system must list equipment assets by old site (custrecord_nxc_na_asset_type = '2', parent = oldSiteId).
- The system must list open cases for the customer/site (status != 5).
- The system must list open projects for the customer/site (not inactive and status not closed).
- The system must list open tasks by site (status != COMPLETE).
- The system must allow select/deselect all per sublist and default all rows to selected.
- The system must show a preview with record counts and prospective name/title changes.
- For batches over 20 records, the system must offer a Map/Reduce processing option.
- Real-time processing must enforce equipment-first updates and stop if equipment updates fail.
- Real-time updates must update equipment parent to new site, update project site and name while preserving equipment assets, update case site and title while preserving equipment assets, update task site and title and address fields from the new site.
- Map/Reduce processing must be triggered with parameters: custscript_acu_customer_id, custscript_acu_old_site_id, custscript_acu_new_site_id, custscript_acu_equipment_ids, custscript_acu_case_ids, custscript_acu_project_ids, custscript_acu_task_ids, custscript_acu_user_email.

---

## 6. Data Contract
### Record Types Involved
- Customer
- customrecord_nx_asset
- job
- Support Case
- Task

### Fields Referenced
- custrecord_nxc_na_asset_type
- custrecord_nx_asset_customer
- custrecord_sna_hul_fleetcode
- custrecord_nx_asset_serial
- custrecord_nx_asset_address_text
- custrecord_nx_asset_latitude
- custrecord_nx_asset_longitude
- custentity_nx_asset
- custentity_nxc_project_assets
- custentity_nx_project_type
- custevent_nx_case_asset
- custevent_nxc_case_assets
- custevent_nx_task_asset
- custevent_nx_address
- custevent_nx_latitude
- custevent_nx_longitude
- custscript_acu_customer_id
- custscript_acu_old_site_id
- custscript_acu_new_site_id
- custscript_acu_equipment_ids
- custscript_acu_case_ids
- custscript_acu_project_ids
- custscript_acu_task_ids
- custscript_acu_user_email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No records selected for one or more lists.
- Equipment update fails and processing stops.
- Old/new site names do not appear in titles (no change).
- SuiteQL query failure logs an error and returns empty list.
- Record save failure logs and surfaces in results.

---

## 8. Implementation Notes (Optional)
- Real-time processing up to 20 records; larger sets via Map/Reduce.
- Project name rebuilt from type + number + new site, capped at 83 chars.

---

## 9. Acceptance Criteria
- Given a customer search, when users select a customer, then old/new site dropdowns populate with active site assets.
- Given record lists, when displayed, then equipment, cases, projects, and tasks can be selected in bulk.
- Given preview mode, when displayed, then summary counts and proposed name/title changes appear.
- Given real-time processing, when executed, then records update in equipment-first order and halt on equipment failure.
- Given large batches, when selected, then Map/Reduce option is offered and triggers successfully.

---

## 10. Testing Notes
- Select customer/sites and run real-time updates under 20 records.
- Run a batch over 20 records and trigger Map/Reduce.
- Verify project, case, and task names update correctly.
- Verify equipment update failure halts processing.

---

## 11. Deployment Notes
- Upload hul_sl_address_change_update.js and hul_mr_address_change_update.js.
- Create Suitelet and Map/Reduce script records.
- Configure deployments and permissions.
- Validate end-to-end flow in sandbox.
- Rollback: disable Suitelet and Map/Reduce deployments.

---

## 12. Open Questions / TBDs
- Should the realtime threshold of 20 be configurable?
- Should closed cases be optionally included?
- Should site selection include inactive sites for historical updates?
- Equipment update failure halts processing.
- Large batch timeouts.

---
