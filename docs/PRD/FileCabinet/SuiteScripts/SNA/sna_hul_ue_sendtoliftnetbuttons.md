# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SendToLiftNetButtons
title: LiftNet Buttons and Parcel Handling (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_sendtoliftnetbuttons.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Item Fulfillment
  - Parcel (`customrecord_sna_parcel`)

---

## 1. Overview
A User Event that adds LiftNet-related buttons on transaction view and manages parcel data updates with Spee-Dee/EasyPost integration.

## 2. Business Goal
Provides quick access to LiftNet actions and keeps parcel records in sync with shipping label data.

## 3. User Story
As a sales user, when viewing a transaction, I want LiftNet buttons, so that I can open LiftNet or email quotes quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | `custbody_liftnetquoteid` | View mode | Add LiftNet buttons |
| beforeSubmit | `custbody_sna_parceljson` | Parcel sublist entries | Save parcel sublist lines into JSON |
| afterSubmit | `custbody_sna_speedeeorderid` | Fulfillment shipped | Buy Spee-Dee orders and retrieve shipping labels |

## 5. Functional Requirements
- The system must add a "LiftNet" button on view with quote and estimate IDs.
- The system must add an "Email LiftNet Quote" button when `custbody_liftnetquoteid` is present.
- The system must save parcel sublist lines into `custbody_sna_parceljson` before submit.
- The system must, after submit, buy Spee-Dee orders and retrieve shipping labels if fulfillment is shipped.
- The system must update parcel records and tracking details in `customrecord_sna_parcel` and JSON.
- The system must update shipping cost from API response when available.

## 6. Data Contract
### Record Types Involved
- Item Fulfillment
- Parcel (`customrecord_sna_parcel`)

### Fields Referenced
- Transaction | `custbody_liftnetquoteid`
- Transaction | `custbody_estimate`
- Item Fulfillment | `custbody_sna_parceljson`
- Item Fulfillment | `custbody_sna_speedeeorderid`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- No quote ID; email button not shown.
- EasyPost API error; label updates fail and are logged.
- API errors are logged without blocking save.

## 8. Implementation Notes (Optional)
- Script parameter `custscript_params_sendtoliftnetcsscript` for client script file.
- Requires valid EasyPost token in `custscript_param_speedeetoken`.

## 9. Acceptance Criteria
- Given a record with LiftNet quote ID, when the record is viewed, then LiftNet buttons appear.
- Given parcel sublist entries, when the record is saved, then parcel JSON reflects sublist entries.
- Given a shipped fulfillment, when the record is saved, then shipping labels and tracking numbers update.

## 10. Testing Notes
- View record with LiftNet quote ID; buttons appear.
- Save item fulfillment and verify parcel JSON updates.
- No quote ID; email button not shown.
- EasyPost API error; label updates fail and are logged.

## 11. Deployment Notes
- Upload `sna_hul_ue_sendtoliftnetbuttons.js`.
- Set client script file parameter.
- Configure EasyPost token parameter.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should LiftNet buttons appear on edit mode?
- Should parcel updates be handled by a separate script to avoid duplication?
- Risk: API downtime blocks label updates (Mitigation: Add retry or manual re-run process)
- Risk: Large parcel JSON increases processing time (Mitigation: Limit parcel size or optimize parsing)

---
