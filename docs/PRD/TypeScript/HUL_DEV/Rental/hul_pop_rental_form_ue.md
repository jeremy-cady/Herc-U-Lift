# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: hul_pop_rental_form_ue
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: user_event
  file: TypeScript/HUL_DEV/Rental/hul_pop_rental_form_ue.ts
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction
  - Customer

---

## 1. Overview
User Event script that sets default revenue stream values for rental roles and auto-waives insurance when a valid COI exists.

---

## 2. Business Goal
Default rental revenue stream and auto-waive insurance when a valid COI is present.

---

## 3. User Story
As a rental user, when I create a transaction, I want the revenue stream defaulted and insurance waived if a valid COI exists, so that the form is prefilled correctly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| CREATE (beforeLoad) | cseg_sna_revenue_st, custbody_sna_hul_waive_insurance | Role is in rental list | Set revenue stream to 416 and waive insurance if COI valid |

---

## 5. Functional Requirements
- On CREATE, if the user role is in the rental list (1162, 1151, 1184, 1167), set cseg_sna_revenue_st to 416.
- Check customer COI and expiration date (custentity_sna_cert_of_insurance, custentity_sna_hul_date_of_exp_coi).
- If COI exists and expiration date is future-dated, set custbody_sna_hul_waive_insurance to true.
- beforeSubmit and afterSubmit are defined but empty.

---

## 6. Data Contract
### Record Types Involved
- Transaction
- Customer

### Fields Referenced
- cseg_sna_revenue_st
- custbody_sna_hul_waive_insurance
- custentity_sna_cert_of_insurance
- custentity_sna_hul_date_of_exp_coi

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Insurance waiver is set only when COI exists and expiration date is future-dated.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
TBD

---

## 11. Deployment Notes
TBD

---

## 12. Open Questions / TBDs
- prd_id, status, owner, created, last_updated
- script_id, deployment_id
- Specific transaction type(s)
- Schema references
- Acceptance criteria details
- Testing notes
- Deployment notes

---
