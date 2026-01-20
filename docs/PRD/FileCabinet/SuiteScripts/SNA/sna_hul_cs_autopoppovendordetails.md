# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AutoPopPOVendor
title: Auto-Populate PO Vendor Details (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_autopoppovendordetails.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item
  - Custom Item Vendor record (`CUSTRECORD_SNA_HUL_ITEM`)

---

## 1. Overview
A client script that automatically populates PO vendor and PO rate fields on item lines based on primary vendor configuration.

## 2. Business Goal
Reduces manual data entry by pulling vendor and purchase price information when items are selected.

## 3. User Story
As a buyer, when I select an item, I want PO vendor details auto-filled, so that I can save time.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | `item` | Item line field changes | Populate `povendor`, `custcol_sna_csi_povendor`, and `porate` |
| fieldChanged | `povendor` | Item line field changes | Sync `custcol_sna_csi_povendor` |

## 5. Functional Requirements
- The system must run on `fieldChanged` for item sublist fields.
- When `item` changes, the system must search the item vendor custom record for the primary vendor.
- If a primary vendor is found, the system must set `povendor`, `custcol_sna_csi_povendor`, and `porate` from `custrecord_sna_hul_itempurchaseprice`.
- When `povendor` changes, the system must sync `custcol_sna_csi_povendor` to the same value.

## 6. Data Contract
### Record Types Involved
- Item
- Custom Item Vendor record (`CUSTRECORD_SNA_HUL_ITEM`)

### Fields Referenced
- Line | `povendor`
- Line | `custcol_sna_csi_povendor`
- Custom Item Vendor | `custrecord_sna_hul_vendor`
- Custom Item Vendor | `custrecord_sna_hul_itempurchaseprice`
- Custom Item Vendor | `custrecord_sna_hul_primaryvendor`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Item has no primary vendor record; no fields set.
- Search promise rejects; log error in console.

## 8. Implementation Notes (Optional)
- Uses `search.create.promise` for async item vendor lookup.

## 9. Acceptance Criteria
- Given an item with a primary vendor, when the item is selected, then PO vendor fields auto-populate.
- Given a primary vendor, when the item is selected, then PO rate is set from item purchase price.
- Given `povendor` changes, when the field changes, then `custcol_sna_csi_povendor` updates.

## 10. Testing Notes
- Select an item with a primary vendor; fields populate.
- Item has no primary vendor record; no fields set.
- Search promise rejects; log error in console.

## 11. Deployment Notes
- Upload `sna_hul_cs_autopoppovendordetails.js`.
- Deploy to transaction forms.
- Validate vendor auto-population.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should PO rate consider contract pricing or quantity breaks?
- Should the script run on `postSourcing` as well as `fieldChanged`?
- Risk: Missing vendor records cause no defaults (Mitigation: Validate item vendor data)
- Risk: Client-side search impacts performance (Mitigation: Cache results per item)

---
