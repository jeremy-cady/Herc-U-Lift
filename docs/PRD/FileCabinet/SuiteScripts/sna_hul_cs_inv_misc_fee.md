# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvMiscFee
title: Invoice MISC Fee Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_inv_misc_fee.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Custom Record (customrecord_sna_service_code_type)

---

## 1. Overview
A client script that adds MISC fee lines to invoices on save based on service code type and revenue stream.

---

## 2. Business Goal
Calculate and insert other charge fees without manual line entry.

---

## 3. User Story
As a billing user, when I save an invoice, I want MISC fees added automatically, so that invoices are complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | custbody_sna_misc_fee_allowed, custbody_sna_misc_fee_generated | allowed and not generated | Calculate and add fee lines |

---

## 5. Functional Requirements
- On save, if `custbody_sna_misc_fee_allowed` is false, do nothing.
- If `custbody_sna_misc_fee_generated` is true, do nothing.
- Group invoice lines by `custcol_sna_so_service_code_type` and `cseg_sna_revenue_st` and sum amounts.
- For each group, calculate a fee using the shop fee percent and min/max from `customrecord_sna_service_code_type`.
- Add a new line with the calculated fee, service code type, revenue stream, quantity 1, and header location.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Custom Record (customrecord_sna_service_code_type)

### Fields Referenced
- Invoice | custbody_sna_misc_fee_allowed
- Invoice | custbody_sna_misc_fee_generated
- Line | cseg_sna_revenue_st
- Line | custcol_sna_so_service_code_type
- Line | amount
- Line | location
- Service Code Type | custrecord_sna_serv_code
- Service Code Type | custrecord_sna_ser_code_type
- Service Code Type | custrecord_sna_shop_fee_code_item
- Service Code Type | custrecord_sna_shop_fee_percent
- Service Code Type | custrecord_sna_min_shop_fee
- Service Code Type | custrecord_sna_max_shop_fee

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No eligible lines; no fee lines added.
- Multiple service code and revenue stream combinations.
- Missing configuration record should skip fee line.

---

## 8. Implementation Notes (Optional)
- Client-side save may be impacted by large line counts.

---

## 9. Acceptance Criteria
- Given MISC fees are allowed and not generated, when the invoice saves, then fee lines are added.
- Given configured min and max limits, when fees are calculated, then amounts respect limits.

---

## 10. Testing Notes
- Save an invoice with service code type and revenue stream lines; verify fee lines added.
- No eligible lines; verify no fee lines added.
- Missing configuration record; verify fee line skipped.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_inv_misc_fee.js`.
- Deploy to invoice forms with MISC fee processing.
- Rollback: remove the client script deployment from invoice forms.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script set `custbody_sna_misc_fee_generated` after inserting lines?
- Risk: Duplicate fees if header flag not updated elsewhere.

---
