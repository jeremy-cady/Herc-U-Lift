# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LockQuoteConversion
title: Lock Quote Conversion
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_lock_quote_convresion.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - estimate
  - customer

---

## 1. Overview
User Event that blocks conversion of rental estimates to Sales Orders when credit and insurance requirements are not met.

---

## 2. Business Goal
Prevent order conversion when customer credit limit or certificate of insurance conditions are not satisfied.

---

## 3. User Story
As a sales user, when converting rental estimates, I want conversions blocked if credit or insurance rules fail, so that compliance is enforced.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeSubmit | createdfrom | Sales Order create from rental estimate form | Validate COI and credit limit; block conversion if invalid |

---

## 5. Functional Requirements
- Run beforeSubmit on Sales Order create.
- If created from a rental estimate form, check customer COI and credit limit.
- Throw errors when COI is missing/expired and waiver is not set.
- Throw errors when order exceeds credit limit and do-not-enforce is not set.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- estimate
- customer

### Fields Referenced
- estimate | custbody_sna_hul_custcredit_limit | Credit limit
- estimate | custbody_sna_hul_waive_insurance | Waive insurance flag
- estimate | custbody_sna_hul_donotenforce | Do not enforce credit
- customer | custentity_sna_cert_of_insurance | COI file
- customer | custentity_sna_hul_date_of_exp_coi | COI expiry

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing COI without waiver blocks conversion.
- Credit limit exceeded without override blocks conversion.
- Lookup errors are logged.

---

## 8. Implementation Notes (Optional)
- Uses script parameter `custscript_sna_rentalestform` for rental estimate form ID.

---

## 9. Acceptance Criteria
- Given a rental estimate without valid COI and waiver, when converting, then conversion is blocked.
- Given a rental estimate exceeding credit without override, when converting, then conversion is blocked.

---

## 10. Testing Notes
- Rental estimate with valid COI and credit limit converts successfully.
- Missing COI without waiver blocks conversion.
- Credit limit exceeded without override blocks conversion.
- Deploy User Event on Sales Order.

---

## 11. Deployment Notes
- Confirm rental estimate form ID parameter.
- Deploy User Event on Sales Order and validate conversion error messages.
- Monitor logs for conversion errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should credit limit checks apply to non-rental estimates?

---
