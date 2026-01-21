# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CreateJEFromInternalBillingTask
title: Flag Invoice Lines from Internal Billing Task
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_create_je_from_internal_billing_task.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD
  - invoice

---

## 1. Overview
User Event that flags invoice lines as processed when an Internal Billing Task is created.

---

## 2. Business Goal
Prevent duplicate processing of invoice lines tied to internal billing tasks.

---

## 3. User Story
As an internal billing user, when an internal billing task is created, I want invoice lines flagged as processed, so that downstream workflows avoid reprocessing.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | Internal billing task fields | create | Flag linked invoice lines as processed |

---

## 5. Functional Requirements
- Run afterSubmit on Internal Billing Task create.
- Read `custrecord_sna_internal_billing_line_id` and `custrecord_sna_hul_linked_invoice`.
- Set `custcol_sn_internal_billing_processed` to true for matching invoice lines.

---

## 6. Data Contract
### Record Types Involved
- TBD
- invoice

### Fields Referenced
- Internal billing task | custrecord_sna_internal_billing_line_id | Comma-delimited invoice line IDs
- Internal billing task | custrecord_sna_hul_linked_invoice | Linked invoice ID
- invoice line | custcol_sn_internal_billing_processed | Processed flag

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing invoice ID skips processing.
- Invoice save errors are logged.
- Line IDs are parsed from a comma-delimited string.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One invoice load/save per task.

---

## 9. Acceptance Criteria
- Given an internal billing task with linked invoice and line IDs, when afterSubmit runs, then specified invoice lines are flagged as processed.
- Given a task without a linked invoice, when afterSubmit runs, then no invoice updates occur.

---

## 10. Testing Notes
- Create internal billing task with invoice line IDs and confirm lines are flagged.
- Missing invoice ID skips processing.
- Deploy User Event on internal billing task record.

---

## 11. Deployment Notes
- Confirm internal billing task record type and field IDs.
- Deploy User Event on internal billing task record and validate invoice line flags.
- Monitor logs for invoice update errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should the script validate line IDs against item IDs?

---
