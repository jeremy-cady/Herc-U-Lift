# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateAssetReturn
title: Create Asset on Item Receipt
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_createassetreturn.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemreceipt
  - purchaseorder
  - returnauthorization
  - customrecord_ncfar_asset
  - customrecord_sna_objects

---

## 1. Overview
User Event that creates a new fixed asset when an Item Receipt is created from a PO or Return Authorization and links it to the fleet object.

---

## 2. Business Goal
Automate creation of HUL-owned fixed assets for received items and update related fleet/object records.

---

## 3. User Story
As a finance user, when an Item Receipt is created from a PO or Return Authorization, I want fixed assets created automatically, so that asset records remain accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Item Receipt lines | create only; line has itemreceive, `custcol_sna_hul_is_fa_form`, and fleet number | Create fixed asset, update fleet object, inactivate prior customer-owned asset |

---

## 5. Functional Requirements
- Run afterSubmit on Item Receipt create only.
- Process lines with `itemreceive` and `custcol_sna_hul_is_fa_form` and a fleet number.
- Load the created-from transaction (PO/RA) to determine line costs.
- Create a `customrecord_ncfar_asset` with derived values and set ownership to HUL.
- Update the fleet object record with the new fixed asset and status.
- Inactivate the prior customer-owned fixed asset linked to the fleet.

---

## 6. Data Contract
### Record Types Involved
- itemreceipt
- purchaseorder
- returnauthorization
- customrecord_ncfar_asset
- customrecord_sna_objects

### Fields Referenced
- itemreceipt | createdfrom | Source transaction
- itemreceipt | custbody_sna_hul_object_subsidiary | Object subsidiary
- itemreceipt line | custcol_sna_hul_fleet_no | Fleet object
- itemreceipt line | custcol_sna_fam_obj | Fixed asset reference
- itemreceipt line | custcol_sna_hul_is_fa_form | Fixed asset flag
- purchaseorder line | custcol_sna_po_fleet_code | Fleet code
- customrecord_ncfar_asset | custrecord_assettype | Asset type
- customrecord_ncfar_asset | custrecord_assetcost | Asset cost
- customrecord_ncfar_asset | custrecord_assetsubsidiary | Subsidiary
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_ncfar_asset | custrecord_sna_object | Fleet object
- customrecord_ncfar_asset | custrecord_sna_hul_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_fixed_asset | Fixed asset reference
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_owning_loc_code | Owning location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Lines without fleet or FA flag are ignored.
- Asset creation failures are logged.
- Only runs on create and only for PO/RA created receipts.

---

## 8. Implementation Notes (Optional)
- Script parameters for posting status and depreciation method IDs.
- Performance/governance considerations: Multiple record loads and saves; fleet asset search per receipt.

---

## 9. Acceptance Criteria
- Given an Item Receipt from PO/RA with qualifying lines, when afterSubmit runs, then a new fixed asset is created and linked to the fleet object.
- Given a fleet with a prior customer-owned fixed asset, when afterSubmit runs, then the prior asset is inactivated.

---

## 10. Testing Notes
- Item Receipt from PO with fleet line creates new fixed asset and updates object.
- Lines without fleet or FA flag are ignored.
- Deploy User Event on Item Receipt.

---

## 11. Deployment Notes
- Configure script parameters for posting status and depreciation method.
- Deploy User Event on Item Receipt and validate asset creation and fleet updates.
- Monitor logs for asset creation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should receipt edits trigger recalculation or updates?

---
