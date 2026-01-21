# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CustomerSiteAsset
title: Customer Site Asset Auto-Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_customersiteasset.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customer
  - customrecord_nx_asset
  - customrecord_sna_sales_zone
  - location

---

## 1. Overview
User Event that creates or links NXC Site Asset records for customer addresses and writes the asset link back to the addressbook.

---

## 2. Business Goal
Keep customer addresses synced to site asset records without manual creation.

---

## 3. User Story
As a customer admin, when I update a customer with auto-create addresses, I want site assets created or linked automatically, so that site assets are always available.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Customer addressbook | create/edit (non-delete) | Create/update site assets and link back to addressbook |

---

## 5. Functional Requirements
- Run afterSubmit on Customer create/edit (non-delete).
- Collect customer addressbook entries and normalize addresses.
- Create NXC Site Assets for addresses flagged for auto-create and not excluded.
- Update existing site assets with address ID and address text.
- Write the site asset ID back to the customer addressbook subrecord.

---

## 6. Data Contract
### Record Types Involved
- customer
- customrecord_nx_asset
- customrecord_sna_sales_zone
- location

### Fields Referenced
- addressbookaddress | custrecordsn_nxc_site_asset | Site asset reference
- addressbookaddress | custrecord_sn_autocreate_asset | Auto-create flag
- customrecord_nx_asset | custrecord_nxc_na_asset_type | Asset type
- customrecord_nx_asset | custrecord_nx_asset_customer | Customer
- customrecord_nx_asset | custrecord_nx_asset_address | Address reference
- customrecord_nx_asset | custrecord_nx_asset_address_text | Address text
- customrecord_nx_asset | custrecord_nx_asset_region | Region

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Excluded location addresses are skipped.
- Duplicate addresses do not create duplicate site assets.
- Asset creation errors are logged.
- Excluded location IDs provided via script parameter `custscript_sn_locations_to_exclude`.

---

## 8. Implementation Notes (Optional)
- Zip-to-region lookup via `customrecord_sna_sales_zone`.
- Performance/governance considerations: Address and asset searches can scale with address count.

---

## 9. Acceptance Criteria
- Given eligible customer addresses, when afterSubmit runs, then site assets are created or linked.
- Given addressbook entries linked to site assets, when afterSubmit runs, then addressbook subrecords store the site asset IDs.
- Given excluded locations, when afterSubmit runs, then no site assets are created for them.

---

## 10. Testing Notes
- Customer address with auto-create flag generates site asset and links address.
- Excluded location addresses are skipped.
- Duplicate addresses do not create duplicate site assets.
- Deploy User Event on Customer.

---

## 11. Deployment Notes
- Configure script parameters for site form/type and excluded locations.
- Deploy User Event on Customer and validate addressbook updates and site asset creation.
- Monitor logs for address matching errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should site assets be deleted if addresses are removed?

---
