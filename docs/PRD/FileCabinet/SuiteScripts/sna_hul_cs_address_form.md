# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AddressFormCS
title: Address Form Pricing Group Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_address_form.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer (address subrecord)
  - Sales Zone (customrecord_sna_sales_zone)

---

## 1. Overview
A client script that sets customer pricing group fields on address records based on the address ZIP code and customer.

---

## 2. Business Goal
Automate population of service and parts pricing group fields on customer address records.

---

## 3. User Story
As an admin, when editing customer addresses, I want pricing groups set automatically, so that address pricing stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custrecord_sna_cpg_parts | field empty | Look up customer address entry and set parts pricing group |
| fieldChanged | zip | ZIP changed | Look up sales zone and set service pricing group |

---

## 5. Functional Requirements
- On pageInit, if `custrecord_sna_cpg_parts` is empty, look up the customer address entry and set it.
- On ZIP change, look up the Sales Zone and set `custrecord_sna_cpg_service`.

---

## 6. Data Contract
### Record Types Involved
- Customer (address subrecord)
- Sales Zone (customrecord_sna_sales_zone)

### Fields Referenced
- Address | custrecord_sna_cpg_parts
- Address | custrecord_sna_cpg_service
- Address | zip

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- ZIP not found in Sales Zone; service pricing group remains blank.

---

## 8. Implementation Notes (Optional)
- Address internal ID matching depends on customer address sublist search.
- Performance/governance considerations: client-side search on pageInit and ZIP change.

---

## 9. Acceptance Criteria
- Given an address with missing parts pricing group, when the form loads, then parts pricing group is set.
- Given ZIP changes, when the user updates the field, then service pricing group updates.

---

## 10. Testing Notes
- Open address without parts pricing group; confirm value is populated.
- Change ZIP; confirm service pricing group updates.
- ZIP not found; confirm service pricing group remains blank.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_address_form.js`.
- Deploy on address form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should ZIP lookup support extended ZIP formats?
- Risk: Sales zone data missing.

---
