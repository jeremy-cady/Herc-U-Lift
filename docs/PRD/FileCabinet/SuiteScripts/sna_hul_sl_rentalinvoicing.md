# PRD: Rental Invoicing

**PRD ID:** PRD-UNKNOWN-RentalInvoicing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_rentalinvoicing.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that searches rental sales orders and creates invoices via transform or Map/Reduce.

**What problem does it solve?**
Provides a UI to select rental orders and automate invoice generation at scale.

**Primary Goal:**
Generate invoices for eligible rental sales orders and track status.

---

## 2. Goals

1. Allow filtering of rental orders by customer, date, and location.
2. Exclude orders with unconfigured objects or credit memos.
3. Create invoices directly or via Map/Reduce for bulk selections.

---

## 3. User Stories

1. **As a** billing user, **I want to** filter rental orders **so that** I can invoice the right set.
2. **As an** admin, **I want to** batch invoice large sets **so that** processing remains stable.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must display a filter form and a paged sublist of rental sales orders.
2. The Suitelet must exclude orders with unconfigured lines or dummy objects.
3. The Suitelet must exclude orders with credit memos when configured.
4. The Suitelet must allow selecting orders and submitting for invoicing.
5. If more than 30 orders are selected, the Suitelet must invoke Map/Reduce.
6. Otherwise, the Suitelet must transform each sales order into an invoice and set the A/R account.

### Acceptance Criteria

- [ ] Eligible sales orders appear in the list and can be selected.
- [ ] Invoices are created or MR is scheduled based on selection size.
- [ ] Status page or link is presented after processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify line-level configuration data.
- Create credit memos.
- Post invoices to GL beyond normal transform behavior.

---

## 6. Design Considerations

### User Interface
- Form titled "Invoice Rental Orders" with filters, sublist, and pagination.

### User Experience
- Select orders, submit, and receive status feedback.

### Design References
- Client script `sna_hul_cs_rentalinvoicing.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- invoice
- account
- scriptdeployment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Rental invoicing UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order Line | custcol_sna_hul_bill_date | Bill date
- Sales Order Line | custcol_sna_hul_object_configurator | Config JSON
- Sales Order Line | custcol_sna_hul_object_configurator_2 | Config JSON
- Sales Order Line | custcol_sna_hul_fleet_no.custrecord_sna_hul_rent_dummy | Dummy flag
- Item | custitem_sna_hul_gen_prodpost_grp | Product posting group

**Saved Searches:**
- customsearch_sna_hul_rental_for_invoice
- customsearch_sna_hul_so_with_cm

### Integration Points
- Map/Reduce `customscript_sna_hul_mr_rentalinvoicing`.

### Data Requirements

**Data Volume:**
- Paged results with page size 50.

**Data Sources:**
- Sales order searches and customer filters

**Data Retention:**
- Creates invoice records.

### Technical Constraints
- Uses search filter expressions and excludes orders with unconfigured fields.

### Dependencies
- **Libraries needed:** ./SNA/shared/sna_hul_mod_utils
- **External dependencies:** None
- **Other features:** Rental configuration and MR invoicing

### Governance Considerations

- **Script governance:** Transform operations per SO; MR for larger sets.
- **Search governance:** Multiple searches and paged results.
- **API limits:** MR needed for larger batches.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Eligible orders are invoiced correctly.
- MR jobs schedule and complete for large batches.

**How we'll measure:**
- Invoice counts and MR status logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_rentalinvoicing.js | Suitelet | Rental invoice generation | Implemented |

### Development Approach

**Phase 1:** Filter validation
- [ ] Confirm saved search logic and exclusions

**Phase 2:** Invoicing validation
- [ ] Test single and batch invoicing flows

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a few orders and create invoices directly.
2. Select many orders and schedule MR invoicing.

**Edge Cases:**
1. Orders with unconfigured lines are excluded.
2. Orders with credit memos are excluded.

**Error Handling:**
1. Transform errors send an email to the current user.

### Test Data Requirements
- Rental sales orders with bill dates and configured objects
- Sales orders with credit memos

### Sandbox Setup
- Deploy Suitelet, client script, and MR script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing roles

**Permissions required:**
- Transform sales orders to invoices
- View accounts and sales orders

### Data Security
- Billing data access should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] MR script deployed and accessible
- [ ] Saved searches verified

### Deployment Steps

1. Deploy Suitelet.
2. Provide menu access for billing users.

### Post-Deployment

- [ ] Validate invoice creation and MR status links

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to manual invoicing.

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

- [ ] Should page size be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Exclusion logic may omit valid orders | Med | Med | Review search filters regularly |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/task module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
