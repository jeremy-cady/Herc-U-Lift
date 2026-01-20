# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CustomLocation
title: Custom Location and PO Rate Defaults (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_customlocation.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Item
  - Vendor Price (`customrecord_sna_hul_vendorprice`)

---

## 1. Overview
A User Event that sets transaction and line locations from a custom location field and defaults PO rates on sales orders created from another transaction.

## 2. Business Goal
Ensures locations are consistent and PO vendor rates are set based on primary vendor pricing when a sales order is created from another record.

## 3. User Story
As a sales user, when I create sales orders from another record, I want locations defaulted, so that I do not update each line manually.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | `custbody_sna_hul_location` | Not Map/Reduce context | Set header and line locations |
| beforeSubmit | `createdfrom` | Sales order create with createdfrom | Default PO vendor and PO rate |

## 5. Functional Requirements
- The system must set `location` from `custbody_sna_hul_location` on before submit.
- The system must set missing line locations to match the header location.
- On sales order create with `createdfrom`, the system must default `povendor` and `custcol_sna_csi_povendor` from vendor pricing.
- The system must calculate `porate` based on quantity break price, contract price, or item purchase price.
- The system must skip before submit logic when executing in Map/Reduce context.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Item
- Vendor Price (`customrecord_sna_hul_vendorprice`)

### Fields Referenced
- Transaction | `custbody_sna_hul_location`
- Line | `custcol_sna_csi_povendor`
- Line | `custcol_sna_hul_estimated_po_rate`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No `createdfrom` value; PO rate logic should not run.
- Vendor pricing missing; rate remains unchanged.
- Search errors are logged without blocking save.

## 8. Implementation Notes (Optional)
- Sales order logic runs only when `createdfrom` is populated.
- Vendor price logic relies on joined custom record data.

## 9. Acceptance Criteria
- Given a custom location field, when the record is saved, then header and line locations are set.
- Given a sales order created from another record, when the record is saved, then PO vendor and PO rate are populated.

## 10. Testing Notes
- Create sales order from another record; verify line locations and PO rates.
- No `createdfrom` value; PO rate logic should not run.
- Vendor pricing missing; rate remains unchanged.
- Search errors are logged without blocking save.

## 11. Deployment Notes
- Upload `sna_hul_ue_customlocation.js`.
- Deploy User Event on Sales Order.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should PO rate logic run on edits when quantities change?
- Should vendor price selection prioritize different fields?
- Risk: Quantity break JSON is invalid (Mitigation: Validate JSON before parsing)
- Risk: Large orders increase load time (Mitigation: Optimize search and line processing)

---
