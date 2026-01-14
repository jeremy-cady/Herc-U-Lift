# PRD: Child Transaction Update Helpers

**PRD ID:** PRD-UNKNOWN-ChildTransactionsModule
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/shared/sna_hul_update_child_transactions.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that updates child transactions (time bills, fulfillments, invoices, purchase orders, and related transactions) when sales order line segment values change.

**What problem does it solve?**
Keeps revenue stream, manufacturer, and equipment segment values consistent across related transactions derived from a sales order.

**Primary Goal:**
Propagate sales order line segment values to all related child transactions.

---

## 2. Goals

1. Locate related transactions for a sales order or purchase order.
2. Update line-level segment values on child transactions.
3. Cascade updates to linked journal entries and payments where applicable.

---

## 3. User Stories

1. **As an** accounting user, **I want** child transactions updated **so that** segment reporting stays accurate.
2. **As an** admin, **I want** consistent segment values **so that** downstream documents match the sales order.
3. **As a** developer, **I want** shared helpers **so that** update logic is centralized.

---

## 4. Functional Requirements

### Core Functionality

1. The system must retrieve related transactions using saved searches and line links.
2. The system must update time bills with revenue stream and related segment values.
3. The system must update linked journal entries when time bills or fulfillments update.
4. The system must update item fulfillments and propagate segment values to WIP JEs.
5. The system must update invoices and propagate segment values to linked internal billing JEs and customer payments.
6. The system must update purchase orders and cascade updates to vendor bills, item receipts, and vendor return authorizations.
7. The system must update vendor return authorizations and cascade updates to fulfillments and vendor credits.
8. The system must update return authorizations and cascade updates to item receipts and credit memos.
9. The system must log audit and error messages for key operations.

### Acceptance Criteria

- [ ] Child transactions reflect updated revenue stream, manufacturer, and equipment segment values.
- [ ] Linked journal entries and customer payments are updated when applicable.
- [ ] Errors are logged without stopping the overall process.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create new child transactions.
- Validate business rules beyond segment propagation.
- Handle UI interactions.

---

## 6. Design Considerations

### User Interface
- None (server-side helper module).

### User Experience
- Segment consistency across all downstream transactions without manual edits.

### Design References
- Saved searches `customsearch_sna_createdfrom_transaction` and `customsearch_sna_linked_purchase_orders`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order, Time Bill, Item Fulfillment, Invoice, Purchase Order
- Vendor Bill, Item Receipt, Vendor Return Authorization, Vendor Credit
- Return Authorization, Credit Memo, Journal Entry, Customer Payment

**Script Types:**
- [ ] Map/Reduce - Not used directly
- [ ] Scheduled Script - Not used directly
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Used by consuming scripts
- [ ] Client Script - Not used

**Custom Fields:**
- Segment fields: `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`
- Link fields: `custcol_sna_linked_so`, `custcol_sna_linked_time`, `custcol_sna_hul_linked_je`
- WIP JE field: `custbody_sna_hul_je_wip`
- Other link fields: `custcol_sn_hul_so_line_id`, `custcol_sna_linked_transaction`

**Saved Searches:**
- `customsearch_sna_createdfrom_transaction`
- `customsearch_sna_linked_purchase_orders`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Multiple updates per related transaction; scales with number of child records.

**Data Sources:**
- Sales order lines and related transaction searches.

**Data Retention:**
- Updates segment values on existing records only.

### Technical Constraints
- Uses a mix of synchronous and promise-based record saves.
- Some update paths depend on line matching (`orderline` and custom line IDs).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Consuming scripts must pass `revenueStreamPerLine` and context.

### Governance Considerations
- Multiple record loads and saves; governance usage can be high for large transaction trees.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Child transaction segment values stay consistent with the sales order.

**How we'll measure:**
- Audit a sample transaction chain for consistent segment values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_update_child_transactions.js | Library | Propagate segment values to child transactions | Implemented |

### Development Approach

**Phase 1:** Retrieval
- [x] Retrieve related transactions via searches.

**Phase 2:** Update
- [x] Update child transactions and linked records.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Update sales order segments and verify updates on time bills, fulfillments, invoices, and POs.
2. Verify linked journal entries and payments update.

**Edge Cases:**
1. Missing order lines on returns; fallback to created-from sales order.
2. No related transactions found.

**Error Handling:**
1. Record load/save failures logged and do not stop overall process.

### Test Data Requirements
- A sales order with related time bills, fulfillments, invoices, POs, and returns.

### Sandbox Setup
- Consuming scripts deployed to trigger the helper with required params.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to transactions and journals.

**Permissions required:**
- Edit access to all impacted transaction types
- View access to saved searches

### Data Security
- Updates only segment fields and related link fields.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Documentation updated

### Deployment Steps

1. Upload `sna_hul_update_child_transactions.js`.
2. Ensure consuming scripts import and use the helper.

### Post-Deployment

- [ ] Verify child transaction updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove helper usage or redeploy prior version.

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

- [ ] Should updates be batched to reduce governance usage?
- [ ] Should the helper validate that segment values are present before updating?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large transaction trees consume governance | Med | High | Add batching or scheduled processing |
| Line matching fails when orderline is missing | Med | Med | Use alternate line matching strategies |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x record and search APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
