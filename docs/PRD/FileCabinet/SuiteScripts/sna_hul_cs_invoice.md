# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvoiceOtCharges
title: Invoice OT Charges Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_invoice.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice

---

## 1. Overview
A client script that inserts overtime or damage lines onto an invoice when the invoice is created in copy mode.

---

## 2. Business Goal
Carry stored OT charge line data onto new invoices without manual re-entry.

---

## 3. User Story
As a billing user, when I copy an invoice, I want OT charge lines recreated, so that I do not manually add them.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custbody_sna_rent_otcharges | copy mode and JSON present | Parse JSON and add item lines |

---

## 5. Functional Requirements
- On page init in copy mode, read `custbody_sna_rent_otcharges`.
- If OT charges JSON is present, parse it and add item lines with item, quantity, and rate.
- Commit each parsed line to the invoice item sublist.

---

## 6. Data Contract
### Record Types Involved
- Invoice

### Fields Referenced
- Invoice | custbody_sna_rent_otcharges

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- `custbody_sna_rent_otcharges` is empty or invalid JSON.
- Only runs in copy mode.

---

## 8. Implementation Notes (Optional)
- Uses `N/currentRecord`.

---

## 9. Acceptance Criteria
- Given a copied invoice with OT charges JSON, when the form loads, then OT charge lines are added.

---

## 10. Testing Notes
- Copy an invoice with `custbody_sna_rent_otcharges` populated; verify lines added.
- JSON empty or invalid; verify load does not fail.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_invoice.js`.
- Deploy to invoice form where copy is used.
- Rollback: remove the client script deployment from invoice form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script also run on transform mode if different from copy?
- Risk: Invalid JSON causes parse error.

---
