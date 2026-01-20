# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesOrderConsolidate
title: Sales Order Consolidate Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_sales_order_consolidate.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Invoice
  - Item Fulfillment
  - Customer
  - Item
  - Location

---

## 1. Overview
A consolidated client script that provides Sales Order and Item Fulfillment validations and shipping-related actions, including Spee-Dee rate calculation and parcel printing.

---

## 2. Business Goal
Centralize client-side checks for PO-required customers, shipping validations, and parcel label workflow.

---

## 3. User Story
As a sales or shipping user, when I enter orders and fulfillments, I want PO-required and shipping validations enforced, so that orders and shipments are compliant.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| client action | shipcarrier, shipmethod | Spee-Dee shipping used | Calculate Spee-Dee rates |
| before save | custentity_sna_hul_po_required, otherrefnum | PO required and missing PO | Block save |
| before save (IF) | custbody_sna_speedeeorderid | Spee-Dee rate missing | Block save based on parameters |

---

## 5. Functional Requirements
- Calculate Spee-Dee rates using customer and location address details and item weights.
- Block Item Fulfillment save if Spee-Dee shipping is used and rate is not calculated (based on script parameters).
- Check customer `custentity_sna_hul_po_required` and enforce `otherrefnum` when required.
- Expose client actions to calculate shipping cost, print parcels, and print warranty documents.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
- Invoice
- Item Fulfillment
- Customer
- Item
- Location

### Fields Referenced
- Header | custentity_sna_hul_po_required
- Header | otherrefnum
- Header | custbody_sna_speedeeorderid
- Header | shipcarrier
- Header | shipmethod
- Header | shipaddresslist
- Header | location
- Item | weight
- Item | weightunit

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- PO-required customer without PO number; save blocked.
- Spee-Dee fulfillment with missing rate; save blocked.
- External API errors show user alerts.

---

## 8. Implementation Notes (Optional)
- Script is noted as deprecated by another script.
- External dependency: EasyPost API for Spee-Dee rates.
- Requires valid tokens and carrier account parameters.

---

## 9. Acceptance Criteria
- Given a PO-required customer, when saving without a PO number, then save is blocked.
- Given Spee-Dee shipping, when rate is missing, then fulfillment save is blocked.

---

## 10. Testing Notes
- Sales order with PO-required customer and PO number saves.
- Spee-Dee shipping rate calculated and saved on fulfillment.
- PO-required customer without PO number; save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_sales_order_consolidate.js`.
- Deploy to Sales Order and Item Fulfillment as required.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Which script replaces this deprecated logic?
- Risk: External API latency.
- Risk: Deprecated logic still deployed.

---
