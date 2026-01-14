# PRD: Invoice Warranty Journal Entry Module

**PRD ID:** PRD-UNKNOWN-InvoiceWarrantyJE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mod_invoiceWarrantyJe.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A module that creates or updates a warranty journal entry for invoice line items flagged for warranty recognition.

**What problem does it solve?**
Automates warranty recognition postings by creating balanced JE lines and applying the JE as a customer payment credit.

**Primary Goal:**
Generate warranty journal entries from invoice lines and link them to the invoice.

---

## 2. Goals

1. Identify warranty-eligible invoice lines by revenue stream criteria.
2. Post balanced debit/credit JE lines for each warranty-eligible line.
3. Link the JE to the invoice and apply it as a payment credit.

---

## 3. User Stories

1. **As an** accountant, **I want** warranty JEs created automatically **so that** warranty revenue is recognized properly.
2. **As an** admin, **I want** JE links stored on invoices **so that** audit trails are clear.
3. **As a** developer, **I want** reusable warranty logic **so that** other scripts can call it.

---

## 4. Functional Requirements

### Core Functionality

1. The system must gather invoice line items including amount, service code, revenue stream, and segment values.
2. The system must determine warranty eligibility using `custrecord_sn_for_warranty` on the revenue stream.
3. The system must map service codes to GL accounts using `customsearch_sna_servicecode_lookup`.
4. For warranty-eligible lines, the system must create JE lines:
   - Debit the mapped GL account (or default warranty account if claim).
   - Credit the invoice account.
5. The system must set JE header fields including subsidiary, revenue stream, and invoice/claim references.
6. The system must save the JE and store its ID on the invoice (`custbody_sna_jeforwarranty`).
7. The system must create a customer payment applying the JE against the invoice.

### Acceptance Criteria

- [ ] Warranty-eligible invoice lines generate matching JE debit/credit lines.
- [ ] JE is linked to the invoice in `custbody_sna_jeforwarranty`.
- [ ] A customer payment is created applying the JE credit.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle invoices with no warranty-eligible lines.
- Validate service code mappings beyond search results.
- Manage JE reversal or voiding.

---

## 6. Design Considerations

### User Interface
- None (server-side module).

### User Experience
- Warranty recognition happens automatically after invoice creation.

### Design References
- Revenue stream warranty flag and service code GL mapping search.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Journal Entry
- Customer Payment
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Consuming scripts likely call this module
- [ ] Client Script - Not used

**Custom Fields:**
- Invoice | `custbody_sna_jeforwarranty`, `custbody_sna_inv_claimid`
- Invoice line | `custcol_sn_for_warranty_claim`, `custcol_sna_service_itemcode`
- Revenue Stream | `custrecord_sn_for_warranty`
- JE | `custbody_sna_invforwarranty`, `custbody_sna_claim_id`

**Saved Searches:**
- `customsearch_sna_servicecode_lookup`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One JE line pair per warranty-eligible invoice line.

**Data Sources:**
- Invoice line fields and revenue stream/service code data.

**Data Retention:**
- JE links stored on invoice and payment created.

### Technical Constraints
- Uses dynamic JE creation and line insertion at index 0.
- Uses current user preference `custscript_sna_default_warranty_accnt` as fallback account.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Caller must pass invoice context with lines loaded.

### Governance Considerations
- Multiple record loads/saves and a payment transform per invoice.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Warranty JEs are created and applied for eligible invoice lines.

**How we'll measure:**
- Verify JE and payment linkage on sample invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mod_invoiceWarrantyJe.js | Library | Warranty JE creation for invoices | Implemented |

### Development Approach

**Phase 1:** Identify eligible lines
- [x] Check revenue stream warranty flags and service code mappings.

**Phase 2:** Create JE and payment
- [x] Build JE lines, save JE, and apply as payment.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with warranty-eligible lines creates a JE and payment.

**Edge Cases:**
1. No eligible lines; no JE should be created.
2. Missing service code mapping; fallback to default warranty account when claim.

**Error Handling:**
1. JE save fails; error logged.

### Test Data Requirements
- Invoice with revenue stream flagged for warranty and service code mappings.

### Sandbox Setup
- Module called from a User Event or Map/Reduce on invoice creation.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with create/edit access to invoices, JEs, and payments.

**Permissions required:**
- Create Journal Entry
- Create Customer Payment
- Edit Invoice

### Data Security
- No external data transmitted.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_mod_invoiceWarrantyJe.js`.
2. Ensure calling script invokes `createWarrantyJournalEntry`.
3. Validate JE creation on invoice creation.

### Post-Deployment

- [ ] Verify JE linkage and customer payment creation.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the calling script or remove the module usage.

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

- [ ] Should warranty JEs be created only on create events?
- [ ] Should payment creation be optional?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large invoices create many JE lines | Med | Med | Consider grouping lines by account |
| Payment transform fails due to missing credit lines | Low | Med | Add validation before payment creation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x record.transform and record.create

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
