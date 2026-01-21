# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VendorPrice
title: Validate Vendor Price Uniqueness
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_vendorprice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_vendorprice

---

## 1. Overview
Validates vendor price records to prevent duplicate item-vendor combinations and multiple primary vendors per item.

---

## 2. Business Goal
Maintain consistent, unambiguous vendor pricing data per item.

---

## 3. User Story
As a procurement admin, when I save a vendor price record, I want duplicates and multiple primary vendors blocked so that pricing data stays clean.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | custrecord_sna_hul_item, custrecord_sna_hul_vendor | create/edit | Search for existing item-vendor duplicates and block save if found. |
| beforeSubmit | custrecord_sna_hul_primaryvendor | create/edit, primary true | Block save if another record for the item is already primary. |

---

## 5. Functional Requirements
- On beforeSubmit, read item, vendor, and primary vendor fields.
- Search for other vendor price records with the same item and vendor, excluding the current record.
- If a duplicate item-vendor record exists, throw an error.
- If another record for the item is already primary and the current record is primary, throw an error.

---

## 6. Data Contract
### Record Types Involved
- Custom record: customrecord_sna_hul_vendorprice

### Fields Referenced
- Vendor Price | custrecord_sna_hul_item | Item
- Vendor Price | custrecord_sna_hul_vendor | Vendor
- Vendor Price | custrecord_sna_hul_primaryvendor | Primary vendor

Schemas (if known):
- Custom record | customrecord_sna_hul_vendorprice | Vendor pricing

---

## 7. Validation & Edge Cases
- Exclude the current record id when checking for duplicates on edit.
- Consider whether inactive records should be included in duplicate checks.

---

## 8. Implementation Notes (Optional)
- Uses a search to evaluate duplicates and primary vendor rules.

---

## 9. Acceptance Criteria
- Given an existing item-vendor record, when a duplicate is saved, then the save is blocked with an error.
- Given an existing primary vendor for an item, when another primary is saved, then the save is blocked.

---

## 10. Testing Notes
- Create a vendor price record with unique item-vendor and verify save.
- Attempt to create a duplicate item-vendor record and verify error.
- Attempt to create a second primary vendor for the same item and verify error.

---

## 11. Deployment Notes
- Deploy the user event to `customrecord_sna_hul_vendorprice`.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should duplicates be checked for inactive vendor price records?

---
