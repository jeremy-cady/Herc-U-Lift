# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ReclassWIPAccount
title: Reclass WIP Account Module
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: module
  file: FileCabinet/SuiteScripts/sn_hul_mod_reclasswipaccount.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Item Fulfillment
  - Journal Entry

---

## 1. Overview
A shared module that reclasses COGS to WIP by creating or reversing Journal Entries tied to item fulfillments and invoices.

---

## 2. Business Goal
Ensure WIP accounting entries are created or reversed consistently across workflows and integrations.

---

## 3. User Story
As an accounting user, when WIP reclass logic runs, I want WIP JEs created and reversed correctly, so that WIP balances are accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Module call | custbody_sna_hul_je_wip | reclassWIPAccount invoked | Create WIP JE and tag fulfillments |
| Module call | custbody_sna_hul_inv_wip | reverseWIPAccount invoked | Reverse WIP JE tied to invoice |

---

## 5. Functional Requirements
- Support `reclassWIPAccount` for invoices and item fulfillments.
- Locate related item fulfillments for invoices and build JE lines from saved searches.
- Create a Journal Entry with debit/credit lines for WIP reclass.
- Tag item fulfillments with created JE IDs in `custbody_sna_hul_je_wip`.
- Support `reverseWIPAccount` to reverse JEs tied to an invoice.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Item Fulfillment
- Journal Entry

### Fields Referenced
- Item Fulfillment | custbody_sna_hul_je_wip
- Item Fulfillment | custbody_sn_removed_lines
- Journal Entry | custbody_sna_hul_inv_wip
- Journal Entry | custbody_sna_hul_so_wip

Schemas (if known):
- Saved searches: customsearch_sna_hul_if_custom_gl, customsearch_sn_hul_invoiceif_custom_new, customsearch_sna_hul_invoiceif_custom_2

---

## 7. Validation & Edge Cases
- Missing fulfillment IDs; no JE created.
- Missing WIP account; no JE created.
- Reverse for invoice with no JEs; no action.

---

## 8. Implementation Notes (Optional)
- WIP account parameter is required for JE creation.
- Saved searches must exist and return expected columns.
- Performance/governance considerations: multiple searches, JE creation, and submitFields operations.

---

## 9. Acceptance Criteria
- Given eligible invoice/fulfillment data, when reclassWIPAccount runs, then WIP JEs are created with correct accounts, segments, and amounts.
- Given WIP JEs are created, when reclassWIPAccount runs, then item fulfillments are tagged with WIP JE IDs.
- Given an invoice with WIP JEs, when reverseWIPAccount runs, then the JEs are reversed with a reversal date.

---

## 10. Testing Notes
- Run reclass for invoice; verify JE creation and fulfillment tagging.
- Missing fulfillment IDs; confirm no JE created.
- Missing WIP account; confirm no JE created.
- Reverse for invoice with no JEs; confirm no action.

---

## 11. Deployment Notes
- Upload `sn_hul_mod_reclasswipaccount.js`.
- Ensure scripts referencing the module are deployed.
- Verify saved searches and parameters.
- Rollback: disable calling scripts or revert to previous module version.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should saved search IDs be parameters instead of hardcoded?
- Risk: Missing or changed saved search IDs.
- Risk: JE creation fails due to segment mismatch.

---
