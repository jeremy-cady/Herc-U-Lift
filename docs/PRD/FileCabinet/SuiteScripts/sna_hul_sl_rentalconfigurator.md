# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalConfigurator
title: Rental Configurator
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_sna_objects
  - customrecord_sna_object_config_rule

---

## 1. Overview
Suitelet that manages rental object configuration and updates sales order lines and object status.

---

## 2. Business Goal
Enables users to configure rental objects, select actual objects, and push configuration data back to sales orders.

---

## 3. User Story
- As a rental coordinator, when I configure rental objects, I want orders to reflect actual equipment, so that fulfillment is accurate.
- As an admin, when configuration is complete, I want only configured items delivered, so that compliance is maintained.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | sales order, rental contract ID, object data | Configurator opened | Render configuration UI, write configuration JSON, update object status |

---

## 5. Functional Requirements
- Display sales order, rental contract ID, and object data.
- Load configuration rules from object config rules and populate a configuration sublist.
- Allow selecting actual objects, including filtering non-dummy objects by fleet number.
- Write configuration JSON to sales order lines.
- Update object status and rental status based on configuration completeness.
- Update inventory assignment for new/used equipment items.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_sna_objects
- customrecord_sna_object_config_rule

### Fields Referenced
- Sales Order Line | custcol_sna_hul_rent_contractidd | Rental contract ID
- Sales Order Line | custcol_sna_hul_object_configurator | Config JSON
- Sales Order Line | custcol_sna_hul_object_configurator_2 | Config JSON overflow
- Sales Order Line | custcol_sna_hul_fleet_no | Object
- Sales Order Line | custcol_sna_object | Object
- Sales Order Line | custcol_sna_hul_obj_model | Object model
- Sales Order Line | custcol_sna_hul_dummy | Dummy flag
- Sales Order Line | custcol_sna_hul_rental_config_comment | Comments
- Object | custrecord_sna_hul_rent_dummy | Dummy flag
- Object | custrecord_sna_equipment_model | Equipment model
- Object | custrecord_sna_status | Status
- Object | custrecord_sna_rental_status | Rental status

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Dummy object requires actual object selection.
- Long configuration JSON splits into two fields.
- Missing contract ID results in no updates.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Record loads, searches, and saves.

---

## 9. Acceptance Criteria
- Given configuration data, when the Suitelet runs, then configuration sublist displays requested and actual values.
- Given configuration completeness, when the Suitelet runs, then object statuses update based on configured vs. unconfigured fields.
- Given the Suitelet submits, when it completes, then sales order line configuration fields are updated.

---

## 10. Testing Notes
Manual tests:
- Configured values update the SO line and object status.
- Dummy object requires actual object selection.
- Long configuration JSON splits into two fields.
- Missing contract ID results in no updates.

---

## 11. Deployment Notes
- Confirm status and item parameter IDs.
- Deploy Suitelet.
- Provide access from rental workflow.

---

## 12. Open Questions / TBDs
- Should configuration enforce required fields before submit?

---
