# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LocationUpdate
title: Location Responsibility Center Update
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_location_update.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - location

---

## 1. Overview
User Event that updates location responsibility center code and formats a printable address field.

---

## 2. Business Goal
Keep responsibility center codes in sync with location type and produce a formatted address for documents.

---

## 3. User Story
As an admin or document user, when locations are created or edited, I want responsibility center codes and formatted addresses updated, so that reporting and PDFs are consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custrecord_hul_loc_type | Location create/edit | Set responsibility center code and formatted address |

---

## 5. Functional Requirements
- Run afterSubmit on Location create/edit.
- If Location Type is Central (1), set `custrecord_sna_hul_res_cntr_code` to `custrecord_hul_code`.
- If Location Type is Van (2), set `custrecord_sna_hul_res_cntr_code` to parent location's `custrecord_hul_code`.
- Build a formatted address string from the mainaddress subrecord and store in `custrecord_sna_hul_address_pdf`.
- Save the location with updated fields.

---

## 6. Data Contract
### Record Types Involved
- location

### Fields Referenced
- location | custrecord_hul_loc_type | Location type
- location | custrecord_hul_code | HUL code
- location | custrecord_sna_hul_res_cntr_code | Responsibility center code
- location | custrecord_sna_hul_address_pdf | Address PDF string

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing parent location results in blank responsibility center.
- Save errors are logged.
- Address formatting uses HTML line breaks.

---

## 8. Implementation Notes (Optional)
- Uses mainaddress subrecord for address formatting.
- Lookup of parent location's `custrecord_hul_code`.

---

## 9. Acceptance Criteria
- Given a Central location, when afterSubmit runs, then responsibility center equals `custrecord_hul_code`.
- Given a Van location with a parent, when afterSubmit runs, then responsibility center equals parent's `custrecord_hul_code`.
- Given a location with an address, when afterSubmit runs, then `custrecord_sna_hul_address_pdf` contains formatted address data.

---

## 10. Testing Notes
- Central location sets responsibility center from HUL code.
- Van location inherits responsibility center from parent.
- Missing parent location results in blank responsibility center.
- Deploy User Event on Location.

---

## 11. Deployment Notes
- Confirm custom fields on Location record.
- Deploy User Event on Location and validate responsibility center and address PDF fields.
- Monitor logs for save errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should address formatting be localized by country?

---
