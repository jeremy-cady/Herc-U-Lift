# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PrintButtonVRA
title: Vendor Return Authorization Print Button
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_printbutton_vra.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - vendorreturnauthorization

---

## 1. Overview
User Event that adds a Print Vendor Return Authorization button to the VRA form.

---

## 2. Business Goal
Allow users to print Vendor Return Authorization documents via a suitelet.

---

## 3. User Story
As a purchasing user, when viewing a VRA, I want a print button, so that I can process returns efficiently.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Form | VRA record | Add Print button to open suitelet |

---

## 5. Functional Requirements
- Run beforeLoad on VRA records.
- Add a button that opens the suitelet `customscript_sna_hul_sl_printvra`.
- Pass the current record ID as `tranId`.

---

## 6. Data Contract
### Record Types Involved
- vendorreturnauthorization

### Fields Referenced
- None.

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing suitelet deployment should log error.
- URL resolution errors are logged.

---

## 8. Implementation Notes (Optional)
- Suitelet: `customscript_sna_hul_sl_printvra`.

---

## 9. Acceptance Criteria
- Given a VRA form, when beforeLoad runs, then the Print Vendor Return Authorization button appears.
- Given a VRA form, when clicking the button, then the print suitelet opens in a new window.

---

## 10. Testing Notes
- Open VRA and click print button to open suitelet.
- Missing suitelet deployment should log error.
- Deploy User Event on VRA and ensure suitelet deployment exists.

---

## 11. Deployment Notes
- Confirm suitelet script and deployment IDs.
- Deploy User Event on VRA and validate print button behavior.
- Monitor logs for URL resolution errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the print button be hidden in view-only contexts?

---
