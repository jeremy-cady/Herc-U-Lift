# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalConfiguratorSo
title: Rental Configurator SO Helper
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator_so.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_sna_objects

---

## 1. Overview
Suitelet helper that returns rental contract IDs or dummy object info for sales order lines.

---

## 2. Business Goal
Provides JSON lookups for the rental configurator UI based on changes in sales order or contract selection.

---

## 3. User Story
- As a rental user, when I load contract IDs, I want to select the correct rental line, so that configuration is accurate.
- As a rental user, when I check dummy status, I want to select actual objects when required, so that fulfillment is correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | changed, sales order ID, rental contract ID, object ID | `changed` indicates lookup type | Return JSON for contract IDs, contract line info, or dummy status |

---

## 5. Functional Requirements
- When `changed=so`, return rental contract IDs for the given sales order.
- When `changed=rentalcontractid`, return object ID, dummy flag, and comments for the contract line.
- When `changed=checkdummy`, return dummy status for an object.
- Return JSON responses.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_sna_objects

### Fields Referenced
- Sales Order Line | custcol_sna_hul_rent_contractidd | Rental contract ID
- Sales Order Line | custcol_sna_hul_fleet_no | Object
- Sales Order Line | custcol_sna_hul_dummy | Dummy flag
- Sales Order Line | custcol_sna_hul_rental_config_comment | Comments
- Object | custrecord_sna_hul_rent_dummy | Dummy flag

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing contract returns empty JSON.
- Invalid object ID returns dummy false.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Search and lookup operations.

---

## 9. Acceptance Criteria
- Given a sales order ID, when `changed=so`, then the contract ID list returns.
- Given a rental contract ID, when `changed=rentalcontractid`, then dummy and object values return.
- Given an object ID, when `changed=checkdummy`, then dummy status returns.

---

## 10. Testing Notes
Manual tests:
- SO change returns contract IDs.
- Contract change returns object and dummy info.
- Missing contract returns empty JSON.
- Invalid object ID returns dummy false.

---

## 11. Deployment Notes
- Confirm endpoint URL used by UI.
- Deploy Suitelet.
- Update client script to call it.

---

## 12. Open Questions / TBDs
- Should contract IDs be sorted or filtered by status?

---
