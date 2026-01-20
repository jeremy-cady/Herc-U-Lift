# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-JEForWarranty
title: Invoice Warranty Claim Validation Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_jeforwarranty.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Revenue Stream (custom or segment record, via saved search)

---

## 1. Overview
A client script that enforces warranty claim ID entry on invoices when warranty-related revenue streams are present.

---

## 2. Business Goal
Prevent invoices with warranty revenue from being saved without a claim ID.

---

## 3. User Story
As a billing user, when an invoice includes warranty revenue, I want a claim ID required, so that warranty tracking is complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| saveRecord | cseg_sna_revenue_st, custbody_sna_inv_claimid | warranty revenue streams present and claim ID missing | Alert and block save |

---

## 5. Functional Requirements
- On save, collect all revenue stream IDs from invoice lines.
- Load a saved search (ID from script parameter) to identify revenue streams flagged for warranty.
- If any warranty revenue streams are detected and `custbody_sna_inv_claimid` is empty, alert the user and block save.
- If no warranty revenue streams are found or claim ID is present, save proceeds.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Revenue Stream (custom or segment record, via saved search)

### Fields Referenced
- Invoice | custbody_sna_inv_claimid
- Invoice | custbody_sna_jeforwarranty
- Line | cseg_sna_revenue_st
- Revenue Stream | custrecord_sn_for_warranty
- Script parameter | custscript_sna_hul_revstr

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invoice with warranty revenue stream and no claim ID; save blocked.
- Invoice with no warranty revenue stream; save allowed.
- Saved search missing should not allow warranty invoices without a claim ID.

---

## 8. Implementation Notes (Optional)
- Requires a valid saved search ID in script parameters.

---

## 9. Acceptance Criteria
- Given warranty revenue streams present, when saving without a claim ID, then save is blocked with an alert.
- Given no warranty revenue streams or claim ID present, when saving, then save proceeds.

---

## 10. Testing Notes
- Invoice with warranty revenue stream and claim ID; save succeeds.
- Invoice with warranty revenue stream and no claim ID; save blocked.
- Invoice without warranty revenue stream; save succeeds.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_jeforwarranty.js`.
- Deploy to invoice form.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script ignore warranty streams when the claim ID is present but empty string?
- Risk: Saved search parameter missing or invalid.

---
