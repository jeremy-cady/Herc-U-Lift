# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InvoicePdf
title: Invoice PDF and Warranty Print
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_invoicepdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice
  - supportcase
  - task
  - customrecord_nxc_mr
  - customrecord_nx_asset

---

## 1. Overview
User Event that prepares invoice data for printing and adds a Print Warranty button on invoice forms.

---

## 2. Business Goal
Provide structured item, task, and equipment data for warranty printing and add a UI button to trigger warranty printing.

---

## 3. User Story
As a billing user, when viewing or printing invoices, I want warranty details available and printable, so that warranty documentation is complete.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Form fields | print context | Add longtext fields with JSON for items, tasks, meter readings, equipment |
| beforeLoad | Form fields | non-print, non-delete | Add Print Warranty button and attach client script |
| beforeLoad | Revenue stream data | view/edit | Store warranty vendor data in longtext field |

---

## 5. Functional Requirements
- On print context, add longtext fields and set JSON data for items, tasks, meter readings, and equipment info.
- On non-print contexts, add a Print Warranty button and attach the client script.
- Look up revenue stream warranty vendor data and store it in a longtext field when viewing or editing invoices.

---

## 6. Data Contract
### Record Types Involved
- invoice
- supportcase
- task
- customrecord_nxc_mr
- customrecord_nx_asset

### Fields Referenced
- invoice | custbody_nx_case | Case reference
- invoice | custbody_nx_task | Task reference
- invoice line | custcol_sna_do_not_print | Do not print flag
- invoice line | custcol_ava_taxamount | Tax amount
- invoice line | custcol_sn_for_warranty_claim | Warranty claim flag
- invoice line | custcol_sna_hul_rev_streams_warranty | Warranty rev stream flag
- revenue stream | custrecord_sna_hul_do_not_print | Do not print flag
- revenue stream | custrecord_sna_vendor_warranty | Warranty vendor
- revenue stream | custrecord_sna_hul_vendor_warranty_addr | Warranty vendor address

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Invoice without case/task still prints with empty task data.
- Search errors are logged without blocking print.
- Longtext fields are added only in print context and not persisted to the record.

---

## 8. Implementation Notes (Optional)
- Client script: `SuiteScripts/sna_hul_cs_sales_order_consolidate.js`.
- Performance/governance considerations: Invoice/task/case searches can be heavy.

---

## 9. Acceptance Criteria
- Given print context, when beforeLoad runs, then item/task/equipment JSON data is available.
- Given view/edit context, when beforeLoad runs, then revenue stream warranty vendor data is available and Print Warranty button appears.

---

## 10. Testing Notes
- Print invoice and verify item/task/equipment data fields are present.
- View invoice and confirm Print Warranty button appears.
- Invoice without case/task still prints with empty task data.
- Deploy User Event on Invoice and ensure client script exists.

---

## 11. Deployment Notes
- Confirm client script path and permissions.
- Deploy User Event on Invoice and validate print and button behavior.
- Monitor logs for search errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should task data include additional task fields for printing?

---
