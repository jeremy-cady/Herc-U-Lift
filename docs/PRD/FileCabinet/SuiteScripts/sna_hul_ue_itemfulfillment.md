# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ItemFulfillment
title: Item Fulfillment and Invoice Controls
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_itemfulfillment.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - itemfulfillment
  - invoice
  - salesorder
  - customrecord_sna_objects

---

## 1. Overview
User Event that enforces rental configuration rules, adjusts shipping/handling costs, and updates object statuses based on invoice fulfillment.

---

## 2. Business Goal
Prevent fulfillment/invoicing when rental configuration is incomplete and ensure shipping/handling and rental billing logic are applied consistently.

---

## 3. User Story
As a fulfillment or billing user, when processing rentals and invoices, I want incomplete configurations blocked and rental charges calculated, so that billing and fulfillment are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | shippingcost, handlingcost | Item Fulfillment create/edit | Set shipping and handling costs from parameters |
| beforeLoad | Invoice button | Item Fulfillment view | Remove Invoice button if SO has unconfigured/dummy lines |
| beforeSubmit | Invoice lines | Invoice create from Sales Order | Remove non-billable lines and adjust quantities for returns |
| beforeSubmit | Billing schedule fields | Invoice create/edit | Recalculate rental quantities and rates |
| afterSubmit | Object status fields | Invoice | Update object status for new/used equipment lines |

---

## 5. Functional Requirements
- On Item Fulfillment create/edit, set shipping and handling costs based on script parameters.
- On Item Fulfillment view, remove the Invoice button if the Sales Order has unconfigured or dummy lines.
- On Invoice create from Sales Order, remove non-billable lines and adjust quantities for returned items.
- Recalculate rental line quantities/rates based on billing schedules and previously billed amounts.
- On Invoice afterSubmit, update object status for new/used equipment lines.

---

## 6. Data Contract
### Record Types Involved
- itemfulfillment
- invoice
- salesorder
- customrecord_sna_objects

### Fields Referenced
- itemfulfillment | shippingcost | Shipping cost
- itemfulfillment | handlingcost | Handling cost
- invoice line | custcol_sna_qty_returned | Returned qty
- invoice line | custcol_sna_hul_object_configurator | Config JSON
- invoice line | custcol_sna_hul_object_configurator_2 | Config JSON
- invoice line | custcol_sna_hul_dummy | Dummy flag
- invoice line | custcol_sna_hul_bill_date | Bill date
- invoice line | custcol_sn_hul_billingsched | Billing schedule JSON
- invoice line | custcol_sna_hul_fleet_no | Fleet object
- invoice line | custcol_sna_hul_rent_contractidd | Contract ID
- invoice | custbody_sn_hul_allow_prebilling | Allow prebilling
- salesorder line | custcol_sna_hul_fleet_no | Fleet object
- salesorder line | custcol_sna_hul_rent_contractidd | Contract ID
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_status | Object status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Dummy object lines block fulfillment/invoicing.
- Billing schedules exclude future dates when prebilling is off.
- Search errors are logged without blocking saves.

---

## 8. Implementation Notes (Optional)
- Uses `SuiteScripts/moment.js` for date calculations.
- Performance/governance considerations: Multiple searches for billing and configuration; heavy on invoices with many lines.

---

## 9. Acceptance Criteria
- Given configured rentals, when fulfilling, then shipping/handling costs apply and invoicing is allowed.
- Given unconfigured/dummy lines, when viewing fulfillment, then Invoice button is removed.
- Given rental billing schedules, when invoicing, then quantities/rates are adjusted and object status updates to sold.

---

## 10. Testing Notes
- Fulfillment with configured rentals allows invoicing.
- Invoice creation adjusts quantities for returned items.
- Dummy object lines block fulfillment/invoicing.
- Deploy User Event on Item Fulfillment and Invoice as configured.

---

## 11. Deployment Notes
- Configure script parameters for shipping/handling and rental items.
- Deploy User Event on Item Fulfillment and Invoice and validate fulfillment and billing behavior.
- Monitor logs for billing calculation errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should rental billing calculations be refactored into shared utilities?

---
