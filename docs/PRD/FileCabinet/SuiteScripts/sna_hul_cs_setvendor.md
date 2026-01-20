# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SetVendor
title: Set Vendor Defaults on Purchase Orders Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_setvendor.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Vendor
  - Employee

---

## 1. Overview
A client script that sets default vendor, buy-from vendor, employee, location, and department values on Purchase Orders.

---

## 2. Business Goal
Standardize PO header and line defaults based on form, user, and vendor configuration.

---

## 3. User Story
As a buyer, when I create POs, I want defaults set automatically, so that I can create POs faster.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | employee, custbody_po_type | create mode | Set employee and PO type defaults |
| fieldChanged | custbody_sna_buy_from | vendor changed | Set entity to parent vendor or same vendor |
| postSourcing | item | item selected | Set line department and location from header and form rules |

---

## 5. Functional Requirements
- On create, set `employee` to the current user.
- On create, set `custbody_po_type` based on special order or dropship context.
- If a parent vendor exists, set `entity` to the parent vendor and `custbody_sna_buy_from` to the original vendor.
- When `custbody_sna_buy_from` changes, update `entity` to the parent vendor or the same vendor.
- On item line selection, set line `location` and `department` based on header values and form rules.
- On post sourcing (create only), set department and location defaults based on the PO form and employee location.

---

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Vendor
- Employee

### Fields Referenced
- Header | employee
- Header | custbody_po_type
- Header | custbody_sna_buy_from
- Header | custbody_sna_hul_orderid
- Header | specord
- Header | dropshipso
- Header | customform
- Header | department
- Header | location
- Vendor | custentity_sna_parent_vendor
- Line | item
- Line | department
- Line | location

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Vendor has no parent; `entity` stays as vendor.
- Vendor lookup fails; retain original vendor values.

---

## 8. Implementation Notes (Optional)
- Uses form IDs 108 and 130 to set department rules.

---

## 9. Acceptance Criteria
- Given a new PO, when created, then header fields default correctly.
- Given a vendor with parent, when selected, then Pay To Vendor and Buy From Vendor fields update.
- Given item selection, when sourced, then line location and department defaults apply.

---

## 10. Testing Notes
- Create a PO and verify employee, PO type, and vendor defaults.
- Add an item line and verify line location and department.
- Vendor has no parent; verify `entity` stays as vendor.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_setvendor.js`.
- Deploy to Purchase Order forms.
- Rollback: remove client script deployment from PO forms.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should form IDs be parameterized instead of hard-coded?
- Risk: Form IDs change across environments.

---
