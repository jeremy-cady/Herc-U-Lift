# PRD: Generate Misc Fee and Invoice PDF Client Script

**PRD ID:** PRD-UNKNOWN-GenerateMiscFeePrintPdf
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_generate_misc_fee_print_pdf.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_misc_fee_pdf.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that generates MISC fee lines on invoices and prepares invoice data for PDF printing using a Suitelet.

**What problem does it solve?**
It automates service shop fee calculations and ensures invoice data is available for PDF generation before saving.

**Primary Goal:**
Calculate and add MISC fee lines, then generate a printable invoice PDF payload.

---

## 2. Goals

1. Calculate MISC fee lines based on service code type and revenue stream.
2. Prevent duplicate MISC fee generation.
3. Generate invoice JSON and launch a PDF Suitelet.

---

## 3. User Stories

1. **As a** billing user, **I want** MISC fees calculated automatically **so that** invoices are accurate.
2. **As a** billing user, **I want** to generate a PDF before saving **so that** I can review the output.

---

## 4. Functional Requirements

### Core Functionality

1. When generating MISC fees, the system must verify `custbody_sna_misc_fee_allowed` is true and `custbody_sna_misc_fee_generated` is false.
2. The system must group invoice lines by service code type and revenue stream, compute a shop fee percent, and apply min/max limits.
3. The system must add an Other Charge item line with the calculated fee and set service code type and revenue stream on the line.
4. The system must set `custbody_sna_misc_fee_generated` to true after adding fee lines.
5. When generating a PDF, the system must warn if MISC fee has not been generated and allow users to proceed or cancel.
6. The system must build and store invoice JSON in `custbody_sna_invoice_json` and open the PDF Suitelet.
7. The PDF UI must load the invoice JSON from the opener and set the template file ID.

### Acceptance Criteria

- [ ] MISC fee line items are added with correct amounts and segments.
- [ ] PDF generation opens the Suitelet and uses the stored invoice JSON.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate custom form coverage for all invoice types.
- Persist PDF files on the invoice record.

---

## 6. Design Considerations

### User Interface
- Uses confirmation dialogs and opens PDF in a new tab.

### User Experience
- Provides a warning when MISC fees are missing before printing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Custom Record | `customrecord_sna_service_code_type`
- Support Case
- Task
- Custom Record | `customrecord_nxc_mr`
- Custom Record | `customrecord_nx_asset`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - PDF rendering
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Fee and PDF logic

**Custom Fields:**
- Invoice | `custbody_sna_misc_fee_allowed`
- Invoice | `custbody_sna_misc_fee_generated`
- Invoice | `custbody_sna_invoice_json`
- Invoice | `custbody_nx_case`
- Invoice | `custbody_sna_cp_email_paylink`
- Invoice | `custbody_sna_hul_nxc_eq_asset`
- Invoice | `custbody_sna_contact`
- Invoice | `custpage_equipmentinfo`
- Invoice | `custpage_meterreading`
- Invoice | `custpage_tasklist`
- Line | `custcol_sna_so_service_code_type`
- Line | `cseg_sna_revenue_st`
- Line | `custcol_sna_do_not_print`
- Line | `custcol_sna_default_rev_stream`
- Line | `custcol_sna_hul_rent_start_date`
- Line | `custcol_sna_hul_rent_end_date`
- Line | `custcol_sna_object`
- Line | `cseg_hul_mfg`
- Line | `custcol_sna_hul_obj_model`
- Line | `custcol_sna_obj_serialno`
- Line | `custcol_sna_hul_fleet_no`
- Line | `custcol_ava_taxamount`
- Service Code Type | `custrecord_sna_serv_code`
- Service Code Type | `custrecord_sna_ser_code_type`
- Service Code Type | `custrecord_sna_shop_fee_code_item`
- Service Code Type | `custrecord_sna_shop_fee_percent`
- Service Code Type | `custrecord_sna_min_shop_fee`
- Service Code Type | `custrecord_sna_max_shop_fee`

**Saved Searches:**
- None (scripted searches only).

### Integration Points
- Suitelet `customscript_sna_hul_sl_misc_fee_pdf` for PDF rendering.
- Uses `window.opener` to read invoice JSON and form ID.

### Data Requirements

**Data Volume:**
- Invoice line aggregation and related lookups for case and asset data.

**Data Sources:**
- Invoice fields, line fields, case tasks, asset records, service code type configuration.

**Data Retention:**
- Invoice JSON stored in `custbody_sna_invoice_json`.

### Technical Constraints
- Only specific custom forms are fully handled; unsupported forms return an error.
- Uses XML escaping and replaces control characters in descriptions.

### Dependencies
- **Libraries needed:** N/search, N/url, N/xml, N/currentRecord.
- **External dependencies:** None.
- **Other features:** PDF Suitelet and XML templates.

### Governance Considerations
- Client-side searches and lookups can be heavy for large invoices.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- MISC fee lines are added correctly and PDF preview opens with accurate data.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_generate_misc_fee_print_pdf.js | Client Script | Generate MISC fees and PDF payload | Implemented |
| sna_hul_sl_misc_fee_pdf.js | Suitelet | Render invoice PDF | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** MISC fee calculation and line insertion.
- **Phase 2:** PDF JSON assembly and Suitelet launch.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Generate MISC fee and verify added line item values.
2. Generate PDF and confirm Suitelet opens with correct invoice data.

**Edge Cases:**
1. MISC fee already generated.
2. Invoice with no service code type or revenue stream lines.

**Error Handling:**
1. Unsupported custom form should show a user alert and stop.

### Test Data Requirements
- Invoice with service code type and revenue stream values.

### Sandbox Setup
- Deploy client script on invoice form and ensure PDF Suitelet is available.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing users.

**Permissions required:**
- Edit invoices and view related case/task/asset records.

### Data Security
- Uses existing invoice data and does not expose external systems.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet deployment IDs and template files.
- Verify service code type configuration records.

### Deployment Steps
1. Upload `sna_hul_cs_generate_misc_fee_print_pdf.js`.
2. Deploy to invoice forms and the PDF Suitelet.

### Post-Deployment
- Validate MISC fee generation and PDF output.

### Rollback Plan
- Remove the client script deployment from invoice forms.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should unsupported custom forms be added to the template map?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large invoices slow client processing | Med | Med | Consider server-side processing |
| Missing service code type config | Med | Med | Add validation or admin alerts |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
