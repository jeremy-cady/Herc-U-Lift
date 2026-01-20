# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateVendorPriceSL
title: Create Vendor Price Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_createvendorprice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

---

## 1. Overview
A Suitelet that creates vendor price custom records based on parameters passed in the request.

## 2. Business Goal
Allows client or server processes to create vendor pricing records on demand for items and vendors.

## 3. User Story
As a buyer, when I need vendor price records created automatically, I want vendor price records created automatically, so that pricing stays current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | `itm`, `itm_txt`, `buyFromVendor`, `rate` | Suitelet request | Create vendor price record and return record ID |

## 5. Functional Requirements
- The system must read request parameters `itm`, `itm_txt`, `buyFromVendor`, and `rate`.
- The system must create a `customrecord_sna_hul_vendorprice` record.
- The system must set `custrecord_sna_hul_item` to `itm`, `custrecord_sna_hul_vendor` to `buyFromVendor`, and `custrecord_sna_hul_itempurchaseprice` to `rate` (or 0).
- If `rate` is empty, the system must set `custrecord_sna_hul_primaryvendor` to true.
- The system must return the new vendor price record ID in the response.

## 6. Data Contract
### Record Types Involved
- Custom Vendor Price (`customrecord_sna_hul_vendorprice`)

### Fields Referenced
- `custrecord_sna_hul_item`
- `custrecord_sna_hul_vendor`
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_primaryvendor`
- Request parameters: `itm`, `itm_txt`, `buyFromVendor`, `rate`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing rate; primary vendor flag set.
- Missing item or vendor; error returned.
- Record save fails; error returned in response.

## 8. Implementation Notes (Optional)
- Uses SuiteScript 2.1 and record.create/save.

## 9. Acceptance Criteria
- Given valid parameters, when the Suitelet runs, then a vendor price record is created with item and vendor values.
- Given a missing rate, when the Suitelet runs, then the rate is set to 0 and primary vendor is set to true.
- Given a successful create, when the Suitelet runs, then the response contains the new record ID.

## 10. Testing Notes
- Call Suitelet with valid parameters; record ID returned.
- Missing rate; primary vendor flag set.
- Missing item or vendor; error returned.
- Record save fails; error returned in response.

## 11. Deployment Notes
- Upload `sna_hul_sl_createvendorprice.js`.
- Deploy the Suitelet with appropriate permissions.
- Validate record creation via test calls.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should this Suitelet validate vendor/item existence before creation?
- Should duplicates be prevented by checking for existing records?
- Risk: Duplicate vendor price records (Mitigation: Add pre-checks or unique constraints)
- Risk: Missing parameters create invalid records (Mitigation: Validate request parameters)

---
