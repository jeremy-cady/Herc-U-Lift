# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CustPaymentGL
title: Customer Payment Custom GL Plugin
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: custom_gl
  file: FileCabinet/SuiteScripts/SNA/sna_hul_customer_payment_gl_plugin.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer Payment
  - Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

---

## 1. Overview
A Custom GL plugin that reclassifies customer payment GL impact for internal revenue stream transactions.

## 2. Business Goal
Ensures internal billing customer payments hit internal WIP and expense accounts instead of default accounts.

## 3. User Story
As an accountant, when customer payments are internal, I want internal payment lines reclassified, so that internal billing is accurate.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `cseg_sna_revenue_st` | Internal revenue stream | Create custom GL lines using internal accounts |

## 5. Functional Requirements
- The system must run only for Customer Payment records.
- The system must look up revenue stream internal flags and account mappings from `customrecord_cseg_sna_revenue_st`.
- If the revenue stream is not internal, the system must exit without changes.
- For each standard GL line, the system must create a custom debit line to `custrecord_sna_hul_int_bill_expense` when credit is zero and a custom credit line to `custrecord_sna_hul_int_bill_wip` when debit is zero.
- The system must copy department, entity, location, memo, tax, and segment values to custom lines.
- The system must log audit details for line counts and debit/credit distributions.

## 6. Data Contract
### Record Types Involved
- Customer Payment
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

### Fields Referenced
- Revenue Stream | `custrecord_sna_hul_int_bill_expense`
- Revenue Stream | `custrecord_sna_hul_int_bill_wip`
- Revenue Stream | `custrecord_sna_hul_revstreaminternal`
- Segment field | `cseg_sna_revenue_st`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Missing account mapping results in null account; verify error logging.
- Revenue stream not internal; no custom lines added.
- Lookup failure logs error and prevents custom line creation.

## 8. Implementation Notes (Optional)
- Uses `customLines.addNewLine()` to create GL lines.
- Requires valid account mappings on the revenue stream record.

## 9. Acceptance Criteria
- Given internal revenue stream payments, when the plugin runs, then custom GL lines are created with mapped accounts.
- Given external revenue streams, when the plugin runs, then no custom lines are created.
- Given custom lines are created, when the plugin runs, then segment values are retained.

## 10. Testing Notes
- Internal revenue stream payment generates custom lines with mapped accounts.
- Missing account mapping results in null account; verify error logging.
- Revenue stream not internal; no custom lines added.
- Lookup failure logs error and prevents custom line creation.

## 11. Deployment Notes
- Upload `sna_hul_customer_payment_gl_plugin.js`.
- Deploy as a Custom GL Plugin for Customer Payment.
- Validate GL impact on internal payment transactions.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the plugin validate account mappings before posting?
- Should the plugin handle split revenue streams per line?
- Risk: Missing internal account mappings (Mitigation: Add validation and error alerts)
- Risk: Custom GL lines increase posting time (Mitigation: Keep line processing minimal)

---
