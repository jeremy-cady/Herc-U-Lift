# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetItemFromFleet
title: Set Item From Fleet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_setitemfromfleet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Fixed Asset (customrecord_ncfar_asset)

---

## 1. Overview
A client script that defaults the rental item when a fleet number is selected and populates fixed asset NBV.

---

## 2. Business Goal
Ensure item selection and fixed asset details are filled automatically on item lines.

---

## 3. User Story
As a user, when I select a fleet number, I want the rental item set automatically, so that I do not select it manually.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custcol_sna_hul_fleet_no | item empty | Set item to rental equipment item |
| postSourcing | custcol_sna_fam_obj | asset sourced | Set custcol_sna_hul_fa_nbv from asset |

---

## 5. Functional Requirements
- When `custcol_sna_hul_fleet_no` changes, set the line `item` to the rental equipment item from script parameters if empty.
- On post sourcing, when `custcol_sna_fam_obj` is set, load the fixed asset record and set `custcol_sna_hul_fa_nbv` to the asset book value.

---

## 6. Data Contract
### Record Types Involved
- Fixed Asset (customrecord_ncfar_asset)

### Fields Referenced
- Line | custcol_sna_hul_fleet_no
- Line | item
- Line | custcol_sna_fam_obj
- Line | custcol_sna_hul_fa_nbv

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Item already set; script does not override.
- Asset record missing; NBV remains blank.
- Asset load fails; line remains editable.

---

## 8. Implementation Notes (Optional)
- Uses script parameter `custscript_sna_rental_equipment`.

---

## 9. Acceptance Criteria
- Given fleet number selected and item blank, when changed, then item is set to the rental equipment item.
- Given asset sourced, when post sourcing runs, then NBV is populated from the asset record.

---

## 10. Testing Notes
- Set fleet number on empty item line; verify item defaults.
- Set fixed asset on line; verify NBV populates.
- Asset record missing; verify NBV stays blank.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_setitemfromfleet.js`.
- Deploy to relevant transaction forms.
- Rollback: remove client script deployment from forms.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should asset load be skipped when `custcol_sna_fam_obj` is not an asset record?
- Risk: Asset load slows line sourcing.

---
