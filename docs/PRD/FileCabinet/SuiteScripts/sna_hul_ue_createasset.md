# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateAssetFromFAMProcess
title: Create FAM Asset from Disposal Process
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_createasset.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_fam_process
  - itemfulfillment
  - salesorder
  - customrecord_ncfar_asset
  - customrecord_sna_objects

---

## 1. Overview
User Event that creates customer-owned FAM assets after a disposal process completes and updates related object records.

---

## 2. Business Goal
Ensure fixed asset records are created and linked when disposal processes complete for customer-owned assets.

---

## 3. User Story
As a finance user, when a disposal process completes for a customer-owned asset, I want fixed assets created automatically, so that asset tracking stays accurate after disposal.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | FAM Process fields | not delete; process completed and process ID is "disposal" | Create new asset and update related object records |

---

## 5. Functional Requirements
- Run afterSubmit on FAM Process records (excluding delete).
- Confirm process completion and that process ID is "disposal".
- Load the related Item Fulfillment and Sales Order to retrieve line details.
- Create a new `customrecord_ncfar_asset` when the original asset status is disposed.
- Update related object records with fixed asset references and ownership/status fields.

---

## 6. Data Contract
### Record Types Involved
- customrecord_fam_process
- itemfulfillment
- salesorder
- customrecord_ncfar_asset
- customrecord_sna_objects

### Fields Referenced
- customrecord_fam_process | custrecord_fam_procstatus | Process status
- customrecord_fam_process | custrecord_fam_procid | Process ID
- customrecord_fam_process | custrecord_fam_procstateval | Process state values
- customrecord_fam_process | custrecord_fam_proctotstages | Total stages
- customrecord_fam_process | custrecord_sna_fa_snaparams | SNA params
- customrecord_fam_process | custrecord_sna_fam_if | Item fulfillment reference
- itemfulfillment | createdfrom | Source Sales Order
- itemfulfillment | trandate | Fulfillment date
- itemfulfillment | shipaddress | Shipping address
- itemfulfillment | department | Department
- itemfulfillment | class | Class
- itemfulfillment | location | Location
- salesorder | custbody_sna_hul_object_subsidiary | Object subsidiary
- salesorder line | custcol_sna_hul_fleet_no | Fleet object
- salesorder line | custcol_sna_asset_status | Asset status
- salesorder line | custcol_sna_fam_obj | FAM object
- customrecord_ncfar_asset | altname | Asset name
- customrecord_ncfar_asset | custrecord_assettype | Asset type
- customrecord_ncfar_asset | custrecord_assetaccmethod | Depreciation method
- customrecord_ncfar_asset | custrecord_assetlifetime | Lifetime
- customrecord_ncfar_asset | custrecord_assetlifeunits | Lifetime units
- customrecord_ncfar_asset | custrecord_assetcost | Asset cost
- customrecord_ncfar_asset | custrecord_assetstatus | Asset status
- customrecord_ncfar_asset | custrecord_assetsubsidiary | Subsidiary
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_ncfar_asset | custrecord_sna_object | Object reference
- customrecord_sna_objects | custrecord_sna_fixed_asset | Fixed asset reference
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_customer_name | Customer
- customrecord_sna_objects | custrecord_sna_current_address | Current address
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Non-completed process does not create assets.
- Missing snaparams skips asset creation.
- Record creation errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses script parameters for posting status and depreciation method IDs.
- Performance/governance considerations: Multiple record loads and saves.

---

## 9. Acceptance Criteria
- Given a completed disposal process, when afterSubmit runs, then a customer-owned FAM asset is created.
- Given a completed disposal process, when afterSubmit runs, then related object records are updated with fixed asset references.

---

## 10. Testing Notes
- Completed disposal process creates customer-owned FAM asset.
- Non-completed process does not create assets.
- Missing snaparams skips asset creation.
- Deploy User Event on customrecord_fam_process.

---

## 11. Deployment Notes
- Confirm script parameters for posting status and depreciation method.
- Deploy User Event on FAM Process records and validate asset creation on completed disposal processes.
- Monitor logs for asset creation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should asset creation occur for non-disposed asset statuses?

---
