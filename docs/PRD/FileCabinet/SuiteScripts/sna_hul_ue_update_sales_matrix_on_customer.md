# PRD: Update Sales Rep Matrix on Customer

**PRD ID:** PRD-UNKNOWN-UpdateSalesMatrixOnCustomer
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_update_sales_matrix_on_customer.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Adds a Resync button on the customer sales rep matrix sublist and triggers Map/Reduce updates to sales rep matrix records.

**What problem does it solve?**
Keeps sales rep matrix mappings aligned with customer zip codes and ensures outdated mappings are inactivated.

**Primary Goal:**
Synchronize sales rep matrix records when customer data changes or on-demand resync.

---

## 2. Goals

1. Provide a Resync button on the sales rep matrix sublist.
2. Trigger Map/Reduce to add/update matrix records.
3. Inactivate matrix entries whose zip codes no longer match the customer.

---

## 3. User Stories

1. **As a** sales admin, **I want to** resync matrix data **so that** assignments stay correct.
2. **As a** user, **I want to** auto-update matrix on save **so that** no manual work is needed.
3. **As an** admin, **I want to** remove stale zip mappings **so that** reps are not assigned incorrectly.

---

## 4. Functional Requirements

### Core Functionality

1. On VIEW, the system must add a Resync button to the sales rep matrix sublist.
2. If the resync parameter is present, the system must run the Map/Reduce to add/update matrix and then redirect back to the customer.
3. On afterSubmit, the system must always trigger Map/Reduce to add/update matrix records.
4. On afterSubmit, the system must inactivate matrix records whose zip codes no longer match customer zip codes (using 5-digit prefix matching).

### Acceptance Criteria

- [ ] Resync button appears on customer view and triggers Map/Reduce.
- [ ] Matrix updates run automatically after customer save.
- [ ] Stale zip mappings are inactivated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Directly edit matrix records in the User Event.
- Validate sales rep eligibility.
- Change customer address data.

---

## 6. Design Considerations

### User Interface
- Resync button on recmachcustrecord_salesrep_mapping_customer sublist.

### User Experience
- Resync triggers a reload and Map/Reduce execution.

### Design References
- Library: sna_hul_ue_sales_rep_matrix_config

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Custom record: customrecord_sna_salesrep_matrix_mapping

**Script Types:**
- [ ] Map/Reduce - Sales rep matrix update
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - UI and MR trigger
- [ ] Client Script - N/A

**Custom Fields:**
- Custom record | custrecord_salesrep_mapping_customer | Customer reference
- Custom record | custrecord_salesrep_mapping_zipcode | Zip code

**Saved Searches:**
- None (ad hoc search for zip list)

### Integration Points
- Map/Reduce invoked via library.executeMR

### Data Requirements

**Data Volume:**
- Per customer, all sales rep matrix records.

**Data Sources:**
- Customer zip codes from library.getCustomerZipCodes.

**Data Retention:**
- Matrix records updated/inactivated by MR.

### Technical Constraints
- Zip comparisons use 5-character prefix matching.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/sna_hul_ue_sales_rep_matrix_config
- **External dependencies:** None
- **Other features:** MR script for sales rep matrix updates

### Governance Considerations

- **Script governance:** MR executions on view resync and afterSubmit.
- **Search governance:** One custom record search for zip list.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales rep matrix records reflect current customer zip codes.
- Resync action completes without errors.

**How we'll measure:**
- Validate matrix records and MR logs after changes.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_update_sales_matrix_on_customer.js | User Event | Trigger matrix updates and resync | Implemented |

### Development Approach

**Phase 1:** UI resync
- [x] Add Resync button and handle resync parameter.

**Phase 2:** Auto update and cleanup
- [x] Trigger MR after submit and inactivate stale zips.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. View customer and click Resync, verify MR runs and page reloads.
2. Save customer with updated addresses, verify MR updates matrix.

**Edge Cases:**
1. Remove a zip from customer addresses, verify mapping is inactivated.

**Error Handling:**
1. MR execution fails, verify error logged.

### Test Data Requirements
- Customer with multiple addresses and matrix mappings.

### Sandbox Setup
- Deploy MR script referenced by the library.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to customer record and sales rep matrix custom records.

### Data Security
- User Event only triggers MR; record updates handled by MR.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] MR script is deployed and available to library.

### Deployment Steps
1. Deploy User Event to Customer.

### Post-Deployment
- Validate resync and auto-update behaviors.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should resync be restricted to admin roles only?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| MR unavailable | Matrix not updated | Monitor deployments and logs |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
