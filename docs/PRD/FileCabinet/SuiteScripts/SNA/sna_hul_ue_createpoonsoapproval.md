# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreatePOOnSOApproval
title: Purchase Order Vendor Pricing and SO Linking (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_createpoonsoapproval.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Purchase Order
  - Sales Order
  - Vendor
  - Vendor Price (`customrecord_sna_hul_vendorprice`)
  - Item

---

## 1. Overview
A User Event script that updates purchase orders created from sales orders, applies vendor pricing logic, sets buy-from vendor, and links POs back to SO lines.

## 2. Business Goal
Ensures PO pricing and vendor linkage are set correctly for dropship/special order scenarios and updates related sales order lines.

## 3. User Story
As a purchasing user, when a PO is created from a sales order, I want PO rates to reflect vendor pricing, so that costs are correct.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | PO creation and dropship/special order events | Adjust PO rates and vendor fields, link PO to SO lines |

## 5. Functional Requirements
- The system must run on PO creation and on dropship/special order events.
- The system must set the PO employee to the current user (or order taker when created by system).
- The system must set buy-from vendor and parent vendor fields when missing.
- The system must adjust line rates based on vendor pricing and PO type discount/markup.
- The system must create vendor pricing records via a Suitelet if none exist for item/vendor.
- The system must update originating sales order lines with `povendor`, `custcol_sna_linked_po`, and `custcol_sna_csi_povendor`.
- The system must respect the "created from requisition worksheet" flag to avoid updates.

## 6. Data Contract
### Record Types Involved
- Purchase Order
- Sales Order
- Vendor
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item

### Fields Referenced
- Purchase Order | `custbody_sna_buy_from`
- Purchase Order | `custbody_sna_created_from_reqworksheet`
- Purchase Order | `custbody_po_type`
- Sales Order line | `povendor`
- Sales Order line | `custcol_sna_linked_po`
- Sales Order line | `custcol_sna_csi_povendor`
- PO line | `custcol_sna_original_item_rate`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- PO created from requisition worksheet; script skips updates.
- Missing vendor price record triggers create vendor price Suitelet.
- Record load or search error is logged and does not block save.

## 8. Implementation Notes (Optional)
- Script parameters: `custscript_param_popartsform`, `custscript_param_popartsformdept`.
- Suitelet call to `customscript_sna_hul_sl_createvendprice` via HTTPS.

## 9. Acceptance Criteria
- Given a dropship or special order PO, when the script runs, then PO buy-from vendor and pricing fields are set correctly.
- Given a PO created from a sales order, when the script runs, then sales order lines show the linked PO and vendor.
- Given a missing vendor price record, when the script runs, then a vendor price record is created.

## 10. Testing Notes
- Create dropship PO and verify pricing and SO linkage.
- PO created from requisition worksheet; script skips updates.
- Missing vendor price record triggers create vendor price Suitelet.
- Record load or search error is logged and does not block save.

## 11. Deployment Notes
- Upload `sna_hul_ue_createpoonsoapproval.js`.
- Set script parameters for default PO form and department.
- Ensure `customscript_sna_hul_sl_createvendprice` is deployed.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should pricing updates be skipped for additional PO statuses?
- Should vendor price creation be batched instead of per-line calls?
- Risk: Multiple record loads increase governance usage (Mitigation: Reduce loads or limit processing to needed events)
- Risk: Vendor price Suitelet fails and leaves rates unchanged (Mitigation: Add retry or error notification)

---
