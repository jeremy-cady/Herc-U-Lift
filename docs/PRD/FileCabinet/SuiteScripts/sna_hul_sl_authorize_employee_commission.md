# PRD: Authorize Employee Commission

**PRD ID:** PRD-UNKNOWN-AuthorizeEmployeeCommission
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_authorize_employee_commission.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays eligible Employee Commission or Employee Spiff transactions and creates Commission Payable records based on user selections.

**What problem does it solve?**
Provides a controlled workflow for authorizing commissions and linking source transactions to payable records.

**Primary Goal:**
Authorize selected commissions/spiffs and generate a Commission Payable transaction per sales rep.

---

## 2. Goals

1. Filter eligible commission or spiff transactions by user-selected criteria.
2. Allow users to select transactions for authorization.
3. Create Commission Payable transactions and link them to source records.

---

## 3. User Stories

1. **As a** finance user, **I want to** authorize commissions in bulk **so that** payables are created efficiently.
2. **As a** finance user, **I want to** filter by sales rep and period **so that** only relevant transactions appear.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must render a filter form for commission type, posting date/period, accounts, subsidiary, and sales reps.
2. The Suitelet must load results from a saved search based on commission type and filters.
3. The Suitelet must display eligible records in a selectable sublist.
4. On submit, the Suitelet must group selected rows by sales rep and create a Commission Payable transaction per rep.
5. The Suitelet must link source records to the created Commission Payable record.

### Acceptance Criteria

- [ ] Eligible commission/spiff records display in the results list.
- [ ] Commission Payable records are created with debit/credit lines.
- [ ] Source transactions are updated with links to the payable record.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate commission amounts beyond saved search results.
- Validate accounting period status.
- Automatically post or pay the Commission Payable transaction.

---

## 6. Design Considerations

### User Interface
- Form titled "Authorize Employee Commission" with filters and results sublist.

### User Experience
- Mark All/Unmark All buttons for bulk selection.

### Design References
- Client script `sna_hul_cs_authorize_employee_commission.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- invoice
- customrecord_sna_hul_employee_spiff
- customtransaction_sna_commission_payable
- employee

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Commission authorization UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Invoice Line | custcol_sna_sales_rep | Sales rep
- Invoice Line | custcol_sna_hul_sales_rep_comm_type | Commission type
- Invoice Line | custcol_sna_commission_amount | Commission amount
- Invoice Line | custcol_sna_hul_eligible_for_comm | Eligible flag
- Invoice Line | custcol_sna_hul_rel_comms_payable | Related commission payable
- Invoice Line | custcol_sna_hul_authorized_emp_spiff | Spiff authorized
- Employee Spiff | custrecord_sna_hul_sales_rep_csm_2 | Sales rep
- Employee Spiff | custrecord_sna_hul_spiff_amount | Spiff amount
- Employee Spiff | custrecord_sna_hul_orig_transaction | Originating transaction
- Employee Spiff | custrecord_sna_hul_emp_spiff_authorized | Authorized flag
- Employee Spiff | custrecord_sna_hul_related_comm_payable | Related commission payable

**Saved Searches:**
- customsearch_sna_trans_eligilble_comms
- customsearch_sna_emp_spiff_eligible_comm

### Integration Points
- Client script handles UI actions.
- Custom transaction for Commission Payable posting.

### Data Requirements

**Data Volume:**
- Search-driven; paged results with configurable page size.

**Data Sources:**
- Invoice lines
- Employee Spiff records

**Data Retention:**
- Creates Commission Payable transactions and updates source records.

### Technical Constraints
- Sales rep matching uses employee entity ID text search.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Commission payable transaction configuration

### Governance Considerations

- **Script governance:** Uses search paging and record loads/saves.
- **Search governance:** Saved search criteria and filters.
- **API limits:** Consider data volume when authorizing many transactions.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Commission Payable records are created for selected items.
- Source transactions are updated and linked.

**How we'll measure:**
- Validate Commission Payable records and source line fields.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_authorize_employee_commission.js | Suitelet | Authorize commissions/spiffs | Implemented |

### Development Approach

**Phase 1:** Configure searches and accounts
- [ ] Confirm saved searches return eligible records

**Phase 2:** Validate posting
- [ ] Authorize sample commissions and verify links

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Employee Commission selections create payable and update invoices.
2. Employee Spiff selections create payable and update spiff records and originating transactions.

**Edge Cases:**
1. Multiple sales reps produce multiple payable records.
2. No records selected results in no payable creation.

**Error Handling:**
1. Missing account selections handled by default values.

### Test Data Requirements
- Invoices with eligible commission lines
- Employee Spiff records with originating transactions

### Sandbox Setup
- Deploy Suitelet and client script
- Ensure custom transaction and fields exist

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance or commission admin roles

**Permissions required:**
- Create custom transactions
- Edit invoices and custom records

### Data Security
- Commission data should be limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm saved searches exist
- [ ] Confirm account defaults

### Deployment Steps

1. Deploy Suitelet and client script.
2. Add navigation for commission authorization.

### Post-Deployment

- [ ] Validate Commission Payable creation
- [ ] Review updated source records

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet deployment.
2. Restore previous process.

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

- [ ] Should commission authorization support additional transaction types?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Sales rep matching by entity ID text may mis-map | Med | Med | Use internal IDs when available |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- Custom transaction configuration

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
