# PRD: Rental Invoicing Map/Reduce

**PRD ID:** PRD-UNKNOWN-RentalInvoicing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_rentalinvoicing.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that transforms selected Rental Sales Orders into Invoices.

**What problem does it solve?**
Automates invoice creation for rental orders without manual transformation.

**Primary Goal:**
Create invoices from Sales Orders and set the correct A/R account.

---

## 2. Goals

1. Accept a list of Sales Order IDs as input.
2. Transform each Sales Order into an Invoice.
3. Set the invoice A/R account from a script parameter.

---

## 3. User Stories

1. **As a** billing user, **I want** rental Sales Orders auto-invoiced **so that** billing is faster.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read Sales Order IDs from parameter `custscript_sna_rentalsoids`.
2. The script must transform each Sales Order to an Invoice.
3. The script must set the Invoice `account` field from parameter `custscript_sna_ar_account`.
4. The script must save the Invoice and log the created ID.
5. The script must email the initiating user on errors when `custscript_sna_current_user` is set.

### Acceptance Criteria

- [ ] Each input Sales Order generates an Invoice.
- [ ] The Invoice uses the configured A/R account.
- [ ] Errors are logged and emailed when a current user is provided.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Filter lines based on billing date (logic is commented out).
- Validate or adjust invoice line details beyond transformation.

---

## 6. Design Considerations

### User Interface
- None; backend processing.

### User Experience
- Users receive invoices automatically and error emails if failures occur.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)
- Invoice (`invoice`)

**Script Types:**
- [x] Map/Reduce - Invoice generation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None explicitly referenced.

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes a list of Sales Orders provided by parameter.

**Data Sources:**
- Sales Orders passed in as JSON.

**Data Retention:**
- No data retention beyond Invoice creation.

### Technical Constraints
- Requires valid Sales Order IDs and a valid A/R account.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- None.

### Governance Considerations
- One transform per Sales Order.

---

## 8. Success Metrics

- Rental Sales Orders are invoiced without manual intervention.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_rentalinvoicing.js | Map/Reduce | Transform rental Sales Orders to Invoices | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Gather Sales Order IDs from parameters.
- **Phase 2:** Transform to Invoice, set account, and save.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. A valid Sales Order ID produces a new Invoice.

**Edge Cases:**
1. Empty input list results in no processing.

**Error Handling:**
1. Invalid Sales Order ID triggers error logging and optional email.

### Test Data Requirements
- Sample rental Sales Orders ready for invoicing.

### Sandbox Setup
- Configure `custscript_sna_rentalsoids` and `custscript_sna_ar_account`.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing or admin roles.

**Permissions required:**
- Create Invoice and edit Sales Order.

### Data Security
- Standard transaction access controls.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure A/R account parameter and user notification parameter.

### Deployment Steps
1. Upload `sna_hul_mr_rentalinvoicing.js`.
2. Deploy Map/Reduce with parameters.

### Post-Deployment
- Verify invoices created for a test batch.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Should the commented line-filtering logic be re-enabled for billing dates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect account configured | Low | High | Validate A/R account in deployment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- Record.transform (Sales Order to Invoice)

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
