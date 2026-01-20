# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateCustAddress
title: Create Customer Address from Site Asset (Map/Reduce)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sn_hul_mr_createcustaddress.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer
  - Site Asset (customrecord_nx_asset)
  - Location

---

## 1. Overview
A Map/Reduce script that creates customer address book entries from site asset records.

---

## 2. Business Goal
Automate customer address creation based on site asset address text and link the address back to the asset.

---

## 3. User Story
As an admin, when site assets are missing customer addresses, I want addresses created from site assets, so that customer records stay in sync.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Map/Reduce run | custrecord_nx_asset_address_text | asset returned by `customsearch_sna_no_address_site_asset_u` | Create customer address and update asset with address ID |

---

## 5. Functional Requirements
- Load assets from saved search `customsearch_sna_no_address_site_asset_u`.
- Parse address text into address lines, city, state, zip, and country.
- Add a customer address book entry and tag it with the asset.
- Skip addresses that match excluded locations specified by `custscript_sn_locations_to_exclude`.
- Update the site asset with the new address internal ID.

---

## 6. Data Contract
### Record Types Involved
- Customer
- Site Asset (customrecord_nx_asset)
- Location

### Fields Referenced
- Site Asset | custrecord_nx_asset_customer
- Site Asset | custrecord_nx_asset_address_text
- Site Asset | custrecord_nx_asset_address
- Address | custrecordsn_nxc_site_asset
- Address | custrecord_sn_autocreate_asset
- Script parameter | custscript_sn_locations_to_exclude

Schemas (if known):
- Saved search: customsearch_sna_no_address_site_asset_u

---

## 7. Validation & Edge Cases
- Address matches excluded locations; no address created.
- Address text missing or malformed; skip or incomplete results.
- Address parsing assumes US formatting.

---

## 8. Implementation Notes (Optional)
- Excluded locations are derived from location records.
- Performance/governance considerations: record load/save operations per asset.

---

## 9. Acceptance Criteria
- Given an eligible asset, when the Map/Reduce runs, then a customer address book entry is created.
- Given an eligible asset, when the Map/Reduce runs, then the site asset is updated with the new address ID.
- Given an address matches excluded locations, when the Map/Reduce runs, then no address is added.

---

## 10. Testing Notes
- Asset with valid address text; confirm address created.
- Address matches excluded locations; confirm no address created.
- Address text missing or malformed; confirm skipped or incomplete results.

---

## 11. Deployment Notes
- Upload `sn_hul_mr_createcustaddress.js`.
- Ensure saved search and excluded location parameter exist.
- Deploy and run the Map/Reduce script.
- Rollback: disable the Map/Reduce deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should address parsing be moved to a shared utility?
- Risk: Address parsing fails for non-standard formats.
- Risk: Exclusion list is missing or invalid.

---
