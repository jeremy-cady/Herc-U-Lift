# PRD: Invoice Warranty Claim Validation Client Script

**PRD ID:** PRD-UNKNOWN-JEForWarranty
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_jeforwarranty.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enforces warranty claim ID entry on invoices when warranty-related revenue streams are present.

**What problem does it solve?**
It prevents invoices with warranty revenue from being saved without a claim ID.

**Primary Goal:**
Require `custbody_sna_inv_claimid` when warranty revenue streams are detected.

---

## 2. Goals

1. Detect warranty-related revenue streams on invoice lines.
2. Require a claim ID when warranty lines are present.

---

## 3. User Stories

1. **As a** billing user, **I want** warranty invoices to require a claim ID **so that** warranty tracking is complete.

---

## 4. Functional Requirements

### Core Functionality

1. On save, the script must collect all revenue stream IDs from invoice lines.
2. The script must load a saved search (ID from script parameter) to identify revenue streams flagged for warranty.
3. If any warranty revenue streams are detected and `custbody_sna_inv_claimid` is empty, the script must alert the user and block save.
4. If no warranty revenue streams are found or claim ID is present, save proceeds.

### Acceptance Criteria

- [ ] Invoices with warranty revenue streams require a claim ID.
- [ ] Invoices without warranty revenue streams save without requiring a claim ID.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate the claim ID format.
- Create journal entries for warranty.

---

## 6. Design Considerations

### User Interface
- Uses alert messages to block save.

### User Experience
- Users are warned immediately on save if claim ID is missing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Revenue Stream (custom or segment record, via saved search)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Warranty validation

**Custom Fields:**
- Invoice | `custbody_sna_inv_claimid`
- Invoice | `custbody_sna_jeforwarranty`
- Line | `cseg_sna_revenue_st`
- Revenue Stream | `custrecord_sn_for_warranty`

**Saved Searches:**
- Script parameter `custscript_sna_hul_revstr` (warranty revenue stream search)

### Integration Points
- Uses a saved search to identify warranty revenue streams.

### Data Requirements

**Data Volume:**
- Line-by-line revenue stream collection.

**Data Sources:**
- Invoice line segment values and saved search results.

**Data Retention:**
- No data persisted beyond validation.

### Technical Constraints
- Requires a valid saved search ID in script parameters.

### Dependencies
- **Libraries needed:** N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** Warranty flag on revenue stream records.

### Governance Considerations
- Client-side search execution on save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Warranty invoices are blocked without a claim ID.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_jeforwarranty.js | Client Script | Require warranty claim ID | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Identify warranty revenue streams and enforce claim ID.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice with warranty revenue stream and claim ID saves successfully.

**Edge Cases:**
1. Invoice with warranty revenue stream and no claim ID; save blocked.
2. Invoice with no warranty revenue stream; save allowed.

**Error Handling:**
1. Saved search missing should not allow warranty invoices without a claim ID.

### Test Data Requirements
- Revenue stream record flagged for warranty.

### Sandbox Setup
- Deploy script with a valid saved search parameter.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing users.

**Permissions required:**
- Edit invoices and view revenue stream data.

### Data Security
- Uses internal invoice data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm the warranty revenue stream saved search ID is configured.

### Deployment Steps
1. Upload `sna_hul_cs_jeforwarranty.js`.
2. Deploy to invoice form.

### Post-Deployment
- Validate save behavior for warranty invoices.

### Rollback Plan
- Remove the client script deployment.

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
- [ ] Should the script ignore warranty streams when the claim ID is present but empty string?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search parameter missing or invalid | Med | Med | Validate parameter at deployment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
