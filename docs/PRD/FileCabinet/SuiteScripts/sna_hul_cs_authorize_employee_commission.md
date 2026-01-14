# PRD: Authorize Employee Commission Suitelet Client Script

**PRD ID:** PRD-UNKNOWN-AuthorizeEmployeeCommission
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_authorize_employee_commission.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script attached to the "SNA | SL | Authorize Employee Commission" Suitelet that refreshes search results and displays confirmation links to created Commission Payable transactions.

**What problem does it solve?**
It streamlines commission authorization by reloading the Suitelet with filter parameters and highlighting newly created Commission Payables.

**Primary Goal:**
Provide in-form filtering and selection helpers for commission authorization.

---

## 2. Goals

1. Display confirmation message with links to created Commission Payable records.
2. Refresh the Suitelet based on user-selected filters.
3. Provide mark all and unmark all actions for search result selection.

---

## 3. User Stories

1. **As a** finance user, **I want** to filter commission results by date, subsidiary, sales rep, and commission type **so that** I can authorize the correct commissions.
2. **As a** finance user, **I want** to select or clear all results quickly **so that** I can process batches efficiently.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, if `commission_payable_id` is present in the URL, the system must display a confirmation message with links to the created Commission Payable records.
2. On changes to `custpage_trans_date`, `custpage_subsidiary`, `custpage_sales_rep`, or `custpage_comms_type`, the system must reload the Suitelet with query parameters for the current filter values.
3. The system must support multi-select sales rep values and serialize them for URL parameters.
4. The system must show or hide Suitelet fields based on the commission type selection.
5. The system must allow marking or unmarking all lines in `sublist_search_results` by setting `sublist_auth_checkbox`.

### Acceptance Criteria

- [ ] Confirmation message shows one link per created Commission Payable record.
- [ ] Suitelet reloads with updated filters when filter fields change.
- [ ] Mark all and unmark all correctly toggle every line in the results sublist.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create Commission Payable records.
- Validate commission calculations or accounting.

---

## 6. Design Considerations

### User Interface
- Suitelet fields show or hide based on commission type.
- Confirmation message uses inline HTML links.

### User Experience
- Changes to filters immediately refresh results.
- Batch selection options reduce repetitive clicking.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Transaction | `customtransaction_sna_commission_payable`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Host form
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - UI interactions

**Custom Fields:**
- Suitelet | `custpage_trans_date`
- Suitelet | `custpage_subsidiary`
- Suitelet | `custpage_sales_rep`
- Suitelet | `custpage_comms_type`
- Suitelet | `custpage_posting_date`
- Suitelet | `custpage_posting_period`
- Suitelet | `custpage_liability_acct`
- Suitelet | `custpage_expense_acct`
- Sublist | `sublist_auth_checkbox`

**Saved Searches:**
- None.

### Integration Points
- Suitelet script and deployment from URL parameters.
- Link resolution for Commission Payable records via `url.resolveRecord`.

### Data Requirements

**Data Volume:**
- One Suitelet load per filter change.

**Data Sources:**
- Suitelet field values and URL query parameters.

**Data Retention:**
- No persisted data beyond suitelet parameters.

### Technical Constraints
- Relies on client-side `window.location` and URL parameters.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/format, N/search, N/ui/message.
- **External dependencies:** None.
- **Other features:** Suitelet that renders the authorization form and sublist.

### Governance Considerations
- Client-side only; no server governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can reload results with filters and see confirmation links after creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_authorize_employee_commission.js | Client Script | Suitelet filters and selection helpers | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement filter refresh and confirmation message logic.
- **Phase 2:** Add bulk selection helpers for results sublist.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Change filters and confirm results reload with correct parameters.
2. Create commissions and verify confirmation message links.

**Edge Cases:**
1. Empty sales rep selection in multi-select.
2. No `commission_payable_id` parameter.

**Error Handling:**
1. Invalid record ID in `commission_payable_id` does not break page load.

### Test Data Requirements
- At least one Commission Payable record to link in confirmation.

### Sandbox Setup
- Suitelet deployed with client script attached.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Finance users authorizing commissions.

**Permissions required:**
- Access to Commission Payable custom transaction records.

### Data Security
- Links only to records the user already has access to.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet field IDs match expected values.
- Verify Commission Payable record type exists.

### Deployment Steps
1. Upload `sna_hul_cs_authorize_employee_commission.js`.
2. Attach to the authorization Suitelet deployment.

### Post-Deployment
- Validate filter refresh and confirmation message behavior.

### Rollback Plan
- Detach the client script from the Suitelet deployment.

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
- [ ] Should the suitelet block refresh if required filters are missing?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid URL parameters break refresh | Low | Med | Guard and default to blank values |
| Large result sets slow client updates | Low | Low | Consider server-side paging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
