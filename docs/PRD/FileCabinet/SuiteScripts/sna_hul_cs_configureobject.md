# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ConfigureObject
title: Object Configurator Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_configureobject.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order or Quote (originating transaction)

---

## 1. Overview
A client script that powers the rental object configurator UI, populating fields from prior selections and writing configuration data back to the originating transaction.

---

## 2. Business Goal
Ensure object configuration data persists between the Suitelet and transaction lines, and supports pre-filling values from rate cards or existing line data.

---

## 3. User Story
As a sales user, when I configure a rental object, I want fields prefilled and saved back to the transaction, so that configuration stays synchronized.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custpage_fromratecardfld, custpage_fromlinefld | configurator opened | Prefill fields from rate card or line data |
| client save | custpage_fldconfigfld | save invoked | Serialize configuration and write to opener transaction |
| client action | back button | user invokes | Redirect to object selection Suitelet |

---

## 5. Functional Requirements
- On page init, detect if the configurator was launched from a rate card or line and prefill fields accordingly.
- When launched from a transaction line, read JSON configuration data from line fields and apply values to the Suitelet form.
- Disable fields that are already configured or listed as locked.
- On save, serialize current field values into a configuration array and write it back to the opener transaction.
- Format select, checkbox, and date fields correctly for configuration output.
- Back button redirects to the object selection Suitelet with key context parameters.

---

## 6. Data Contract
### Record Types Involved
- Sales Order or Quote (originating transaction)

### Fields Referenced
- Suitelet | custpage_fromratecardfld
- Suitelet | custpage_fromlinefld
- Suitelet | custpage_fldidsfld
- Suitelet | custpage_lockedfldidsfld
- Suitelet | custpage_fldconfigfld
- Suitelet | custpage_custfld
- Suitelet | custpage_custpricegrpfld
- Suitelet | custpage_trandtefld
- Suitelet | custpage_loccodefld
- Suitelet | custpage_respcenterfld
- Transaction Line | custcol_sna_hul_object_configurator
- Transaction Line | custcol_sna_hul_object_configurator_2
- Transaction Body | custbody_sna_hul_rental_temp_config
- Transaction Body | custbody_sna_hul_rental_temp_config_id

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Locked fields are disabled and preserved.
- Date fields format correctly on save.
- Missing `window.opener` should be handled gracefully.

---

## 8. Implementation Notes (Optional)
- Uses `window.opener` to read and write values to the originating transaction.
- Redirects to Suitelet `customscript_sna_hul_sl_selectobject`.

---

## 9. Acceptance Criteria
- Given stored configuration data, when the configurator loads, then fields populate correctly.
- Given locked fields, when the configurator loads, then those fields are disabled.
- Given a save action, when the configurator saves, then configuration JSON is written back to the originating transaction.

---

## 10. Testing Notes
- Open configurator from a transaction line; verify fields populate.
- Save configuration; confirm transaction fields updated.
- Locked fields are disabled.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_configureobject.js`.
- Deploy to the object configurator Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the configurator validate required fields before save?
- Risk: `window.opener` not available.
- Risk: Locked field list out of sync.

---
