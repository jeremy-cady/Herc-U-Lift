# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-GenerateMiscFeePrintPdf
title: Generate Misc Fee and Invoice PDF Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_generate_misc_fee_print_pdf.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Invoice
  - Custom Record (customrecord_sna_service_code_type)
  - Support Case
  - Task
  - Custom Record (customrecord_nxc_mr)
  - Custom Record (customrecord_nx_asset)

---

## 1. Overview
A client script that generates MISC fee lines on invoices and prepares invoice data for PDF printing using a Suitelet.

---

## 2. Business Goal
Automate service shop fee calculations and ensure invoice data is available for PDF generation before saving.

---

## 3. User Story
As a billing user, when I generate MISC fees or print invoices, I want fees calculated automatically and PDFs prepared, so that invoices are accurate and printable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| client action | custbody_sna_misc_fee_allowed, custbody_sna_misc_fee_generated | allowed and not generated | Calculate and add MISC fee lines |
| client action | custbody_sna_invoice_json | print requested | Build invoice JSON and open PDF Suitelet |

---

## 5. Functional Requirements
- Verify `custbody_sna_misc_fee_allowed` is true and `custbody_sna_misc_fee_generated` is false before generating fees.
- Group invoice lines by service code type and revenue stream, compute a shop fee percent, and apply min/max limits.
- Add an Other Charge item line with the calculated fee and set service code type and revenue stream on the line.
- Set `custbody_sna_misc_fee_generated` to true after adding fee lines.
- When generating a PDF, warn if MISC fee has not been generated and allow users to proceed or cancel.
- Build and store invoice JSON in `custbody_sna_invoice_json` and open the PDF Suitelet.
- The PDF UI loads invoice JSON from the opener and sets the template file ID.

---

## 6. Data Contract
### Record Types Involved
- Invoice
- Custom Record (customrecord_sna_service_code_type)
- Support Case
- Task
- Custom Record (customrecord_nxc_mr)
- Custom Record (customrecord_nx_asset)

### Fields Referenced
- Invoice | custbody_sna_misc_fee_allowed
- Invoice | custbody_sna_misc_fee_generated
- Invoice | custbody_sna_invoice_json
- Invoice | custbody_nx_case
- Invoice | custbody_sna_cp_email_paylink
- Invoice | custbody_sna_hul_nxc_eq_asset
- Invoice | custbody_sna_contact
- Invoice | custpage_equipmentinfo
- Invoice | custpage_meterreading
- Invoice | custpage_tasklist
- Line | custcol_sna_so_service_code_type
- Line | cseg_sna_revenue_st
- Line | custcol_sna_do_not_print
- Line | custcol_sna_default_rev_stream
- Line | custcol_sna_hul_rent_start_date
- Line | custcol_sna_hul_rent_end_date
- Line | custcol_sna_object
- Line | cseg_hul_mfg
- Line | custcol_sna_hul_obj_model
- Line | custcol_sna_obj_serialno
- Line | custcol_sna_hul_fleet_no
- Line | custcol_ava_taxamount
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
- MISC fee already generated; prevent duplicate generation.
- Invoice with no service code type or revenue stream lines.
- Unsupported custom form shows user alert and stops.

---

## 8. Implementation Notes (Optional)
- Uses Suitelet `customscript_sna_hul_sl_misc_fee_pdf` for PDF rendering.
- Uses `window.opener` to read invoice JSON and form ID.
- XML escaping replaces control characters in descriptions.

---

## 9. Acceptance Criteria
- Given MISC fee calculation runs, when completed, then fee line items are added with correct amounts and segments.
- Given PDF generation is requested, when invoked, then the Suitelet opens and uses stored invoice JSON.

---

## 10. Testing Notes
- Generate MISC fee and verify added line item values.
- Generate PDF and confirm Suitelet opens with correct invoice data.
- MISC fee already generated; verify no duplicate line added.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_generate_misc_fee_print_pdf.js`.
- Deploy to invoice forms and ensure PDF Suitelet is available.
- Rollback: remove the client script deployment from invoice forms.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should unsupported custom forms be added to the template map?
- Risk: Large invoices slow client processing.
- Risk: Missing service code type config.

---
