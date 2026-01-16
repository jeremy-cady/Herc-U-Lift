# PRD: Credit Memo WIP Reclass and Rental Qty Update

**PRD ID:** PRD-UNKNOWN-CreditMemo
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_creditmemo.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event on Credit Memo that reverses WIP reclass entries and updates rental quantities on Sales Orders when credit memos apply.

**What problem does it solve?**
Keeps WIP accounting and rental quantities aligned after credit memos are created or edited.

**Primary Goal:**
Reverse WIP reclass on credit memo creation and adjust rental SO quantities based on credited days.

---

## 2. Goals

1. Reverse WIP reclass when a credit memo is created from an invoice.
2. Recalculate rental SO quantities when credit memos are created/edited/copied.

---

## 3. User Stories

1. **As a** finance user, **I want to** reverse WIP reclass on credit memos **so that** accounting remains accurate.
2. **As a** billing user, **I want to** adjust rental quantities **so that** Sales Orders reflect credited usage.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Credit Memo create/edit/copy.
2. On create, if the credit memo has `createdfrom`, the script must call `reverseWIPAccount`.
3. The script must search applied invoice/SO lines for rental orders and recalculate quantities based on date range and credited quantity.
4. The script must update Sales Order line quantities using line unique keys.

### Acceptance Criteria

- [ ] WIP reclass reversal runs on create when `createdfrom` exists.
- [ ] Rental SO line quantities update based on credit memo quantities.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create new credit memos.
- Adjust non-rental Sales Orders.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Rental quantities update automatically after credit memo activity.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- creditmemo
- invoice
- salesorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - WIP reversal and rental quantity updates
- [ ] Client Script - N/A

**Custom Fields:**
- creditmemo | createdfrom | Source invoice
- salesorder | custbody_sna_hul_last_invoice_seq | Last invoice sequence
- salesorder line | lineuniquekey | Line key for updates

**Saved Searches:**
- Search on invoice, applied transactions, and sales order lines for rental data.

### Integration Points
- Uses `./sn_hul_mod_reclasswipaccount.js` and `./moment.js`.

### Data Requirements

**Data Volume:**
- One search and one Sales Order update per credit memo.

**Data Sources:**
- Applied invoice and SO line data

**Data Retention:**
- Updates Sales Order line quantities.

### Technical Constraints
- Rental form ID provided via script parameter `custscript_sn_hul_sorentalform`.

### Dependencies
- **Libraries needed:** `./sn_hul_mod_reclasswipaccount.js`, `./moment.js`
- **External dependencies:** None
- **Other features:** Rental billing process

### Governance Considerations

- **Script governance:** One search and one SO save per credit memo.
- **Search governance:** Moderate due to joined filters.
- **API limits:** Low to moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- WIP reclass reversal occurs and rental quantities are adjusted correctly.

**How we'll measure:**
- Compare SO quantities before/after credit memo creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_creditmemo.js | User Event | Reverse WIP reclass and adjust rental qty | Implemented |

### Development Approach

**Phase 1:** WIP reversal
- [ ] Validate reversal on credit memo creation

**Phase 2:** Rental qty updates
- [ ] Validate SO quantity changes from credit memo application

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create credit memo from invoice and verify WIP reversal.
2. Credit memo reduces rental SO line quantities.

**Edge Cases:**
1. Credit memo not created from invoice does not reverse WIP.

**Error Handling:**
1. Search/load errors are logged.

### Test Data Requirements
- Rental Sales Order with invoice and credit memo

### Sandbox Setup
- Deploy User Event on Credit Memo.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Edit sales orders
- Access invoice and credit memo records

### Data Security
- WIP and rental data restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm rental form parameter value

### Deployment Steps

1. Deploy User Event on Credit Memo.
2. Validate WIP reversal and rental qty updates.

### Post-Deployment

- [ ] Monitor logs for errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Adjust SO quantities manually if needed.

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

- [ ] Should updates occur on credit memo deletes?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Date range parsing errors affect qty calculation | Low | Med | Validate start/end dates before calculation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
