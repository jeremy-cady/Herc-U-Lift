# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CallAssetDisposal
title: Call Asset Disposal
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_callassetdisposal.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemfulfillment
  - customrecord_ncfar_asset
  - customrecord_fam_process

---

## 1. Overview
User Event that triggers FAM disposal processing when an Item Fulfillment reaches shipped status.

---

## 2. Business Goal
Automate asset disposal for fulfilled assets and their components without manual processing.

---

## 3. User Story
As a finance user, when an item fulfillment reaches shipped status, I want assets disposed automatically, so that asset records stay accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Item Fulfillment lines | create/edit (excluding delete) and shipstatus is "C" (shipped) | Create FAM process record and trigger disposal |

---

## 5. Functional Requirements
- Run afterSubmit on Item Fulfillment create/edit (excluding delete).
- Identify lines that are received, fixed-asset eligible, not disposed, and not customer-owned.
- Include component assets when parent assets have components.
- Create a FAM Process record with disposal parameters and SNA parameters.
- Invoke the FAM trigger process suitelet to start disposal.

---

## 6. Data Contract
### Record Types Involved
- itemfulfillment
- customrecord_ncfar_asset
- customrecord_fam_process

### Fields Referenced
- itemfulfillment line | custcol_sna_hul_is_fa_form | Fixed asset flag
- itemfulfillment line | custcol_sna_asset_status | Asset status
- itemfulfillment line | custcol_sna_cust_owned | Customer-owned flag
- itemfulfillment line | custcol_sna_fam_obj | FAM asset reference
- itemfulfillment line | custcol_sna_loc_asset | Asset location
- itemfulfillment line | custcol_sna_hul_fleet_no | Fleet number
- customrecord_ncfar_asset | custrecord_componentof | Component parent
- customrecord_ncfar_asset | custrecord_assetstatus | Asset status
- customrecord_ncfar_asset | custrecord_sna_customer_owned | Customer-owned flag
- customrecord_fam_process | custrecord_fam_procid | Process ID
- customrecord_fam_process | custrecord_fam_procparams | Process params
- customrecord_fam_process | custrecord_fam_procstateval | State values
- customrecord_fam_process | custrecord_sna_fa_snaparams | SNA params
- customrecord_fam_process | custrecord_sna_fam_if | Item fulfillment reference

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer-owned or disposed assets are ignored.
- Assets with components create disposal for all components.
- FAM process creation failures are logged.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: Multiple searches for asset components; moderate on large fulfillments.

---

## 9. Acceptance Criteria
- Given an Item Fulfillment with eligible asset lines, when afterSubmit runs, then a FAM Process record is created and the trigger suitelet is called.
- Given assets with components, when disposal is triggered, then component assets are included.

---

## 10. Testing Notes
- Item Fulfillment with eligible asset line triggers disposal process.
- Customer-owned or disposed assets are ignored.
- Assets with components create disposal for all components.
- Ensure FAM bundle is installed and trigger suitelet is available.

---

## 11. Deployment Notes
- Confirm FAM trigger suitelet deployment IDs.
- Deploy User Event on Item Fulfillment and validate disposal process creation.
- Monitor FAM process queue; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should disposal trigger on partial fulfillments?

---
