# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateCalcButtons
title: Shipping Calculator and Parcel Handling (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_createcalcbuttons.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment
  - Sales Order
  - Parcel (`customrecord_sna_parcel`)
  - Handling Fee Map (`customrecord_speedee_handlingfeemap`)

---

## 1. Overview
A User Event that adds shipping calculation and parcel management UI, saves parcel details, and integrates with Spee-Dee (via EasyPost) for label buying and retrieval.

## 2. Business Goal
Allows users to calculate shipping, manage parcel data on item fulfillments, and apply handling fees on sales orders.

## 3. User Story
As a shipping user, when I need to calculate rates and print labels, I want to calculate rates and print labels, so that shipments are processed quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | TBD | Create/edit on relevant records | Add "Calculate Shipping Rate" button and parcel sublist UI |
| afterSubmit | TBD | Fulfillment status indicates shipping | Buy Spee-Dee orders and retrieve label data |
| beforeSubmit | `custbody_sna_parceljson` | Parcel data present | Persist parcel details to custom parcel records |
| afterSubmit | Sales Order subtotal | Sales Order | Apply handling fees based on subtotal |

## 5. Functional Requirements
- The system must add a "Calculate Shipping Rate" button on create/edit for relevant records.
- The system must add a parcel sublist on item fulfillment forms.
- The system must read and write `custbody_sna_parceljson` to persist parcel details.
- The system must create or update `customrecord_sna_parcel` records for each parcel.
- The system must buy Spee-Dee orders and retrieve label data when fulfillment status indicates shipping.
- The system must update fulfillment shipping cost and parcel tracking data based on API responses.
- The system must set handling fees on sales orders using `customrecord_speedee_handlingfeemap`.

## 6. Data Contract
### Record Types Involved
- Item Fulfillment
- Sales Order
- Parcel (`customrecord_sna_parcel`)
- Handling Fee Map (`customrecord_speedee_handlingfeemap`)

### Fields Referenced
- Item Fulfillment | `custbody_sna_parceljson`
- Item Fulfillment | `custbody_sna_speedeeorderid`
- Item Fulfillment | `custbody_sna_speedeeorderreturn`
- Item Fulfillment | `custbody_sna_speedeeorderbought`
- Parcel | `custrecord_sna_pc_*` fields for parcel data

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing EasyPost token; API calls fail and errors logged.
- No parcel JSON; sublist remains empty.
- API error logs and does not block record save.

## 8. Implementation Notes (Optional)
- Script parameters: `custscript_param_speedeeshipmethod`, `custscript_param_clientsidescriptid`, `custscript_param_speedeetoken`, `custscript_param_speedeecarrieraccount`, `custscript_param_sm_willcallshoporder`.
- External API calls require valid EasyPost token.
- Shipping cost is set to 0 for will-call and per updated logic.

## 9. Acceptance Criteria
- Given parcel data, when the record loads and saves, then parcel sublist renders and parcel details are saved.
- Given fulfillment status indicates shipping, when the record saves, then shipping labels and tracking numbers are populated.
- Given a sales order subtotal, when the record saves, then handling fees are applied based on subtotal.

## 10. Testing Notes
- Create item fulfillment with parcel data and verify labels/tracking.
- Create sales order and verify handling fee calculation.
- Missing EasyPost token; API calls fail and errors logged.
- No parcel JSON; sublist remains empty.
- API error logs and does not block record save.

## 11. Deployment Notes
- Upload `sna_hul_ue_createcalcbuttons.js`.
- Configure script parameters (Spee-Dee/EasyPost settings).
- Deploy User Event to item fulfillment and sales order records.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should parcel JSON be validated and sanitized before save?
- Should shipping cost be set to zero for all Spee-Dee shipments?
- Risk: EasyPost API outage prevents label retrieval (Mitigation: Add retry or fallback process)
- Risk: Large parcel lists slow record load (Mitigation: Limit parcel lines in UI)

---
