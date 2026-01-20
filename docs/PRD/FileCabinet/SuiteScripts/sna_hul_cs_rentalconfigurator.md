# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalConfigurator
title: Rental Configurator Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_rentalconfigurator.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Rental configurator Suitelet
  - Sales Order
  - Rental contract records (custom record type not specified)

---

## 1. Overview
A client script for the Rental Configurator Suitelet that validates selections and updates the Suitelet based on contract, object, and fleet inputs.

---

## 2. Business Goal
Ensure rental configuration data is valid and synchronized with the selected Sales Order, contract, and object details.

---

## 3. User Story
As a user, when I configure rentals, I want rental configuration validated, so that I do not save inconsistent data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | custpage_actualobjfld, custpage_configsublist | save invoked | Validate object and configuration lines |
| fieldChanged | custpage_contractid | contract changed | Fetch object data and update fields |
| fieldChanged | custpage_soid | SO changed | Fetch contract IDs and update options |
| fieldChanged | custpage_fleetnofld | fleet number changed | Reload Suitelet with fleet filters |

---

## 5. Functional Requirements
- On save, validate that an actual rental object is provided and not a dummy object.
- Require at least one configuration line in `custpage_configsublist`.
- Validate that configuration line object and contract values match the header selections.
- When `custpage_contractid` changes, fetch object data from a Suitelet endpoint and update object and comments fields.
- When `custpage_soid` changes, fetch available contract IDs and update the contract field options.
- When `custpage_fleetnofld` changes, reload the Suitelet with updated fleet filters.
- Validate sublist field value formats for date, checkbox, and numeric types.

---

## 6. Data Contract
### Record Types Involved
- Rental configurator Suitelet
- Sales Order
- Rental contract records (custom record type not specified)

### Fields Referenced
- Suitelet | custpage_soid
- Suitelet | custpage_contractid
- Suitelet | custpage_objid
- Suitelet | custpage_actualobjfld
- Suitelet | custpage_configcommentsfld
- Suitelet | custpage_fleetnofld
- Suitelet | custpage_configsublist
- Suitelet | custpage_actualsubfld
- Suitelet | custpage_tempactualsubfld
- Suitelet | custpage_fieldtypesubfld
- Suitelet | custpage_actualobjsubfld
- Suitelet | custpage_rentalidsubfld

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Dummy object selected; save blocked.
- Configuration line mismatch; save blocked.
- Invalid date value in configuration sublist.
- External Suitelet response empty or invalid.

---

## 8. Implementation Notes (Optional)
- External Suitelet URL from parameters `custscript_sn_so_externalurl` and `custscript_sn_rental_externalurl`.
- Uses HTTP GET to Suitelet endpoints for object and contract data.

---

## 9. Acceptance Criteria
- Given invalid or dummy rental objects, when saving, then save is blocked.
- Given configuration lines, when saving, then lines must match selected contract and object.
- Given SO, contract, or fleet changes, when updated, then Suitelet refreshes.

---

## 10. Testing Notes
- Select contract and object, configure lines, and save.
- Dummy object selected; save blocked.
- Configuration line mismatch; save blocked.
- Invalid date value; validation error.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_rentalconfigurator.js`.
- Deploy to the rental configurator Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the dummy object check be enforced server-side?
- Risk: External URL parameter misconfiguration.

---
