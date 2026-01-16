# PRD: Invoice Document Numbering and JE Creation

**PRD ID:** PRD-UNKNOWN-Invoice
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_invoice.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event on Invoice that updates document numbers, triggers WIP reclass journal entries, and creates warranty JEs.

**What problem does it solve?**
Ensures invoice numbering matches Sales Order sequencing and automates accounting reclass and warranty entries.

**Primary Goal:**
Generate invoice document numbers and initiate accounting journal entries on invoice creation/edit.

---

## 2. Goals

1. Set invoice document numbers based on Sales Order document number and prior invoices.
2. Trigger WIP reclass journal entries for invoice creation and edits.
3. Create warranty journal entries for invoice changes.

---

## 3. User Stories

1. **As a** billing user, **I want to** auto-number invoices from Sales Orders **so that** document sequences are consistent.
2. **As a** finance user, **I want to** auto-create JEs **so that** WIP and warranty accounting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On create, the script must set the invoice `tranid` based on the Sales Order `tranid` plus sequence.
2. For bulk operations, the script must update the document number in beforeSubmit.
3. The script must set `custbody_sn_related_if` when an item fulfillment ID is in the entry form query string.
4. On create, the script must call the COGS JE suitelet and reclass WIP.
5. On edit (UI or CSV), the script must create or reclass WIP based on `custbody_sna_inv_create_je`.
6. The script must invoke the warranty JE library on non-delete actions.

### Acceptance Criteria

- [ ] Invoices created from Sales Orders receive sequenced document numbers.
- [ ] WIP reclass JEs are created on create/edit conditions.
- [ ] Warranty JE creation is invoked on non-delete actions.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify invoices not created from Sales Orders.
- Create JEs when the invoice is deleted.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Document numbers and accounting entries are created automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- salesorder
- journalentry

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - COGS JE creation
- [ ] RESTlet - N/A
- [x] User Event - Document numbering and JE triggers
- [ ] Client Script - N/A

**Custom Fields:**
- invoice | createdfrom | Source Sales Order
- invoice | custbody_sna_hul_last_invoice_seq | Last invoice sequence
- invoice | entryformquerystring | Form query string
- invoice | custbody_sn_related_if | Related item fulfillment
- invoice | custbody_sna_inv_create_je | Create JE flag

**Saved Searches:**
- Searches for existing invoices to determine sequence number.

### Integration Points
- Suitelet `customscript_sna_hul_bksl_createcogsje` for JE creation.
- Libraries: `./sn_hul_mod_reclasswipaccount`, `./SNA/sna_hul_mod_invoiceWarrantyJe`.

### Data Requirements

**Data Volume:**
- One invoice search for each created invoice.

**Data Sources:**
- Sales Order document numbers and existing invoices.

**Data Retention:**
- Updates invoice `tranid`; triggers JEs.

### Technical Constraints
- Uses query string to detect bulk operations and item fulfillment IDs.

### Dependencies
- **Libraries needed:** `./sn_hul_mod_reclasswipaccount`, `./SNA/sna_hul_mod_invoiceWarrantyJe`
- **External dependencies:** COGS JE suitelet
- **Other features:** WIP reclass process

### Governance Considerations

- **Script governance:** Multiple searches and suitelet calls per invoice.
- **Search governance:** Invoice lookups for numbering and JE checks.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoice document numbers align with Sales Orders and JEs are created as expected.

**How we'll measure:**
- Review invoice tranid formats and related JE activity.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_invoice.js | User Event | Invoice numbering and JE triggers | Implemented |

### Development Approach

**Phase 1:** Document numbering
- [ ] Validate numbering logic for bulk and non-bulk creates

**Phase 2:** JE creation
- [ ] Validate COGS and warranty JE creation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create invoice from Sales Order and verify `tranid` sequencing.
2. Create invoice and verify WIP reclass JE creation.

**Edge Cases:**
1. Bulk invoice creation still updates document number.
2. Edit without Create JE flag does not create new JE.

**Error Handling:**
1. Suitelet or library errors are logged.

### Test Data Requirements
- Sales Order with multiple invoices and warranty items

### Sandbox Setup
- Deploy User Event on Invoice and ensure suitelet is available.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing and finance roles

**Permissions required:**
- Create journal entries
- View and edit invoices

### Data Security
- Financial entries restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm suitelet deployment IDs and library availability

### Deployment Steps

1. Deploy User Event on Invoice.
2. Validate document numbering and JE creation.

### Post-Deployment

- [ ] Monitor JE creation logs

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually adjust invoice numbering or JEs if needed.

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

- [ ] Should document numbering consider voided invoices?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Suitelet failures prevent JE creation | Low | High | Monitor logs and re-run JE creation manually |

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
