# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SelectRateCard
title: Select Rate Card Suitelet Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_selectratecard.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Suitelet for rate card selection

---

## 1. Overview
A client script for the Select Rate Card Suitelet that manages pagination, selection, and navigation back to the object configurator.

---

## 2. Business Goal
Let users select rate cards, preserve filters across pages, and return to the configurator with the chosen rate card.

---

## 3. User Story
As a sales user, when I select a rate card, I want to return to configuration, so that pricing is applied correctly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | filters | form loads | Store current filter values |
| saveRecord | custpage_selectedfld | save invoked | Store selected rate card IDs |
| fieldChanged | pagination, custpage_showallfld | value changed | Redirect with retained filters |
| client action | back | user invokes | Redirect to configurator Suitelet |

---

## 5. Functional Requirements
- On page init, store current filter values in a global state for later comparison.
- On save, set `custpage_selectedfld` with the selected rate card IDs.
- When pagination changes, redirect to the Suitelet while retaining selections and filters.
- When `custpage_showallfld` changes, refresh the Suitelet with updated filters.
- The back button must redirect to the configurator Suitelet with the selected object and filter parameters.

---

## 6. Data Contract
### Record Types Involved
- Suitelet for rate card selection

### Fields Referenced
- Suitelet | custpage_selectedfld
- Suitelet | custpage_objidfld
- Suitelet | custpage_custfld
- Suitelet | custpage_custpricegrpfld
- Suitelet | custpage_trandtefld
- Suitelet | custpage_loccodefld
- Suitelet | custpage_fromlinefld
- Suitelet | custpage_linenumfld
- Suitelet | custpage_showallfld
- Suitelet | custpage_ratesublist.custpage_selectsubfld
- Suitelet | custpage_ratesublist.custpage_rateidsubfld

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No selections; `custpage_selectedfld` cleared.
- Missing filter values should not block navigation.

---

## 8. Implementation Notes (Optional)
- Redirects to Suitelet `customscript_sna_hul_sl_selectratecard`.
- Back button redirects to `customscript_sna_hul_sl_configureobject`.

---

## 9. Acceptance Criteria
- Given selections, when saved, then selected rate card IDs are stored in `custpage_selectedfld`.
- Given page or show-all changes, when updated, then filters and selections persist.

---

## 10. Testing Notes
- Select a rate card and save; verify selected ID stored.
- Change page and confirm selections persist.
- No selections; verify selected field cleared.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_selectratecard.js`.
- Deploy to the Select Rate Card Suitelet.
- Rollback: remove client script deployment from the Suitelet.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should selection be required before returning to configurator?
- Risk: Filter state lost on unexpected reload.

---
