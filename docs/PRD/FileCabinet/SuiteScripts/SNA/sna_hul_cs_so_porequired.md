# PRD: PO Required Banner and Blanket PO (Client Script)

**PRD ID:** PRD-UNKNOWN-PORequiredCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_so_porequired.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enforces purchase order requirements for customers, sets blanket PO numbers, and provides a warranty print action.

**What problem does it solve?**
Ensures external revenue stream transactions for PO-required customers include a PO number and provides quick access to warranty printing.

**Primary Goal:**
Show PO-required messaging and apply blanket PO values when appropriate.

---

## 2. Goals

1. Show a PO-required banner when customer settings require it.
2. Auto-populate the PO number from the customer's blanket PO when empty.
3. Block save for invoices without required PO numbers.

---

## 3. User Stories

1. **As a** sales rep, **I want** PO requirements highlighted **so that** I don't miss required fields.
2. **As an** admin, **I want** blanket POs applied automatically **so that** data entry is consistent.
3. **As an** AR user, **I want** invoices blocked without PO numbers **so that** compliance is enforced.

---

## 4. Functional Requirements

### Core Functionality

1. The system must check customer fields `custentity_sna_hul_po_required` and `custentity_sna_blanket_po`.
2. When a blanket PO exists and `otherrefnum` is empty, the system must set `otherrefnum` to the blanket PO.
3. The system must show a banner if PO is required and `otherrefnum` is empty for external revenue streams.
4. The system must hide the banner when PO number is provided or requirement no longer applies.
5. The system must block invoice save if PO is required and missing.
6. The system must provide `printWarrantyFxn` to open a warranty Suitelet for the current record.

### Acceptance Criteria

- [ ] Banner shows when PO is required and missing for external revenue stream.
- [ ] Blanket PO is set when available and PO number is empty.
- [ ] Invoice save is blocked without PO when required.
- [ ] Warranty Suitelet opens when print action is triggered.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce PO requirements for internal revenue streams.
- Validate the PO number format.
- Generate warranty PDFs directly in the client script.

---

## 6. Design Considerations

### User Interface
- Displays an error message banner using `N/ui/message`.

### User Experience
- Users see immediate PO requirement feedback and blanket PO defaults.

### Design References
- Customer fields `custentity_sna_hul_po_required` and `custentity_sna_blanket_po`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Invoice
- Customer

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for warranty print
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - PO requirement enforcement

**Custom Fields:**
- Customer | `custentity_sna_hul_po_required`
- Customer | `custentity_sna_blanket_po`
- Transaction | `cseg_sna_revenue_st`
- Transaction | `otherrefnum`

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript_sna_hul_sl_print_wty_pdf`.

### Data Requirements

**Data Volume:**
- Per field change and save.

**Data Sources:**
- Customer fields and transaction revenue stream.

**Data Retention:**
- Updates `otherrefnum` on the transaction.

### Technical Constraints
- External revenue stream detection uses text includes "External".

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Warranty Suitelet deployment.

### Governance Considerations
- One customer lookup per relevant field change/save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Required PO numbers are consistently present on external transactions.

**How we'll measure:**
- Spot checks on sales orders and invoices for PO compliance.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_porequired.js | Client Script | PO requirement enforcement and warranty print | Implemented |

### Development Approach

**Phase 1:** Banner logic
- [x] Show/hide PO required banner based on customer and revenue stream.

**Phase 2:** Save validation
- [x] Block invoice save when PO required and missing.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Customer with blanket PO and external revenue stream sets PO number automatically.
2. PO required with number present saves successfully.

**Edge Cases:**
1. PO required but revenue stream is internal; no banner.
2. Invoice save with missing PO shows banner and blocks.

**Error Handling:**
1. Customer lookup fails; script should not crash.

### Test Data Requirements
- Customer with PO required flag and blanket PO.

### Sandbox Setup
- Client script deployed on sales order and invoice forms.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering sales orders and invoices.

**Permissions required:**
- View customers
- Edit sales orders and invoices

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

1. Upload `sna_hul_cs_so_porequired.js`.
2. Deploy to sales order and invoice forms.
3. Validate banner and save behavior.

### Post-Deployment

- [ ] Verify PO enforcement behavior.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from affected forms.

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

- [ ] Should the external revenue stream check use IDs instead of text match?
- [ ] Should PO requirement be enforced for sales orders as a hard block?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Revenue stream text changes break detection | Med | Med | Use internal IDs or flags |
| Frequent customer lookups slow UI | Low | Med | Cache lookup results per customer |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/ui/message module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
