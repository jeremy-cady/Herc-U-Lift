# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalOrdersModule
title: Rental Orders Helper Module
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_rental_orders.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Time Bill (Time Entry)

---

## 1. Overview
A shared module that updates linked time entry records when a rental sales order is copied.

## 2. Business Goal
Ensures copied rental orders keep their linked time entries pointing to the new sales order and updates time entry descriptions accordingly.

## 3. User Story
As an admin, when rental orders are copied, I want time entries updated when orders are copied, so that links remain accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `custcol_sna_linked_time` | Sales order copy | Update time entry references and descriptions |

## 5. Functional Requirements
- The system must read `custcol_sna_linked_time` values from each item line on the sales order.
- The system must de-duplicate time entry IDs and ignore empty values.
- For each time entry ID, the system must update `custcol_sna_linked_so` to the new sales order ID.
- After updating, the system must look up the sales order `tranid` and set `custcol_nxc_time_desc` and `memo`.
- The system must log audit details for successful updates and log errors on failure.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Time Bill (Time Entry)

### Fields Referenced
- Sales Order line | `custcol_sna_linked_time`
- Time Entry | `custcol_sna_linked_so`
- Time Entry | `custcol_nxc_time_desc`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Sales order has no linked time entries.
- Duplicate time entry IDs in multiple lines.
- submitFields fails for a time entry; error logged.

## 8. Implementation Notes (Optional)
- Uses `record.submitFields.promise` followed by a synchronous submitFields.
- Assumes `custcol_sna_linked_time` contains time entry IDs.

## 9. Acceptance Criteria
- Given linked time entries, when the helper runs, then they point to the new sales order after copy.
- Given linked time entries, when the helper runs, then time entry description and memo match the new sales order tranid.
- Given an error, when the helper runs, then it is logged without crashing the process.

## 10. Testing Notes
- Copy a sales order with linked time entries; time entries update.
- Sales order has no linked time entries.
- Duplicate time entry IDs in multiple lines.
- submitFields fails for a time entry; error logged.

## 11. Deployment Notes
- Upload `sna_hul_mod_rental_orders.js`.
- Ensure consuming scripts reference the module.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the update be skipped if the time entry is locked or approved?
- Should the memo updates be optional?
- Risk: Time entry update fails due to permissions (Mitigation: Ensure deployment role has edit access)
- Risk: Large number of time entries (Mitigation: Batch or limit updates if needed)

---
