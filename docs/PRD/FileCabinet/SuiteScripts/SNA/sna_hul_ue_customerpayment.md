# PRD: Customer Payment Delete Cleanup (User Event)

**PRD ID:** PRD-UNKNOWN-CustomerPaymentCleanup
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_customerpayment.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that untags invoice line items when a customer payment is deleted for internal billing processing.

**What problem does it solve?**
Ensures invoice lines can be reprocessed if the payment tied to internal billing is removed.

**Primary Goal:**
Reset internal billing flags on invoice lines when related payments are deleted.

---

## 2. Goals

1. Find internal billing task records tied to the deleted payment.
2. Group invoice line IDs by invoice.
3. Clear the internal billing processed flag on those invoice lines.

---

## 3. User Stories

1. **As an** accounting user, **I want** invoice lines reset when a payment is deleted **so that** internal billing can be rerun.
2. **As an** admin, **I want** payment deletions to clean up related invoice data **so that** records stay consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run only on `DELETE` operations for customer payments.
2. The system must search `customrecord_sna_hul_internal_billing` for records linked to the payment.
3. The system must group invoice line IDs by invoice.
4. The system must set `custcol_sn_internal_billing_processed` to `false` on those invoice lines.

### Acceptance Criteria

- [ ] Invoice line flags reset when a linked payment is deleted.
- [ ] Errors are logged without blocking the delete operation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Delete internal billing task records.
- Validate that invoice lines are still open or billable.
- Update invoices on non-delete events.

---

## 6. Design Considerations

### User Interface
- No UI changes; runs on delete.

### User Experience
- Transparent cleanup during payment deletion.

### Design References
- Custom record `customrecord_sna_hul_internal_billing`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer Payment
- Invoice
- Internal Billing (`customrecord_sna_hul_internal_billing`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Cleanup on delete
- [ ] Client Script - Not used

**Custom Fields:**
- Internal Billing | `custrecord_sna_hul_linked_payment`
- Internal Billing | `custrecord_sna_hul_linked_invoice`
- Internal Billing | `custrecord_sna_internal_billing_line_id`
- Invoice line | `custcol_sn_internal_billing_processed`

**Saved Searches:**
- Search on internal billing records tied to the payment.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Up to 1000 internal billing task records per delete.

**Data Sources:**
- Internal billing records and invoice lines.

**Data Retention:**
- Updates invoice line flags only.

### Technical Constraints
- Uses promise-based record load/save; execution timing depends on NetSuite async handling.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Internal billing record maintenance.

### Governance Considerations
- Multiple invoice loads and saves per delete.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoice lines are untagged when payments are deleted.

**How we'll measure:**
- Verify `custcol_sn_internal_billing_processed` is false on affected invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_customerpayment.js | User Event | Untag invoice lines on payment delete | Implemented |

### Development Approach

**Phase 1:** Lookup internal billing records
- [x] Search and group invoice line IDs.

**Phase 2:** Invoice updates
- [x] Reset internal billing flags on invoice lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Delete a customer payment and verify invoice line flags reset.

**Edge Cases:**
1. Payment has no linked internal billing records; no updates occur.
2. Invoice line IDs are missing or invalid; errors are logged.

**Error Handling:**
1. Invoice load/save errors are logged.

### Test Data Requirements
- Customer payment linked to internal billing records.

### Sandbox Setup
- Ensure internal billing custom record is populated with test data.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting admins.

**Permissions required:**
- Edit invoices
- View internal billing records

### Data Security
- No additional data exposure beyond existing access.

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

1. Upload `sna_hul_ue_customerpayment.js`.
2. Deploy on Customer Payment record.

### Post-Deployment

- [ ] Verify invoice line flags update on delete.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should internal billing records be updated or cleaned up after delete?
- [ ] Should invoice updates be performed synchronously or via a scheduled script?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Async promises do not complete before delete finalizes | Med | Med | Consider Map/Reduce or Scheduled fallback |
| Large invoice updates consume governance | Low | Med | Batch updates if needed |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
