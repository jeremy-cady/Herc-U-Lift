# PRD: Invoice PDF and Warranty Print

**PRD ID:** PRD-UNKNOWN-InvoicePdf
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_invoicepdf.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that prepares invoice data for printing and adds a Print Warranty button on invoice forms.

**What problem does it solve?**
Provides structured item, task, and equipment data for warranty printing and adds a UI button to trigger warranty printing.

**Primary Goal:**
Expose invoice data needed for warranty printouts and add a Print Warranty button.

---

## 2. Goals

1. Build and attach item/task/equipment data for invoice print context.
2. Add the Print Warranty button to invoice forms.
3. Surface revenue stream warranty vendor data for non-create invoice views.

---

## 3. User Stories

1. **As a** billing user, **I want to** print warranty details from invoices **so that** warranty documentation is complete.

---

## 4. Functional Requirements

### Core Functionality

1. On print context, the script must add longtext fields and set JSON data for items, tasks, meter readings, and equipment info.
2. On non-print contexts, the script must add a Print Warranty button and attach the client script.
3. The script must look up revenue stream warranty vendor data and store it in a longtext field when viewing or editing invoices.

### Acceptance Criteria

- [ ] Print context fields contain JSON data for item/task/equipment lists.
- [ ] Print Warranty button appears on invoice form (non-print, non-delete).
- [ ] Revenue stream warranty vendor data is available on view/edit.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render PDFs directly.
- Modify invoice line data.

---

## 6. Design Considerations

### User Interface
- Adds a Print Warranty button on invoices.

### User Experience
- Warranty print data is embedded for print rendering.

### Design References
- Client script: `SuiteScripts/sna_hul_cs_sales_order_consolidate.js`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- supportcase
- task
- customrecord_nxc_mr
- customrecord_nx_asset

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Invoice print data and button
- [ ] Client Script - Warranty print action

**Custom Fields:**
- invoice | custbody_nx_case | Case reference
- invoice | custbody_nx_task | Task reference
- invoice line | custcol_sna_do_not_print | Do not print flag
- invoice line | custcol_ava_taxamount | Tax amount
- invoice line | custcol_sn_for_warranty_claim | Warranty claim flag
- invoice line | custcol_sna_hul_rev_streams_warranty | Warranty rev stream flag
- revenue stream | custrecord_sna_hul_do_not_print | Do not print flag
- revenue stream | custrecord_sna_vendor_warranty | Warranty vendor
- revenue stream | custrecord_sna_hul_vendor_warranty_addr | Warranty vendor address

**Saved Searches:**
- Invoice line search for printable items and warranty data.
- Task and case searches for warranty details.

### Integration Points
- Client script `sna_hul_cs_sales_order_consolidate.js` for Print Warranty button action.

### Data Requirements

**Data Volume:**
- Searches for invoice lines, cases, tasks, and equipment info.

**Data Sources:**
- Invoice lines, case/task records, and equipment asset data.

**Data Retention:**
- Writes longtext fields on the form for print rendering only.

### Technical Constraints
- Longtext fields are added only in print context and not persisted to the record.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Warranty printing client logic

### Governance Considerations

- **Script governance:** Multiple searches per print request.
- **Search governance:** Invoice/task/case searches can be heavy.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Warranty printouts include item, task, and equipment details.

**How we'll measure:**
- Validate print output data on sample invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_invoicepdf.js | User Event | Provide invoice print data and button | Implemented |

### Development Approach

**Phase 1:** Print data
- [ ] Validate item/task/equipment JSON data

**Phase 2:** UI button
- [ ] Validate Print Warranty button and client script

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Print invoice and verify item/task/equipment data fields are present.
2. View invoice and confirm Print Warranty button appears.

**Edge Cases:**
1. Invoice without case/task still prints with empty task data.

**Error Handling:**
1. Search errors are logged without blocking print.

### Test Data Requirements
- Invoice with case and task data

### Sandbox Setup
- Deploy User Event on Invoice and ensure client script exists.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing roles

**Permissions required:**
- View invoices, cases, and tasks

### Data Security
- Warranty data should be limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm client script path and permissions

### Deployment Steps

1. Deploy User Event on Invoice.
2. Validate print and button behavior.

### Post-Deployment

- [ ] Monitor logs for search errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Remove Print Warranty button from forms.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Start | | | |
| Development Complete | | | |
| Testing Complete | | | |
| Stakeholder Review | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should task data include additional task fields for printing?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large task lists impact print performance | Low | Med | Limit search results or paginate if needed |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
