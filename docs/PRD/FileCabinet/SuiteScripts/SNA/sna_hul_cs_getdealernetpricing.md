# PRD: Dealer Net Pricing Approval (Client Script)

**PRD ID:** PRD-UNKNOWN-DealerNetPricingCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_getdealernetpricing.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that approves temporary dealer net pricing updates by copying staged values into active fields on a custom record.

**What problem does it solve?**
Provides UI actions to approve list price, purchase price, or all pricing fields on the vendor pricing record.

**Primary Goal:**
Move staged pricing values into live pricing fields and track approval metadata.

---

## 2. Goals

1. Approve temporary list price updates.
2. Approve temporary purchase price and contract price updates.
3. Approve all staged pricing fields in one action.

---

## 3. User Stories

1. **As a** pricing admin, **I want** to approve list price changes **so that** pricing updates are controlled.
2. **As a** pricing admin, **I want** to approve purchase price updates **so that** vendor cost changes are tracked.
3. **As a** manager, **I want** to approve all price changes at once **so that** approvals are efficient.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load the current record values from the pricing custom record.
2. The system must copy temporary fields to live fields on approval:
   - `custrecord_sna_hul_t_itempurchaseprice` -> `custrecord_sna_hul_itempurchaseprice`
   - `custrecord_sna_hul_t_listprice` -> `custrecord_sna_hul_listprice`
   - `custrecord_sna_hul_t_contractprice` -> `custrecord_sna_hul_contractprice`
3. The system must clear approval flags and update approval metadata fields:
   - `custrecord_sna_hul_forapproval` (set false on list price approval)
   - `custrecord_sna_hul_lp_lastapprovedby`, `custrecord_sna_hul_lp_lastapprovaldate`
   - `custrecord_sna_hul_pp_lastapprovedby`, `custrecord_sna_hul_pp_lastapprovaldate`
4. The system must update `custrecord_sna_hul_remarks` by clearing specific indices.
5. The system must reload the current record in the browser after approval.

### Acceptance Criteria

- [ ] Approving list price copies list price and clears approval flag.
- [ ] Approving purchase price copies purchase and contract price values.
- [ ] Approving all price updates copies all staged pricing values.
- [ ] The record reloads after approval.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate pricing values before approval.
- Send notifications on approval.
- Handle bulk approval across multiple records.

---

## 6. Design Considerations

### User Interface
- Provides client-side actions that update the record and reload the page.

### User Experience
- Approvals happen immediately without manual field edits.

### Design References
- Vendor pricing custom record fields for staging and approval metadata.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom vendor pricing record (record type supplied at runtime).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Pricing approval actions

**Custom Fields:**
- `custrecord_sna_hul_t_itempurchaseprice`
- `custrecord_sna_hul_t_listprice`
- `custrecord_sna_hul_t_contractprice`
- `custrecord_sna_hul_t_qtybreakprices`
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_listprice`
- `custrecord_sna_hul_contractprice`
- `custrecord_sna_hul_forapproval`
- `custrecord_sna_hul_lp_lastapprovedby`
- `custrecord_sna_hul_lp_lastapprovaldate`
- `custrecord_sna_hul_pp_lastapprovedby`
- `custrecord_sna_hul_pp_lastapprovaldate`
- `custrecord_sna_hul_remarks`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per approval action.

**Data Sources:**
- Pricing custom record fields.

**Data Retention:**
- Updates live pricing fields and approval metadata.

### Technical Constraints
- Uses `record.submitFields` and reloads the record via `url.resolveRecord`.
- Approval metadata uses the current user and current date.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom record must include staged pricing fields.

### Governance Considerations
- One lookupFields and one submitFields per action.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing approvals update live fields and metadata correctly.

**How we'll measure:**
- Verify record fields before and after approval actions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_getdealernetpricing.js | Client Script | Approve staged pricing values | Implemented |

### Development Approach

**Phase 1:** Load staged values
- [x] Lookup staged fields for approval.

**Phase 2:** Submit updates
- [x] Copy staged values and update approval metadata.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Approve list price and verify fields update.
2. Approve purchase price and verify fields update.
3. Approve all price updates and verify fields update.

**Edge Cases:**
1. Missing remarks values cause index operations to fail.
2. Staged values are empty; ensure updates set 0.

**Error Handling:**
1. Submit fails; error logged in console.

### Test Data Requirements
- Vendor pricing record with staged values.

### Sandbox Setup
- Client script deployed on vendor pricing record form.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users with edit permission to pricing records.

**Permissions required:**
- Edit pricing custom record.

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

1. Upload `sna_hul_cs_getdealernetpricing.js`.
2. Deploy to vendor pricing custom record form.
3. Validate approval actions.

### Post-Deployment

- [ ] Verify pricing fields and approval metadata.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

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

- [ ] Should approvals be logged to a custom audit record?
- [ ] Should approval actions require role checks?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Remarks array indexing may be brittle | Med | Low | Validate remarks string format |
| Staged values missing | Low | Low | Default to 0 as implemented |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- record.submitFields and search.lookupFields APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
