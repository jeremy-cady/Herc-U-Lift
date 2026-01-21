# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ConfigureObject
title: Configure Object
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_configureobject.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_object_config_rule

---

## 1. Overview
Suitelet used in rental order entry to configure object fields based on configuration rules.

---

## 2. Business Goal
Allows users to enter or lock object configuration values per rule set and pass them back to the transaction line.

---

## 3. User Story
- As a rental user, when I configure object attributes, I want order lines to carry the correct configuration, so that rentals are accurate.
- As an admin, when I lock fields based on rules, I want users unable to change restricted values, so that configurations stay compliant.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | TBD | Configuration rules and object segment are evaluated | Render configuration fields, enforce locked fields, and return configuration JSON |

---

## 5. Functional Requirements
- Load object configuration rules from `customrecord_sna_object_config_rule`.
- Match rules based on the object equipment segment or fallback rule.
- Dynamically add object fields defined by the rule.
- Respect locked fields by disabling them.
- On submit from a line context, write JSON configuration into line fields and close the window.
- On submit from order entry, redirect to `sna_hul_sl_selectratecard`.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_object_config_rule

### Fields Referenced
- customrecord_sna_object_config_rule.custrecord_sna_hul_configurable_fields
- customrecord_sna_object_config_rule.custrecord_hul_locked_fields
- customrecord_sna_object_config_rule.cseg_sna_hul_eq_seg
- customrecord_sna_object_config_rule.custrecord_sna_config_rule_type
- transactionline.custcol_sna_hul_object_configurator
- transactionline.custcol_sna_hul_object_configurator_2
- transactionline.custcol_sna_hul_rental_config_comment

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching segment uses fallback rule.
- Long JSON splits into two fields.
- Missing object ID results in no dynamic fields.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Rule search is unfiltered and stops at first match.

---

## 9. Acceptance Criteria
- Given configuration rules exist, when the Suitelet runs, then dynamic fields match the rule configuration.
- Given locked fields are defined, when the Suitelet runs, then those fields are disabled.
- Given the Suitelet submits from a line context, when it completes, then line fields receive configuration JSON.

---

## 10. Testing Notes
Manual tests:
- Object with segment matches rule and fields render.
- Submit from line writes configuration JSON to line fields.
- No matching segment uses fallback rule.
- Long JSON splits into two fields.
- Missing object ID results in no dynamic fields.

---

## 11. Deployment Notes
- Confirm rule records exist.
- Confirm line fields exist.
- Deploy Suitelet.
- Link from rental order entry flow or line popup.

---

## 12. Open Questions / TBDs
- Should configuration rules be cached for performance?

---
