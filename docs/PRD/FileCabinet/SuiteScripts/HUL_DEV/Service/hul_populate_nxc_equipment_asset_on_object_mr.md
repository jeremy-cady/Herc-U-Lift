# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateEquipAssetOnObjectMR
title: Populate Equipment Asset on Objects (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Service/hul_populate_nxc_equipment_asset_on_object_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects

---

## 1. Overview
A Map/Reduce script that backfills a custom equipment asset field on object records based on the asset-to-object relationship.

## 2. Business Goal
Ensures object records have a direct reference to their equipment asset for downstream processes.

## 3. User Story
As an admin, when objects lack equipment asset references, I want object records linked to equipment assets, so that integrations can rely on a single field.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | Backfill `custrecord_hul_nxcequipasset` on `customrecord_sna_objects` |

## 5. Functional Requirements
- The system must query `customrecord_nx_asset` joined to `customrecord_sna_objects` where `custrecord_nxc_na_asset_type = '2'`, `customrecord_sna_objects.id > 1253190000`, and `customrecord_sna_objects.id <= 1253192000`.
- The system must emit asset/object ID pairs.
- The reduce stage must update each object with `custrecord_hul_nxcequipasset = <assetID>`.
- Errors must be logged without halting the run.

## 6. Data Contract
### Record Types Involved
- Field Service Asset (`customrecord_nx_asset`)
- Object (`customrecord_sna_objects`)

### Fields Referenced
- Object | `custrecord_hul_nxcequipasset`
- Asset | `custrecord_sna_hul_nxcassetobject`
- Asset | `custrecord_nxc_na_asset_type`
- Object | `id`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No results in the range; script completes without updates.
- Errors are logged without stopping execution.

## 8. Implementation Notes (Optional)
- Hard-coded object ID range.

## 9. Acceptance Criteria
- Given object records in the ID range, when the script runs, then equipment asset IDs are populated.
- Given assets outside the range, when the script runs, then they are not processed.
- Given an error occurs, when the script runs, then it is logged without stopping execution.

## 10. Testing Notes
- Objects in ID range update with equipment asset IDs.
- No results in range; script completes without updates.
- submitFields errors logged.

## 11. Deployment Notes
- Remove or parameterize the ID range for production.
- Upload `hul_populate_nxc_equipment_asset_on_object_mr.js`.
- Create Map/Reduce script record.
- Run in sandbox and validate updates.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the object ID range be removed for production?
- Should the asset type filter be configurable?
- Risk: ID range left in place (Mitigation: Parameterize before production)
- Risk: Incorrect asset-object mapping (Mitigation: Validate join and sample records)

---
