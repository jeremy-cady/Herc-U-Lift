# PRD: Populate Field Service Asset on Objects (Map/Reduce)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopulateFSAOnObjectsMR
title: Populate Field Service Asset on Objects (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_populate_fsa_on_object_mr.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects

---

## 1. Overview
A Map/Reduce that backfills the Field Service Asset (FSA) link onto object records by scanning FSA assets and applying the related object reference.

---

## 2. Business Goal
Objects need a reliable reference to their associated FSA asset; this script populates that field in bulk.

---

## 3. User Story
- As an admin, I want to backfill FSA references on objects so that object records are properly linked.
- As a support user, I want to see the correct FSA on an object so that I can navigate between records.
- As an operator, I want bulk processing so that updates complete without manual edits.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_nxc_na_asset_type, custrecord_sna_hul_nxcassetobject, custrecord_hul_field_service_asset | Asset type = 2 and related object link present | Update object custrecord_hul_field_service_asset to FSA ID |

---

## 5. Functional Requirements
- The system must query customrecord_nx_asset where custrecord_nxc_na_asset_type = '2'.
- The system must return an array of FSA asset IDs for processing.
- For each FSA asset, the system must look up its related object record via custrecord_sna_hul_nxcassetobject.
- The system must update the related object record, setting custrecord_hul_field_service_asset to the FSA ID.
- Updates must use submitFields with ignoreMandatoryFields enabled.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- customrecord_sna_objects

### Fields Referenced
- custrecord_nxc_na_asset_type
- custrecord_sna_hul_nxcassetobject
- custrecord_hul_field_service_asset

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Asset with no related object link is skipped or logs an error.
- Object record inactive or inaccessible.
- Duplicate assets referencing the same object.
- SuiteQL query failure logs an error in getInputData.
- submitFields failure logs an error in setFSAOnObjectRecord.

---

## 8. Implementation Notes (Optional)
- Map/Reduce paging used to limit SuiteQL result sets (page size 1000).

---

## 9. Acceptance Criteria
- Given assets of type 2, when processed, then only those assets are processed.
- Given an asset with a related object, when processed, then the object is updated with custrecord_hul_field_service_asset.
- Given lookup or update failures, when they occur, then errors are logged.

---

## 10. Testing Notes
- Process assets of type 2 with valid object links and confirm object updates.
- Verify assets without object links are skipped or logged.
- Verify submitFields failures are logged.

---

## 11. Deployment Notes
- Upload hul_populate_fsa_on_object_mr.js and create Map/Reduce script record.
- Execute in sandbox with sample data.
- Deploy to production and run.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Should assets without an object link be reported or tracked separately?
- Should this script run on a schedule or be one-time only?
- Is the asset type filter ('2') always the correct definition of FSA?
- Missing object links.
- Incorrect asset type filter.

---
