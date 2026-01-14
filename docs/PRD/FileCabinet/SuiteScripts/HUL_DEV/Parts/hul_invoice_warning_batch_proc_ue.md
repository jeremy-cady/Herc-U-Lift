# PRD: Block Invoice Creation for Restricted Items (User Event)

**PRD ID:** PRD-UNKNOWN-InvoiceWarningBatchUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_invoice_warning_batch_proc_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that blocks invoice creation when the originating sales order contains restricted item IDs.

**What problem does it solve?**
Prevents invoicing of bogus or restricted parts by enforcing a server-side check at invoice creation.

**Primary Goal:**
Stop invoice creation if the source sales order includes specific restricted items.

---

## 2. Goals

1. Detect restricted items on the source sales order.
2. Block invoice creation with a clear error message.
3. Avoid blocking invoice creation on unexpected errors.

---

## 3. User Stories

1. **As a** billing user, **I want** restricted items blocked **so that** invalid invoices are not created.
2. **As an** admin, **I want** a server-side check **so that** users cannot bypass the restriction.
3. **As a** support user, **I want** a clear error message **so that** I know how to resolve it.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeSubmit` for `CREATE`.
2. The system must read the invoice `createdfrom` (sales order ID).
3. The system must load the sales order and scan the `item` sublist.
4. The system must block invoice creation if any item ID matches:
   - `88727`
   - `86344`
   - `94479`
5. When blocked, the system must throw an error with the sales order ID and line number.
6. Unexpected errors must be logged and not block invoice creation.

### Acceptance Criteria

- [ ] Invoices created from sales orders with restricted items are blocked.
- [ ] Error message includes sales order ID and offending line.
- [ ] Unexpected errors do not block creation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Remove restricted items automatically.
- Validate any other invoice fields.
- Apply to edits or deletes.

---

## 6. Design Considerations

### User Interface
- Blocking error message shown during invoice creation.

### User Experience
- Clear guidance to contact Parts for removal.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Invoice creation validation
- [ ] Client Script - Not used

**Custom Fields:**
- None (uses standard `createdfrom` and `item` fields).

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single invoice at a time.

**Data Sources:**
- Sales order item sublist.

**Data Retention:**
- None.

### Technical Constraints
- Restricted item IDs are hard-coded.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Sales order must be accessible to load.

### Governance Considerations
- One record.load per invoice create.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Restricted items never appear on newly created invoices.

**How we'll measure:**
- Invoice creation logs and exception counts.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_invoice_warning_batch_proc_ue.js | User Event | Block invoice creation with restricted items | Implemented |

### Development Approach

**Phase 1:** Source order check
- [x] Load `createdfrom` sales order
- [x] Scan item sublist for restricted IDs

**Phase 2:** Enforcement
- [x] Throw blocking error when restricted items are found

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create invoice from sales order without restricted items; invoice succeeds.
2. Create invoice from sales order with item `88727`; invoice is blocked.

**Edge Cases:**
1. `createdfrom` is empty; script does nothing.
2. Sales order load fails; invoice still proceeds.

**Error Handling:**
1. Blocking error includes sales order ID and line number.

### Test Data Requirements
- Sales orders with and without restricted item IDs.

### Sandbox Setup
- Ensure restricted item IDs exist in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles creating invoices.

**Permissions required:**
- View access to sales orders and create invoices.

### Data Security
- Server-side enforcement prevents bypass.

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

1. Upload `hul_invoice_warning_batch_proc_ue.js`.
2. Deploy as User Event on invoice record type.
3. Validate blocking behavior in sandbox.

### Post-Deployment

- [ ] Confirm blocked invoices for restricted items.
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

- [ ] Should restricted item IDs be configured in a custom record or parameter?
- [ ] Should a user-facing UI warning be added before creation?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Restricted IDs change | Med | Med | Move IDs to configuration |
| Sales order load fails | Low | Med | Log and allow creation |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_dummy_item_warning_cs.md

### NetSuite Documentation
- SuiteScript 2.x User Event
- record.load API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
