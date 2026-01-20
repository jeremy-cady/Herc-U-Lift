# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CalcShippingCostCS
title: SpeeDee Shipping Cost Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_calcshippingcost.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Item Fulfillment
  - Customer
  - Location

---

## 1. Overview
A client script that manages SpeeDee shipping workflows, including parcel field enablement and shipping cost calculations for sales orders and item fulfillments.

## 2. Business Goal
Enables users to calculate SpeeDee shipping costs and manage parcel details directly on the transaction form.

## 3. User Story
As a shipping user, when I need to calculate shipping costs, I want shipping costs calculated automatically, so that rates are accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | `shipmethod` | Record load | Enable/disable parcel fields for SpeeDee |
| fieldChanged | `shipmethod` | Ship method changes | Enable/disable parcel fields for SpeeDee |
| saveRecord | `custbody_sna_speedeeorderid` | Item fulfillment with carrier `nonups` | Block save if order ID missing |
| TBD | TBD | Shipping action | Calculate shipping cost and update SpeeDee fields |

## 5. Functional Requirements
- The system must read the SpeeDee shipping method script parameter `custscript_param_speedeeshipmethod`.
- On `pageInit` and `fieldChanged`, the system must enable parcel fields only when the ship method is SpeeDee.
- On `saveRecord` for item fulfillments with carrier `nonups`, the system must require `custbody_sna_speedeeorderid`.
- The system must calculate shipping cost using NetSuite Shipping.calculateRates for non-SpeeDee methods and EasyPost API calls for SpeeDee methods.
- The system must update `shippingcost` and SpeeDee order fields based on API responses.
- The system must write SpeeDee order payload and response to `custbody_sna_speedeeorderdetails`, `custbody_sna_speedeeorderreturn`, `custbody_sna_speedeeorderid`, `custbody_sna_speedeeorderbought`.
- The system must support printing parcel labels by reading `custbody_sna_parceljson` and opening label URLs.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Item Fulfillment
- Customer
- Location

### Fields Referenced
- Transaction | `custbody_sna_speedeeorderdetails`
- Transaction | `custbody_sna_speedeeorderreturn`
- Transaction | `custbody_sna_speedeeorderid`
- Transaction | `custbody_sna_speedeeorderbought`
- Transaction | `custbody_sna_parceljson`
- Script parameter | `custscript_param_speedeeshipmethod`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- SpeeDee API error returns; shipping cost set to 0 and alert shown.
- Missing customer or location address.
- Save record blocked when order ID missing and carrier is nonups.

## 8. Implementation Notes (Optional)
- Uses client-side HTTPS calls.
- Parcel field enablement depends on custom sublist `custpage_sublist_parcel`.

## 9. Acceptance Criteria
- Given a non-SpeeDee ship method, when the form loads, then parcel fields are disabled.
- Given a SpeeDee ship method, when shipping is calculated, then shipping cost is written to `shippingcost`.
- Given an item fulfillment without SpeeDee order ID, when saving, then save is blocked.
- Given parcel JSON with label URLs, when printing, then labels open.

## 10. Testing Notes
- Sales order with SpeeDee ship method calculates rates.
- Item fulfillment calculates SpeeDee order and updates parcel lines.
- SpeeDee API error returns; shipping cost set to 0 and alert shown.
- Missing customer or location address.
- Save record blocked when order ID missing and carrier is nonups.

## 11. Deployment Notes
- Upload `sna_hul_cs_calcshippingcost.js`.
- Deploy to sales order and item fulfillment forms.
- Configure SpeeDee shipping method parameter.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should SpeeDee API calls move server-side to protect tokens?
- Should shipping cost be recalculated on item changes?
- Risk: Client-side API token exposure (Mitigation: Move API calls to Suitelet or RESTlet)
- Risk: Large parcel lists slow UI (Mitigation: Optimize parcel iteration)

---
