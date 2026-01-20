# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VendorPrice
title: Vendor Price Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_vendorprice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_sna_hul_vendorprice)

---

## 1. Overview
A client script that validates Item-Vendor combinations on Vendor Price custom records.

---

## 2. Business Goal
Prevent duplicate item-vendor entries and ensure only one primary vendor per item.

---

## 3. User Story
As an admin, when I save vendor price records, I want duplicates blocked, so that pricing data is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | custrecord_sna_hul_item, custrecord_sna_hul_vendor | duplicate exists | Block save with alert |
| saveRecord | custrecord_sna_hul_primaryvendor | primary vendor already exists | Block save with alert |

---

## 5. Functional Requirements
- On save, search for existing vendor price records with the same item.
- If a record with the same item and vendor exists, alert and block save.
- If a record with the same item already has primary vendor checked, block another primary vendor.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_sna_hul_vendorprice)

### Fields Referenced
- custrecord_sna_hul_item
- custrecord_sna_hul_vendor
- custrecord_sna_hul_primaryvendor

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Duplicate item-vendor pair; save blocked.
- Second primary vendor for same item; save blocked.
- Search error should not allow duplicates.

---

## 8. Implementation Notes (Optional)
- Client-side search on save.

---

## 9. Acceptance Criteria
- Given a duplicate item-vendor pair, when saving, then save is blocked.
- Given a second primary vendor for an item, when saving, then save is blocked.

---

## 10. Testing Notes
- Create a new vendor price record for a new item-vendor pair.
- Attempt duplicate item-vendor pair; save blocked.
- Attempt second primary vendor for same item; save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_vendorprice.js`.
- Deploy to vendor price custom record.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should inactive vendor price records be considered for duplicates?
- Risk: Duplicate check ignores inactive records.

---
