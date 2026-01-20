# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SOHideButton
title: Sales Order Bill Button and eSignature Controls (User Event)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: user_event
  file: FileCabinet/SuiteScripts/SNA/sna_hul_ue_so_hide_button.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order

---

## 1. Overview
A User Event on Sales Orders that hides billing buttons unless billing status is approved and adds a PandaDoc eSignature button for rental transactions.

## 2. Business Goal
Prevents billing until approval and streamlines eSignature requests for rental orders.

## 3. User Story
As a billing user, when billing status is not approved, I want billing buttons hidden until approval, so that billing is controlled.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | `custbody_sna_hul_billing_status` | View mode and billing status not `2` | Remove `nextbill`, `billremaining`, and `bill` buttons |
| beforeLoad | `custbody_sna_pd_doc_id` | View mode, rental item detected, and no PandaDoc ID | Add "Request eSignature" button |

## 5. Functional Requirements
- The system must remove `nextbill`, `billremaining`, and `bill` buttons when `custbody_sna_hul_billing_status` is not `2`.
- On view mode, the system must detect rental transactions by item name containing "Rental".
- If no `custbody_sna_pd_doc_id` exists and the transaction is rental, the system must add a "Request eSignature" button.
- The system must set `PandaDocs/sna_hul_cs_pd_esign_button` as the client script for the button.

## 6. Data Contract
### Record Types Involved
- Sales Order

### Fields Referenced
- Sales Order | `custbody_sna_hul_billing_status`
- Sales Order | `custbody_sna_pd_doc_id`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Item names do not include "Rental"; eSignature button not shown.
- Missing template parameter; client script still loads but button may fail.

## 8. Implementation Notes (Optional)
- Rental detection relies on item name containing "Rental".
- Script parameter `custscript_sna_pd_adv_pdf_temp`.

## 9. Acceptance Criteria
- Given billing status is not approved, when the record is viewed, then billing buttons are hidden.
- Given a rental transaction without PandaDoc ID, when the record is viewed, then the eSignature button appears.

## 10. Testing Notes
- Billing status approved; billing buttons visible.
- Billing status not approved; billing buttons hidden.
- Rental transaction without PandaDoc ID; eSignature button appears.
- Item names do not include "Rental"; eSignature button not shown.

## 11. Deployment Notes
- Upload `sna_hul_ue_so_hide_button.js`.
- Deploy User Event on Sales Order.
- Configure PandaDoc template parameter.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should rental detection use item type instead of name matching?
- Should eSignature button appear in edit mode?
- Risk: Item names change and break rental detection (Mitigation: Use item category or field flag)
- Risk: PandaDoc client script missing breaks button (Mitigation: Add validation or fallback message)

---
