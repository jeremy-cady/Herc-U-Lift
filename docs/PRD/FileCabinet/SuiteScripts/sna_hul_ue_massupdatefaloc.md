# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-MassUpdateFALoc
title: Fixed Asset Location Mass Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_ue_massupdatefaloc.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_ncfar_asset
  - customrecord_sna_objects

---

## 1. Overview
Map/Reduce script that updates fixed asset locations to match the owning location code on related object records.

---

## 2. Business Goal
Ensure fixed asset location values stay aligned with object owning locations.

---

## 3. User Story
As a finance user, when asset locations need alignment, I want a bulk update to apply owning locations, so that reporting remains accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| map/reduce | Saved search results | `customsearch_sna_hul_assetlocmatch` results | Update asset location from object owning location |

---

## 5. Functional Requirements
- Load input data from `customsearch_sna_hul_assetlocmatch`.
- For each result, set `custrecord_assetlocation` on `customrecord_ncfar_asset` to the object owning location.
- Log errors and summarize stage results.

---

## 6. Data Contract
### Record Types Involved
- customrecord_ncfar_asset
- customrecord_sna_objects

### Fields Referenced
- customrecord_ncfar_asset | custrecord_assetlocation | Asset location
- customrecord_ncfar_asset | custrecord_sna_object | Object reference
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location code

Schemas (if known):
- Saved search: customsearch_sna_hul_assetlocmatch

---

## 7. Validation & Edge Cases
- Missing object or location values skip updates.
- Reduce stage errors logged in summarize.
- Input and output governed by the saved search results.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: submitFields per asset record; scope based on saved search.

---

## 9. Acceptance Criteria
- Given search results with assets and owning locations, when the Map/Reduce runs, then asset locations are updated to match owning locations.
- Given errors during reduce, when summarize runs, then errors are logged.

---

## 10. Testing Notes
- Run script and verify asset location updates.
- Missing object or location values skip updates.
- Run Map/Reduce in sandbox with saved search populated.

---

## 11. Deployment Notes
- Confirm saved search `customsearch_sna_hul_assetlocmatch`.
- Deploy Map/Reduce script and execute against test dataset.
- Review logs for errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the script also update inactive assets?

---
