# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ShowRecalculateRateButtons
title: Show Recalculate Rate Buttons
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_show_recalculate_rate_btn.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - transaction

---

## 1. Overview
Adds action buttons to a transaction record to trigger rate recalculation and revenue stream updates.

---

## 2. Business Goal
Expose recalc actions from the transaction UI without manual navigation to Suitelets.

---

## 3. User Story
As a sales user, when viewing or editing a transaction, I want recalc buttons available, so that line rates can be refreshed.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Form | view | Add Suitelet buttons for recalc actions |
| beforeLoad | Form | edit | Attach client script and add recalc buttons |

---

## 5. Functional Requirements
- On VIEW, add a Recalculate Rate button that opens the recalc Suitelet with actionType=recalculateRate.
- On VIEW, add an Update Rev Stream & Recalc Rate button that opens the Suitelet with actionType=updateRevStreamRecalcRate.
- On EDIT, set the client script module and add buttons that call `recalculateRate` and `updateRevStreamRecalcRate`.
- If button creation fails, log an error and continue loading the record.

---

## 6. Data Contract
### Record Types Involved
- transaction

### Fields Referenced
- None.

Schemas (if known):
- Suitelet: customscript_sna_hul_sl_recalc_rate_revs

---

## 7. Validation & Edge Cases
- The script does not add buttons on create.
- Suitelet resolution errors are logged and do not block record load.
- Edit without client script should log an error.

---

## 8. Implementation Notes (Optional)
- Client script module: sna_hul_cs_recalculate_rate_rev_stream.js.
- Suitelet parameters include `custparam_actionType` and `custparam_soId`.

---

## 9. Acceptance Criteria
- Given a record in view, when beforeLoad runs, then both recalc buttons appear and redirect to the Suitelet with the record id.
- Given a record in edit, when beforeLoad runs, then both buttons call client functions.
- Given errors during button creation, when beforeLoad runs, then the record still loads.

---

## 10. Testing Notes
- View a record and click Recalculate Rate to confirm Suitelet launches with record id.
- View a record and click Update Rev Stream & Recalc Rate to confirm Suitelet launches with record id.
- Edit a record and confirm client functions run.
- Deploy Suitelet and client script in sandbox.

---

## 11. Deployment Notes
- Suitelet deployment exists and is active.
- Client script file is accessible at the module path.
- Deploy the User Event to the intended record type and validate buttons on view/edit.
- Disable the User Event deployment to rollback.

---

## 12. Open Questions / TBDs
- Which record types are officially supported for this deployment?

---
