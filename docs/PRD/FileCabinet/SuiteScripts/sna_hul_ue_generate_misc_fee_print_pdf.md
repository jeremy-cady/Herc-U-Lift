# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateMiscFeePrintPdf
title: Generate Misc Fee and PDF Buttons
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_generate_misc_fee_print_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - invoice

---

## 1. Overview
User Event that adds "Generate PDF" and "Generate MISC Fee" buttons to invoices before saving.

---

## 2. Business Goal
Provide quick UI actions to generate PDFs or misc fee calculations from the invoice form.

---

## 3. User Story
As a billing user, when working an invoice, I want to generate PDFs and misc fee actions from the form, so that I can complete invoice processing quickly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| beforeLoad | Invoice form | create/edit | Add "Generate PDF" and "Generate MISC Fee" buttons and attach client script |

---

## 5. Functional Requirements
- Run beforeLoad on invoice create/edit.
- Attach client script `sna_hul_cs_generate_misc_fee_print_pdf.js`.
- Add the two buttons and wire them to client functions.

---

## 6. Data Contract
### Record Types Involved
- invoice

### Fields Referenced
- None.

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Buttons are not added in view or delete modes.
- Button add errors are logged.

---

## 8. Implementation Notes (Optional)
- Client script functions `generatePDF` and `generateMiscFee`.

---

## 9. Acceptance Criteria
- Given an invoice in create/edit, when beforeLoad runs, then both buttons are visible.
- Given an invoice in view mode, when beforeLoad runs, then buttons are not added.

---

## 10. Testing Notes
- Open invoice in edit mode and verify both buttons.
- View mode does not show buttons.
- Deploy User Event on invoice and include client script.

---

## 11. Deployment Notes
- Confirm client script file exists.
- Deploy User Event on Invoice and verify buttons on form.
- Monitor logs for UI errors; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should buttons be hidden for non-misc fee invoices?

---
