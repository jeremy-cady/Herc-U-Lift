# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SNACSMulti
title: Sales Order and Item Fulfillment Client Utilities
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Item Fulfillment
  - Item
  - Customer
  - Location

---

## 1. Overview
A client script that handles sales order and item fulfillment UI behaviors, including vendor selection, PO rates, SpeeDee shipping workflow, and parcel/label interactions.

## 2. Business Goal
Automates line-level vendor/price defaults and shipping actions so users do not have to manually maintain PO vendor, PO rate, and shipping details.

## 3. User Story
As a sales rep, when I enter item lines, I want PO vendors and rates auto-filled, so that line entry is faster.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| postSourcing | `item` | Item sourced on line | Set line-level `location` and vendor defaults |
| fieldChanged | `povendor`, `quantity` | Item line changes | Recalculate PO rates and vendor fields |
| pageInit | TBD | Sales order create/copy | Populate line vendors using primary vendor configuration |
| fieldChanged | Shipping method | Item fulfillment | Enable/disable parcel fields based on shipping method |
| TBD | TBD | Shipping actions invoked | Calculate shipping cost, print labels, and generate SpeeDee payloads |

## 5. Functional Requirements
- The system must set line-level `location` on item lines to match the transaction location when items are sourced.
- The system must resolve PO vendor and rate based on primary vendor custom record data, quantity break pricing, contract price or item purchase price fallbacks.
- The system must update `custcol_sna_csi_povendor` and `povendor` on item lines when vendor data is found.
- The system must recalculate PO rates when `povendor` or `quantity` changes.
- On sales order create/copy, the system must populate line vendors using the primary vendor configuration.
- On item fulfillment, the system must disable or enable parcel fields based on shipping method.
- The system must set shipping cost to 0 for item fulfillment context.
- The system must support client actions to calculate shipping cost, print parcel labels, and generate SpeeDee order payloads.
- The system must manage parcel sublist values and shipping cost fields based on API responses.

## 6. Data Contract
### Record Types Involved
- Sales Order
- Item Fulfillment
- Item
- Customer
- Location

### Fields Referenced
- Line fields: `custcol_sna_csi_povendor`, `custcol_sna_hul_primaryvendor`, `custcol_sna_hul_qtybreakprices`, `custcol_sna_hul_contractprice`, `custcol_sna_hul_itempurchaseprice`
- Transaction fields: `custbody_sna_speedeeorderdetails`, `custbody_sna_speedeeorderreturn`, `custbody_sna_speedeeorderid`, `custbody_sna_speedeeorderbought`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Items without primary vendor records.
- SpeeDee API error responses.
- API call failures show alerts and do not corrupt parcel data.

## 8. Implementation Notes (Optional)
- Depends on script parameters for shipping method IDs.
- Client-side calls to external APIs and saved searches may be heavy.

## 9. Acceptance Criteria
- Given an item with a primary vendor, when items are selected, then PO vendor and rate default correctly.
- Given quantity changes, when the line updates, then PO rate updates based on quantity breaks.
- Given SpeeDee shipping methods, when the fulfillment loads, then parcel fields are enabled and shipping cost updates.

## 10. Testing Notes
- Add an item with a primary vendor and confirm PO vendor/rate defaults.
- Change quantity and verify PO rate updates.
- Run SpeeDee shipping flow and confirm parcel sublist updates.
- Items without primary vendor records.
- SpeeDee API error responses.

## 11. Deployment Notes
- Upload `sna_hul_cs_.js`.
- Deploy to sales order and item fulfillment forms.
- Set script parameters for shipping methods.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should SpeeDee logic be split into a dedicated module?
- Should rate calculation run server-side for consistency?
- Risk: Client-side API exposure (Mitigation: Move API calls server-side)
- Risk: Large client script affects performance (Mitigation: Refactor into smaller modules)

---
