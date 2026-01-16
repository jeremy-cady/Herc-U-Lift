# PRD: Warranty Journal Entry Creation

**PRD ID:** PRD-UNKNOWN-JEForWarranty
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_jeforwarranty.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates or updates warranty Journal Entries for invoices and auto-applies the JE as a customer payment.

**What problem does it solve?**
Automates warranty accounting entries and applies credits to invoices for warranty claims.

**Primary Goal:**
Create warranty JEs for invoice lines flagged as warranty and apply them to the invoice.

---

## 2. Goals

1. Create or update a JE for warranty invoice lines.
2. Determine warranty accounts based on revenue stream and service code.
3. Auto-apply the JE as a customer payment.

---

## 3. User Stories

1. **As a** finance user, **I want to** create warranty JEs automatically **so that** warranty claims are accounted for consistently.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on invoice create/edit (non-delete).
2. The script must create or reload the JE referenced by `custbody_sna_jeforwarranty`.
3. The script must add debit lines for warranty items and a credit line for the invoice account.
4. The script must set JE fields for subsidiary, revenue stream, invoice, and claim ID.
5. The script must update the invoice with the JE ID and auto-apply it via customer payment.

### Acceptance Criteria

- [ ] Warranty invoice lines create JE debit lines.
- [ ] JE is linked to the invoice and auto-applied as payment.
- [ ] JE uses warranty or claim accounts based on configuration.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create warranty JEs for non-warranty revenue streams.
- Process deleted invoices.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Warranty JEs and payments are created automatically after invoice save.

### Design References
- Saved search: `customsearch_sna_servicecode_lookup`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- journalentry
- customerpayment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Warranty JE creation
- [ ] Client Script - N/A

**Custom Fields:**
- invoice | custbody_sna_jeforwarranty | Warranty JE reference
- invoice | custbody_sna_inv_claimid | Claim ID
- invoice line | custcol_sn_for_warranty_claim | Warranty claim line flag
- invoice line | cseg_sna_revenue_st | Revenue stream
- invoice line | custcol_sna_service_itemcode | Service code
- revenue stream | custrecord_sn_for_warranty | Warranty flag
- warranty lookup | custrecord_sn_warranty_gl | Warranty GL account

**Saved Searches:**
- `customsearch_sna_servicecode_lookup` for warranty GL mapping.

### Integration Points
- Uses runtime user preference `custscript_sna_claimwarranty` for claim account.
- Auto-creates customer payment to apply JE to invoice.

### Data Requirements

**Data Volume:**
- One JE and one payment per warranty invoice.

**Data Sources:**
- Invoice lines and revenue stream configuration.

**Data Retention:**
- Creates JE and customer payment records; updates invoice reference.

### Technical Constraints
- Payment option ID depends on environment (sandbox vs production).

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Warranty configuration and saved search

### Governance Considerations

- **Script governance:** Multiple record operations per invoice.
- **Search governance:** Revenue stream lookups and saved search.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Warranty JEs are created and applied to invoices automatically.

**How we'll measure:**
- Review invoice-linked JE and customer payment records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_jeforwarranty.js | User Event | Create warranty JE and apply payment | Implemented |

### Development Approach

**Phase 1:** JE creation
- [ ] Validate warranty line identification and JE lines

**Phase 2:** Payment application
- [ ] Validate customer payment creation and application

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with warranty lines creates JE and auto-applies payment.

**Edge Cases:**
1. No warranty lines results in no JE creation.

**Error Handling:**
1. JE or payment creation errors are logged.

### Test Data Requirements
- Invoice with warranty revenue streams and service codes

### Sandbox Setup
- Deploy User Event on Invoice and ensure saved search exists.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Create Journal Entries
- Create Customer Payments
- Edit invoices

### Data Security
- Warranty and financial data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm saved search `customsearch_sna_servicecode_lookup`
- [ ] Validate payment option IDs for sandbox/production

### Deployment Steps

1. Deploy User Event on Invoice.
2. Validate warranty JE and payment creation.

### Post-Deployment

- [ ] Monitor logs for JE/payment errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create JEs and payments manually if needed.

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

- [ ] Should warranty GL mapping be cached to reduce searches?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Warranty mapping missing causes JE to use claim account | Med | Med | Validate service code configuration |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- Journal Entry and Customer Payment

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
