# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-ModSalesTax
title: Sales Tax Module (Internal Revenue Stream)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: module
  file: FileCabinet/SuiteScripts/sna_hul_mod_sales_tax.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (customrecord_cseg_sna_revenue_st)

---

## 1. Overview
A shared module that determines whether a revenue stream is internal and returns that flag for downstream tax handling.

---

## 2. Business Goal
Centralize the lookup of internal revenue stream flags used by other scripts to set tax behavior.

---

## 3. User Story
As a developer, when I need tax logic, I want a central revenue stream check, so that tax logic is consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| module call | cseg_sna_revenue_st | updateLines invoked | Return internal revenue stream flag |

---

## 5. Functional Requirements
- `updateLines` must read `cseg_sna_revenue_st` from the record.
- Look up `custrecord_sna_hul_revstreaminternal` on the revenue stream record.
- Return true when the revenue stream is internal.
- Read script parameter `custscript_sna_tax_nontaxable` for downstream use.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (customrecord_cseg_sna_revenue_st)

### Fields Referenced
- Transaction | cseg_sna_revenue_st
- Revenue Stream | custrecord_sna_hul_revstreaminternal
- Script parameter | custscript_sna_tax_nontaxable

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Revenue stream missing; return false.
- Lookup fails; return false without crash.

---

## 8. Implementation Notes (Optional)
- Module does not apply tax settings itself.

---

## 9. Acceptance Criteria
- Given internal revenue stream, when evaluated, then the module returns true.

---

## 10. Testing Notes
- Revenue stream marked internal returns true.
- Revenue stream missing; returns false.

---

## 11. Deployment Notes
- Upload `sna_hul_mod_sales_tax.js`.
- Ensure dependent scripts reference the module.
- Rollback: remove module or revert dependent scripts to prior logic.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the module apply tax codes directly when internal is true?
- Risk: Downstream scripts expect side effects.

---
