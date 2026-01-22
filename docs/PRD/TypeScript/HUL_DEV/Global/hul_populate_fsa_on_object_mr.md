# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_populate_fsa_on_object_mr
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: TypeScript/HUL_DEV/Global/hul_populate_fsa_on_object_mr.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce script that populates a Field Service Asset reference on Object records based on existing FSA → Object relationships.

---

## 2. Business Goal
Populate Object records with their associated Field Service Asset references.

---

## 3. User Story
As a user, when the Map/Reduce runs, I want Object records updated with their Field Service Asset reference, so that relationships are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce execution | custrecord_hul_field_service_asset | FSA asset type is '2' and linked Object ID exists | Write FSA ID to Object field |

---

## 5. Functional Requirements
- getInputData: SuiteQL query for all FSA records where custrecord_nxc_na_asset_type = '2'.
- map: For each FSA ID, query its linked Object ID and write FSA → Object.
- reduce: Write the FSA ID into the Object record field custrecord_hul_field_service_asset.
- summarize: No active logic (placeholder).
- Log errors and continue without rethrowing.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset (Field Service Asset)
- customrecord_sna_objects (Object)

### Fields Referenced
- customrecord_nx_asset.custrecord_nxc_na_asset_type
- customrecord_nx_asset.custrecord_sna_hul_nxcassetobject
- customrecord_sna_objects.custrecord_hul_field_service_asset

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SQL join includes a space before custrecord_sna_hul_nxcassetobject; confirm it resolves correctly.
- map writes ctx.write(fsaID, objectID) while reduce parses values as JSON.

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
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
