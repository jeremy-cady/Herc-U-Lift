# PRD: Update Child Transactions (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-UpdateChildTransactionsMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_update_child_transactions.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that updates segment values on child transactions derived from sales orders with internal revenue streams.

**What problem does it solve?**
Ensures revenue stream, manufacturer, and equipment segment values are consistent across sales orders and their related transactions.

**Primary Goal:**
Propagate sales order line segment values to related child transactions in bulk.

---

## 2. Goals

1. Identify sales orders with internal revenue streams.
2. Collect related child transactions for each sales order.
3. Update child transaction segment values based on sales order line data.

---

## 3. User Stories

1. **As an** accountant, **I want** child transactions updated **so that** internal reporting is accurate.
2. **As an** admin, **I want** updates applied in bulk **so that** processing is efficient.
3. **As a** developer, **I want** consistent segment propagation **so that** data remains aligned.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load sales orders from saved search `customsearch_sna_so_with_internal_rs`.
2. The system must support optional filtering by `custscript_sn_so_ids_to_process`.
3. The system must gather related transactions using shared utilities:
   - Time Bills
   - Item Fulfillments
   - Invoices
   - Purchase Orders and related records
   - Return Authorizations and related records
4. The system must update sales order line revenue stream values to match the mainline value.
5. The system must update related transactions using `sna_hul_update_child_transactions` helpers.
6. The system must set `custbody_sna_child_updated` on the sales order when complete.

### Acceptance Criteria

- [ ] Child transactions reflect updated segment values.
- [ ] Sales orders are flagged as updated after processing.
- [ ] Errors are logged during map and reduce stages.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update sales orders without internal revenue streams.
- Modify unrelated fields beyond segment values.
- Perform UI interactions.

---

## 6. Design Considerations

### User Interface
- None (batch processing).

### User Experience
- Segment updates occur in the background without manual edits.

### Design References
- Shared helper module `sna_hul_update_child_transactions`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Time Bill
- Item Fulfillment
- Invoice
- Purchase Order
- Return Authorization
- Related child transactions (vendor bills, item receipts, credits, etc.)

**Script Types:**
- [x] Map/Reduce - Child transaction updates
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `custbody_sna_child_updated`
- Segment fields: `cseg_sna_revenue_st`, `cseg_hul_mfg`, `cseg_sna_hul_eq_seg`

**Saved Searches:**
- `customsearch_sna_so_with_internal_rs`

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Multiple updates per sales order; scales with related transaction count.

**Data Sources:**
- Saved search results and related transaction searches.

**Data Retention:**
- Updates segment values on existing records.

### Technical Constraints
- Uses helper module for child updates.
- Map stage writes related record data for reduce processing.

### Dependencies
- **Libraries needed:** `FileCabinet/SuiteScripts/SNA/shared/sna_hul_update_child_transactions.js`.
- **External dependencies:** None.
- **Other features:** Script parameter `custscript_sn_so_ids_to_process` for targeted runs.

### Governance Considerations
- Multiple record loads/saves; monitor remaining usage in reduce.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Child transactions match sales order segment values across all processed orders.

**How we'll measure:**
- Spot check related transactions after processing.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_update_child_transactions.js | Map/Reduce | Update child transaction segments | Implemented |

### Development Approach

**Phase 1:** Data collection
- [x] Load sales orders and gather related records.

**Phase 2:** Update execution
- [x] Update child records and flag sales orders.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Process a sales order with internal revenue stream and verify child updates.

**Edge Cases:**
1. Sales order with no related transactions.
2. Missing segment values on lines.

**Error Handling:**
1. Record update fails; error logged in reduce.

### Test Data Requirements
- Sales orders with internal revenue streams and related transactions.

### Sandbox Setup
- Map/Reduce deployment with saved search configured.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to sales orders and related transactions.

**Permissions required:**
- Edit Sales Orders
- Edit related transactions (invoice, fulfillment, PO, etc.)

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_mr_update_child_transactions.js`.
2. Set script parameter `custscript_sn_so_ids_to_process` if needed.
3. Run in sandbox and validate updates.

### Post-Deployment

- [ ] Verify `custbody_sna_child_updated` on sales orders.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

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

- [ ] Should the script handle mixed revenue streams per line differently?
- [ ] Should updates be batched to reduce governance usage?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large transaction sets consume governance | Med | High | Use targeted runs with parameter filter |
| Related records missing line matches | Med | Med | Add fallback matching logic |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/SNA/shared/sna_hul_update_child_transactions.md

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.load and record.submitFields APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
