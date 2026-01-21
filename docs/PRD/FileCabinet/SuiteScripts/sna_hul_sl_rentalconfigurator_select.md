# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-RentalConfiguratorSelect
title: Rental Configurator Select Options
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator_select.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
Suitelet that displays select options for object fields and returns the selected value to the rental configurator.

---

## 2. Business Goal
Allows users to set values for select-type configuration fields using a popup selection list.

---

## 3. User Story
- As a rental user, when I choose valid select values, I want configuration entries to be correct, so that rentals are configured accurately.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | fldname, line, objid, actualobj | Parameters provided | Show select options and return selected value to parent |

---

## 5. Functional Requirements
- Accept `fldname`, `line`, `objid`, and `actualobj` parameters.
- Inspect the object record to find a select field matching `fldname`.
- Populate a select field with available options.
- On submit, write the selected value back to the parent window and close.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects

### Fields Referenced
- Uses object record select fields by label.

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Field name not found returns empty options.
- Invalid object ID logs an error and shows empty list.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Object record load to inspect fields.

---

## 9. Acceptance Criteria
- Given a select-type field, when the Suitelet runs, then options display for that field.
- Given a selection, when the Suitelet submits, then the value is written to `custpage_actualsubfld` on the parent sublist.

---

## 10. Testing Notes
Manual tests:
- Select field returns options and writes value to parent.
- Field name not found returns empty options.
- Invalid object ID logs an error and shows empty list.

---

## 11. Deployment Notes
- Confirm popup URL is configured in parent suitelet.
- Deploy Suitelet.
- Ensure parent suitelet uses external URL parameter.

---

## 12. Open Questions / TBDs
- Should field identification use internal ID instead of label?

---
