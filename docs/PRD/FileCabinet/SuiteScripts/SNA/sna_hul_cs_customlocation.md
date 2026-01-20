# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CustomLocationCS
title: Custom Location Selector (Client Script)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_customlocation.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Location

---

## 1. Overview
A client script that synchronizes a custom location field with the standard location field and populates a custom location dropdown based on subsidiary.

## 2. Business Goal
Ensures users select valid locations for the selected subsidiary and keeps the standard `location` field in sync.

## 3. User Story
As a user, when selecting a location, I want a filtered location list, so that I only choose valid locations.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | `subsidiary`, `location` | Record load | Populate `custpage_fld_location` options |
| fieldChanged | `custbody_sna_hul_location` | Custom location changes | Sync standard `location` field |

## 5. Functional Requirements
- The system must read `subsidiary` and `location` on page initialization.
- The system must fetch locations filtered by subsidiary and populate `custpage_fld_location` options.
- The system must select the current location option when it matches the record value.
- When `custbody_sna_hul_location` changes, the system must set `location` to the same value.
- The system must handle empty results by inserting a "No Location" option.

## 6. Data Contract
### Record Types Involved
- Location

### Fields Referenced
- Body | `custbody_sna_hul_location`
- Form field | `custpage_fld_location`
- Body | `subsidiary`
- Body | `location`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Subsidiary has no locations; "No Location" is shown.
- Custom field missing from form.
- Search fails; error logged to console.

## 8. Implementation Notes (Optional)
- Uses `search.create.promise` to populate select options.
- `pageInit` is defined but not exported (currently commented out).

## 9. Acceptance Criteria
- Given a subsidiary, when the page loads, then the custom location dropdown is populated with subsidiary locations.
- Given a selected custom location, when it changes, then `location` updates.
- Given a current location, when the page loads, then it is pre-selected when available.

## 10. Testing Notes
- Load a record with subsidiary set; custom location list populates.
- Change custom location; `location` updates.
- Subsidiary has no locations; "No Location" is shown.
- Search fails; error logged to console.

## 11. Deployment Notes
- Upload `sna_hul_cs_customlocation.js`.
- Deploy to forms with custom location fields.
- Validate location list and sync behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the dropdown refresh when subsidiary changes?
- Should pageInit be enabled to populate on load?
- Risk: `pageInit` not exported so list not populated on load (Mitigation: Export `pageInit` if needed)
- Risk: Large location lists slow the UI (Mitigation: Cache results per subsidiary)

---
