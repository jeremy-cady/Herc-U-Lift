# PRD: Populate Rental Form Defaults (User Event)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-PopRentalFormUE
title: Populate Rental Form Defaults (User Event)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/HUL_DEV/Rental/hul_pop_rental_form_ue.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Sales Order
  - Customer

---

## 1. Overview
A User Event that sets default rental form values by role and auto-waives insurance when the customer has a valid certificate of insurance.

---

## 2. Business Goal
Ensure consistent default revenue segment values for rental roles and reduce manual insurance waiver checks.

---

## 3. User Story
- As a rental coordinator, I want revenue segment auto-set so that I don’t enter it manually.
- As an admin, I want insurance waiver logic automated so that compliance checks are consistent.
- As a user, I want defaults set only on create so that edits aren’t overwritten.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad (create) | cseg_sna_revenue_st, custbody_sna_hul_waive_insurance | Role in rental list and valid COI | Set revenue segment and waive insurance |

---

## 5. Functional Requirements
- The system must run on beforeLoad for CREATE.
- The system must set cseg_sna_revenue_st to 416 for roles 1162, 1151, 1184, 1167.
- The system must check the customer for custentity_sna_cert_of_insurance and custentity_sna_hul_date_of_exp_coi.
- If a certificate exists and the expiration date is in the future, the system must set custbody_sna_hul_waive_insurance = true.
- Errors in the insurance check must be logged and not block the transaction.

---

## 6. Data Contract
### Record Types Involved
- Sales Order
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
- Customer missing COI data: waiver not set.
- COI expiration in the past: waiver not set.
- SuiteQL query fails: error logged and continue.

---

## 8. Implementation Notes (Optional)
- Uses SuiteQL to fetch customer insurance data.

---

## 9. Acceptance Criteria
- Given a rental role on create, when beforeLoad runs, then cseg_sna_revenue_st is set to 416.
- Given valid COI and future expiration, when beforeLoad runs, then custbody_sna_hul_waive_insurance is set to true.
- Given errors, when they occur, then they are logged without blocking record creation.

---

## 10. Testing Notes
- Create a rental sales order as role 1162 and confirm revenue segment set to 416.
- Use a customer with valid COI and future expiration and confirm waiver set.
- Use a customer without COI and confirm waiver not set.

---

## 11. Deployment Notes
- Upload hul_pop_rental_form_ue.js.
- Deploy as a User Event on the rental sales order form.
- Rollback: disable the User Event deployment.

---

## 12. Open Questions / TBDs
- Should revenue segment 416 be configurable?
- Should the insurance waiver logic run on edit as well?
- Role IDs change.
- COI expiration format issues.

---
