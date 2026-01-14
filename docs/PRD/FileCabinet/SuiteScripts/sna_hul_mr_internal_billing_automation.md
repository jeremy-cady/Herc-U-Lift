# PRD: Internal Billing Automation (Customer Payments)

**PRD ID:** PRD-UNKNOWN-InternalBillingAutomation
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_internal_billing_automation.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that generates customer payments for invoices as part of internal billing automation.

**What problem does it solve?**
It automates creation of internal billing payments and logs tasks for tracking and error handling.

**Primary Goal:**
Create internal billing task records and generate customer payments for eligible invoices.

---

## 2. Goals

1. Load invoice data from a saved search.
2. Create internal billing task records with metadata.
3. Transform invoices to customer payments and apply them.

---

## 3. User Stories

1. **As a** finance user, **I want** internal billing payments created automatically **so that** daily processing is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a saved search from `custscript_sna_internal_bill_search`.
2. The script must flag invoices with `custbody_versapay_do_not_sync = true`.
3. The script must create `customrecord_sna_hul_internal_billing` task records with invoice metadata and status.
4. The script must transform invoices to customer payments and apply amounts equal to invoice amount + Avalara.
5. The script must set internal billing task status to In Progress or Failed based on payment creation.

### Acceptance Criteria

- [ ] Internal billing task records are created for each invoice.
- [ ] Customer payments are generated and applied to the invoice.
- [ ] Failed payments log error details on the task record.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Sync payments to external systems (VersaPay sync is disabled).

---

## 6. Design Considerations

### User Interface
- None; backend processing.

### User Experience
- Users see internal billing tasks and generated payments.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice (`record.Type.INVOICE`)
- Customer Payment (`record.Type.CUSTOMER_PAYMENT`)
- Custom Record | `customrecord_sna_hul_internal_billing`
- Custom Segment | `customrecord_cseg_sna_revenue_st`

**Script Types:**
- [x] Map/Reduce - Internal billing automation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Invoice | `custbody_versapay_do_not_sync`
- Task | `custrecord_sna_hul_linked_invoice`
- Task | `custrecord_sna_hul_revenue_stream`
- Task | `custrecord_sna_hul_eq_cat_group`
- Task | `custrecord_sna_hul_manufacturer`
- Task | `custrecord_sna_hul_amt_credit`
- Task | `custrecord_sna_hul_customer`
- Task | `custrecord_sna_internal_billing_line_id`
- Task | `custrecord_sna_hul_internal_bill_status`
- Task | `custrecord_sna_hul_meta_data`
- Task | `custrecord_sna_hul_linked_payment`
- Task | `custrecord_sna_hul_error_logs`

**Saved Searches:**
- Search from parameter `custscript_sna_internal_bill_search`.

### Integration Points
- Revenue stream lookup for internal billing department and accounts.

### Data Requirements

**Data Volume:**
- All invoices returned by the saved search.

**Data Sources:**
- Invoice data and revenue stream custom segment fields.

**Data Retention:**
- Stores task records and generated customer payments.

### Technical Constraints
- Requires revenue stream custom segment to map internal billing accounts.

### Dependencies
- **Libraries needed:** N/runtime, N/search, N/record.
- **External dependencies:** None.

### Governance Considerations
- Transforming invoices to payments per record.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Internal billing tasks are created and customer payments are generated without errors.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_internal_billing_automation.js | Map/Reduce | Create internal billing tasks and payments | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Build internal billing tasks.
- **Phase 2:** Generate customer payments and update status.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with revenue stream mapping generates a customer payment and updates task status.

**Edge Cases:**
1. Missing revenue stream mapping should still create a task but may fail payment creation.

**Error Handling:**
1. Payment creation failure logs error on task record and sets status to Failed.

### Test Data Requirements
- Saved search returning invoices with revenue stream and amount fields.

### Sandbox Setup
- Ensure custom segment `customrecord_cseg_sna_revenue_st` has internal billing fields populated.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Finance automation role.

**Permissions required:**
- Create customer payments; edit invoices; create internal billing task records.

### Data Security
- Internal financial data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure `custscript_sna_internal_bill_search` parameter.

### Deployment Steps
1. Upload `sna_hul_mr_internal_billing_automation.js`.
2. Deploy Map/Reduce with saved search.

### Post-Deployment
- Validate internal billing tasks and payment creation logs.

### Rollback Plan
- Disable script deployment.

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
- [ ] How should failed tasks be retried and re-queued?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect revenue stream mapping | Med | High | Validate mappings before deployment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
