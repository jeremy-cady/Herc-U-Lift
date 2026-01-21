# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RequisitionWorksheet
title: Requisition Worksheet
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_requisition_worksheet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_vendorprice
  - transaction
  - location

---

## 1. Overview
Suitelet that provides a requisition worksheet UI to create purchasing data and vendor pricing context.

---

## 2. Business Goal
Centralizes item, vendor, and location data so users can build requisitions with accurate pricing and vendor info.

---

## 3. User Story
- As a buyer, when I view vendor pricing, I want to choose the best supplier, so that purchasing is optimized.
- As a buyer, when I build requisitions based on SO demand, I want ordering aligned, so that inventory is available.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | filters, line context | Worksheet opened | Display vendor pricing and requisition context |

---

## 5. Functional Requirements
- Load vendor pricing records from `customrecord_sna_hul_vendorprice`.
- Parse quantity break pricing JSON when present.
- Provide vendor lists and primary vendor data for items.
- Check whether SO lines already created POs.
- Support shipping method handling for transfer items.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_vendorprice
- transaction
- location

### Fields Referenced
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_item | Item
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_vendor | Vendor
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_itempurchaseprice | Purchase price
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_contractprice | Contract price
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_qtybreakprices | Quantity break prices
- customrecord_sna_hul_vendorprice | custrecord_sna_vendor_item_name2 | Vendor item name

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing quantity price JSON returns empty array.
- No vendor records returns empty lists.
- SuiteQL query failures are logged.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple searches and SuiteQL.

---

## 9. Acceptance Criteria
- Given vendor pricing data, when the Suitelet runs, then data is loaded and parsed correctly.
- Given vendor lists, when the Suitelet runs, then primary vendor flags are included.
- Given SO lines, when the Suitelet runs, then PO checks return line details.

---

## 10. Testing Notes
Manual tests:
- Items display vendor pricing and primary vendor data.
- Missing quantity price JSON returns empty array.
- No vendor records returns empty lists.
- SuiteQL query failures are logged.

---

## 11. Deployment Notes
- Confirm vendor price records are populated.
- Deploy Suitelet.
- Provide access to purchasing users.

---

## 12. Open Questions / TBDs
- Should vendor pricing be cached for performance?

---
