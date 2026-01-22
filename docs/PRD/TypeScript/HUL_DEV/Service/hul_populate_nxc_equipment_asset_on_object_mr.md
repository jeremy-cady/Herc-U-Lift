# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_nxc_equipment_asset_on_object_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Service/hul_populate_nxc_equipment_asset_on_object_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce that backfills equipment asset IDs onto equipment object records for a specific object ID range.

---

## 2. Business Goal
Populate equipment objects with their related equipment asset IDs.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want equipment objects in the target range updated with asset IDs, so that relationships are stored on the object.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_hul_nxcequipasset | Asset type is 2 and object ID in range | Write asset ID to object record |

---

## 5. Functional Requirements
- getInputData: SuiteQL query joining equipment assets to objects where:
  - Asset type = 2
  - Object ID range: 1253190000 < id <= 1253192000
- map: Emit asset/object pairs keyed by asset ID.
- reduce: Write asset ID to object record (customrecord_sna_objects) field custrecord_hul_nxcequipasset.
- summarize: No custom logic.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- customrecord_sna_objects

### Fields Referenced
- Asset type field (ID TBD)
- custrecord_hul_nxcequipasset

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Object ID range is hardcoded.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Asset type field ID
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
