# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateSoLineLevelFields
title: Update SO Line-Level Fields from Header
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_update_so_line_level_fields.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - employee

---

## 1. Overview
Copies selected header values to sales order lines after submit and fills missing header location from assigned employee locations.

---

## 2. Business Goal
Keep line-level segment and asset fields consistent with header values while preserving manual line entries when overrides are disabled.

---

## 3. User Story
As a sales or dispatch user, when I save a sales order, I want header values applied to lines (when allowed) so that line data remains consistent without re-entering fields.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | header fields | non-delete | Load transaction and read header values and override flags. |
| afterSubmit | location | header location empty | Resolve assigned-to employee locations and set header location to the first available. |
| afterSubmit | line fields | per line | Set line fields from header when override is true or line value is empty. |
| afterSubmit | N/A | updates applied | Save the transaction. |

---

## 5. Functional Requirements
- On afterSubmit (non-delete), load the transaction and read header location, revenue stream, and NXC asset values.
- If header location is empty, look up assigned-to employee locations and set header location to the first found.
- For each line, set line values from header values when override flags are true or when the line value is empty.
- Save the transaction after updates.

---

## 6. Data Contract
### Record Types Involved
- Sales Order (or deployed transaction type)
- Employee

### Fields Referenced
- Transaction header | custbody_sna_hul_apply_dept_all | Apply department to all
- Transaction header | custbody_sna_hul_apply_rev_all | Apply revenue stream to all
- Transaction header | custbody_nx_asset | NXC site asset
- Transaction header | custbody_sna_hul_nxc_eq_asset | NXC equipment asset
- Item line | cseg_sna_revenue_st | Revenue stream
- Item line | custcol_nx_asset | NXC site asset
- Item line | custcol_nxc_equip_asset | NXC equipment asset
- Item line | custcol_sna_task_assigned_to | Assigned to
- Employee | custentity_nx_location | Employee location

Schemas (if known):
- Employee | custentity_nx_location | Location source for header fill

---

## 7. Validation & Edge Cases
- Override flags control whether existing line values are overwritten.
- If no assigned-to employee has a location, header location remains blank.
- Department propagation is not applied (commented out in script).

---

## 8. Implementation Notes (Optional)
- Header location fallback uses assigned-to employee location lookup.
- Asset override flags currently reuse `custbody_sna_hul_apply_rev_all`.

---

## 9. Acceptance Criteria
- Given header revenue stream and assets, when the record is saved, then line values are updated according to override flags.
- Given header location is blank and assigned-to employees have a location, when the record is saved, then header location is set.
- Given line values present and override flags false, when the record is saved, then those line values remain unchanged.

---

## 10. Testing Notes
- Save a sales order with header values and verify line updates.
- Save with blank header location and assigned-to employee locations; verify header location is populated.
- Save with line values present and override flags false; verify no overwrite.

---

## 11. Deployment Notes
- Ensure override fields are available on the form.
- Deploy the user event to Sales Order.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should asset override flags use distinct header fields instead of `custbody_sna_hul_apply_rev_all`?

---
