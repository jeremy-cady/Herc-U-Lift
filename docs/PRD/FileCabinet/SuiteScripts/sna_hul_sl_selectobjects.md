# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SelectObjects
title: Select Objects
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_selectobjects.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects

---

## 1. Overview
Suitelet that displays available rental objects and allows selection for rental workflows.

---

## 2. Business Goal
Provides a filtered, paged list of objects so users can pick the correct equipment.

---

## 3. User Story
- As a rental user, when I filter objects by segment and location, I want to find the right equipment, so that rental setup is accurate.
- As a rental user, when I select an object and continue, I want to configure the order line, so that the workflow continues.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | object, fleet code, segment, model, manufacturer, location | Filters provided | Display paged object results and pass selection to configuration |

---

## 5. Functional Requirements
- Accept filters such as object, fleet code, segment, model, manufacturer, and location.
- Search `customrecord_sna_objects` using the filter criteria.
- Display paged results with select radio buttons.
- Redirect to `sna_hul_sl_configureobject` with the selected object and context.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects

### Fields Referenced
- customrecord_sna_objects | custrecord_sna_owner_status | Owner status
- customrecord_sna_objects | custrecord_sna_posting_status | Posting status
- customrecord_sna_objects | custrecord_sna_hul_rent_dummy | Dummy flag
- customrecord_sna_objects | custrecord_sna_exp_rental_return_date | Expected return date
- customrecord_sna_objects | custrecord_sna_equipment_model | Model
- customrecord_sna_objects | custrecord_sna_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_responsibility_center | Responsibility center

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No results returns empty sublist.
- Earliest date filter excludes future availability.
- Invalid filters do not crash the UI.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Search paging per request.

---

## 9. Acceptance Criteria
- Given filters are set, when the Suitelet runs, then filtered object results display in a paged sublist.
- Given an object is selected, when the Suitelet redirects, then selection is passed to the configure object suitelet.

---

## 10. Testing Notes
Manual tests:
- Filters return object results and selection redirects.
- No results returns empty sublist.
- Earliest date filter excludes future availability.
- Invalid filters do not crash the UI.

---

## 11. Deployment Notes
- Confirm redirect target suitelet is deployed.
- Deploy Suitelet.
- Add entry point in rental flow.

---

## 12. Open Questions / TBDs
- Should selection allow multi-object selection?

---
