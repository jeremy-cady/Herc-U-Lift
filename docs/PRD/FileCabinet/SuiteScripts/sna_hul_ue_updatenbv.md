# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateNBV
title: Update NBV on Asset Values
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_updatenbv.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_fam_assetvalues
  - customrecord_ncfar_asset

---

## 1. Overview
Sets net book value on newly created FAM Asset Values records using the linked fixed asset cost when created by Map/Reduce.

---

## 2. Business Goal
Keep asset values in sync with fixed asset cost for MR-created asset value records.

---

## 3. User Story
As an accounting user, when asset value records are created by Map/Reduce, I want NBV populated from the fixed asset cost so that reporting is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custrecord_slavebookvalue | execution context = Map/Reduce, create | Load asset values, look up parent asset cost, update NBV. |

---

## 5. Functional Requirements
- Only run when execution context is Map/Reduce and the record is created.
- Load the new `customrecord_fam_assetvalues` record and read `custrecord_slaveparentasset`.
- Look up `custrecord_assetcost` from the linked `customrecord_ncfar_asset`.
- Update `custrecord_slavebookvalue` on the asset values record to the asset cost.

---

## 6. Data Contract
### Record Types Involved
- Custom record: customrecord_fam_assetvalues
- Custom record: customrecord_ncfar_asset

### Fields Referenced
- Asset Values | custrecord_slaveparentasset | Linked asset
- Asset Values | custrecord_slavebookvalue | Net book value
- Fixed Asset | custrecord_assetcost | Asset cost

Schemas (if known):
- Fixed Asset | customrecord_ncfar_asset | Asset cost source

---

## 7. Validation & Edge Cases
- Records created in other contexts are not updated.
- If no linked asset exists, no update occurs.
- Asset lookup failures are logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Uses a load on the asset values record and a lookup on the fixed asset record.

---

## 9. Acceptance Criteria
- Given an asset values record created by Map/Reduce, when the record is saved, then `custrecord_slavebookvalue` equals the fixed asset cost.
- Given an asset values record created in another context, when the record is saved, then no update occurs.

---

## 10. Testing Notes
- Run the MR that creates asset values and verify NBV equals asset cost.
- Create an asset values record manually and verify no update occurs.
- Create an asset values record with missing parent asset and verify no update.

---

## 11. Deployment Notes
- Deploy the user event to `customrecord_fam_assetvalues`.
- Confirm the MR process creates asset values in Map/Reduce context.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should NBV update also run on edit when asset cost changes?

---
