# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-MassUpdateInvCustFormProd
title: Invoice Custom Form Mass Update (Production)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: mass_update
  file: FileCabinet/SuiteScripts/massUpdateInvCustFormProd.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A Mass Update script that assigns invoice custom forms based on invoice transaction number prefixes.

---

## 2. Business Goal
Ensure invoices use the correct custom form for rental, equipment, or lease invoices in production.

---

## 3. User Story
As an admin, when invoices are processed by a Mass Update, I want invoice custom forms set by prefix, so that formatting matches invoice type.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Mass Update run | tranid | tranid starts with R | Set `customform` to 138 |
| Mass Update run | tranid | tranid starts with S | Set `customform` to 144 |
| Mass Update run | tranid | tranid starts with FIN | Set `customform` to 139 |

---

## 5. Functional Requirements
- Run as a Mass Update on invoice records.
- Read `tranid` for each invoice.
- If `tranid` starts with `R`, set `customform` to `138`.
- If `tranid` starts with `S`, set `customform` to `144`.
- If `tranid` starts with `FIN`, set `customform` to `139`.

---

## 6. Data Contract
### Record Types Involved
- Invoice

### Fields Referenced
- tranid
- customform

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invoices without `tranid` are not updated.
- Unrecognized prefixes are not updated.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: one lookup and submitFields per invoice.

---

## 9. Acceptance Criteria
- Given an invoice with tranid starting with `R`, when the Mass Update runs, then `customform` is set to `138`.
- Given an invoice with tranid starting with `S`, when the Mass Update runs, then `customform` is set to `144`.
- Given an invoice with tranid starting with `FIN`, when the Mass Update runs, then `customform` is set to `139`.

---

## 10. Testing Notes
- Run Mass Update with invoices starting with R, S, and FIN; confirm forms updated.
- Invoice without `tranid`; confirm no update.
- Unrecognized prefix; confirm no update.

---

## 11. Deployment Notes
- Upload `massUpdateInvCustFormProd.js`.
- Create or select saved search for target invoices.
- Run Mass Update and confirm results.
- Rollback: re-run mass update with previous form values if needed.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should prefix mapping be configurable via script parameters?
- Risk: Hardcoded form IDs differ by environment.

---
