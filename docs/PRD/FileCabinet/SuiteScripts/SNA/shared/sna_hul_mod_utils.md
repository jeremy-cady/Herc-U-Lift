# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-UtilsModule
title: Utility Module (isEmpty)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: library
  file: FileCabinet/SuiteScripts/SNA/shared/sna_hul_mod_utils.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None

---

## 1. Overview
A small utility module that provides a generic `isEmpty` check for strings, arrays, and objects.

## 2. Business Goal
Avoids repeated empty-check logic across scripts by centralizing a common helper.

## 3. User Story
As a developer, when I need to check for empty values, I want a shared `isEmpty` function, so that I can avoid duplicating checks.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | Helper is called | Return true/false for empty checks |

## 5. Functional Requirements
- The system must return true for empty strings, null, and undefined values.
- The system must return true for empty arrays.
- The system must return true for objects with no enumerable properties.
- The system must return false for non-empty strings, arrays, or objects.

## 6. Data Contract
### Record Types Involved
- None

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Arrays with falsy values still return false.
- Objects with inherited properties are treated as non-empty.
- Non-object input without constructor should be handled safely (if applicable).

## 8. Implementation Notes (Optional)
- Relies on `constructor` checks for Array and Object types.

## 9. Acceptance Criteria
- Given an empty string, when `isEmpty` runs, then it returns true.
- Given null or undefined, when `isEmpty` runs, then it returns true.
- Given an empty array, when `isEmpty` runs, then it returns true.
- Given an empty object, when `isEmpty` runs, then it returns true.
- Given a non-empty value, when `isEmpty` runs, then it returns false.

## 10. Testing Notes
- Validate `isEmpty` against empty string, array, object, null, undefined.
- Arrays with falsy values still return false.
- Objects with inherited properties are treated as non-empty.
- Non-object input without constructor should be handled safely (if applicable).

## 11. Deployment Notes
- Upload `sna_hul_mod_utils.js`.
- Update consuming scripts to import the module as needed.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should `isEmpty` treat whitespace-only strings as empty?
- Should `isEmpty` handle Date or Function types?
- Risk: Unexpected type throws due to constructor access (Mitigation: Add type guards if needed)
- Risk: Inconsistent empty checks if not widely adopted (Mitigation: Encourage reuse in scripts)

---
