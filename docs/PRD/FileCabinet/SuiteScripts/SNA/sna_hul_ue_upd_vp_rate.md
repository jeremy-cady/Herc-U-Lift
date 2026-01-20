# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UpdateVPRate
title: Update Vendor Price from Latest Vendor Bill (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_upd_vp_rate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Bill
  - Vendor Price (`customrecord_sna_hul_vendorprice`)

---

## 1. Overview
A User Event that updates vendor price purchase rates based on the latest vendor bill for a vendor/item combination.

## 2. Business Goal
Keeps vendor price records aligned with the most recent vendor bill rates.

## 3. User Story
As a purchasing user, when vendor bills are saved, I want vendor prices updated from bills, so that pricing stays current.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | TBD | Vendor Bill save (non-delete) | Update vendor price purchase rate and remarks |

## 5. Functional Requirements
- The system must run after submit for vendor bills (non-delete).
- The system must identify the vendor and items on the bill.
- The system must find the latest vendor bill for the vendor/items using search filters.
- If the current bill is the latest, the system must update vendor price `custrecord_sna_hul_itempurchaseprice`.
- The system must set `custrecord_sna_hul_remarks` to note the source transaction.

## 6. Data Contract
### Record Types Involved
- Vendor Bill
- Vendor Price (`customrecord_sna_hul_vendorprice`)

### Fields Referenced
- Vendor Bill | `custbody_sna_buy_from`
- Vendor Price | `custrecord_sna_hul_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_remarks`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Bill is not latest; no vendor price update.
- Vendor price record missing; no update occurs.
- Search or submitFields error is logged.

## 8. Implementation Notes (Optional)
- Filters exclude certain PO types and item types.

## 9. Acceptance Criteria
- Given the latest vendor bill is saved, when the script runs, then the vendor price record updates.
- Given a vendor bill that is not the latest, when the script runs, then no update occurs.
- Given a vendor price update, when the script runs, then remarks indicate the bill transaction number.

## 10. Testing Notes
- Save latest vendor bill and verify vendor price purchase rate updates.
- Bill is not latest; no vendor price update.
- Vendor price record missing; no update occurs.
- Search or submitFields error is logged.

## 11. Deployment Notes
- Upload `sna_hul_ue_upd_vp_rate.js`.
- Deploy User Event on Vendor Bill.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should updates include list price or contract price fields?
- Should updates run for additional item types?
- Risk: Latest bill selection per vendor/item is inaccurate (Mitigation: Refine search filters or use line-level logic)
- Risk: Vendor price missing prevents update (Mitigation: Create vendor price record if missing)

---
