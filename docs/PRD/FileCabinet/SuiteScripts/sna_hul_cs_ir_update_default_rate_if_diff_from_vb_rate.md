# PRD: Item Receipt Rate Sync Client Script

**PRD ID:** PRD-UNKNOWN-IRUpdateDefaultRate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_ir_update_default_rate_if_diff_from_vb_rate.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that updates Item Receipt line rates to match related Vendor Bill rates when a PO is received.

**What problem does it solve?**
It ensures Item Receipt rates align with Vendor Bill rates when override flags are set.

**Primary Goal:**
Sync Item Receipt line rates to related Vendor Bill rates on copy mode.

---

## 2. Goals

1. Detect related Vendor Bills for the source purchase order.
2. Compare Item Receipt line rates to Vendor Bill rates.
3. Update Item Receipt line rates when overrides are enabled.

---

## 3. User Stories

1. **As a** receiving user, **I want** Item Receipt rates to match Vendor Bills **so that** costing is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On page init in copy mode, the script must identify the source purchase order.
2. The script must search Vendor Bills applied to the purchase order and group by item and override flag.
3. For each Item Receipt line, if the related Vendor Bill has `custcol_sna_override_ir_price` enabled and the rates differ, the script must update the Item Receipt line rate to match the Vendor Bill rate.
4. The script must commit each updated line.

### Acceptance Criteria

- [ ] Item Receipt rates update only when override flag is enabled.
- [ ] No changes are made if Vendor Bill rate is missing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update rates when not receiving from a PO.
- Adjust rates if override flag is not set.

---

## 6. Design Considerations

### User Interface
- No UI changes; updates occur on page init.

### User Experience
- Users see rates adjusted automatically after Receive from PO.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Receipt
- Purchase Order
- Vendor Bill

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Rate sync on copy

**Custom Fields:**
- Line | `custcol_sna_override_ir_price`
- Line | `item`
- Line | `rate`

**Saved Searches:**
- None (scripted search on Vendor Bill).

### Integration Points
- Vendor Bill search filtered by applied transaction and item.

### Data Requirements

**Data Volume:**
- One search per item line with filters appended.

**Data Sources:**
- Vendor Bills and Item Receipt line data.

**Data Retention:**
- Updates Item Receipt line rates only.

### Technical Constraints
- Search filters are mutated per line; ensure reset or new search if extending.

### Dependencies
- **Libraries needed:** N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** Vendor Bill override flag usage.

### Governance Considerations
- Client-side searches across Vendor Bills per line.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item Receipt line rates match Vendor Bill rates when overrides are enabled.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_ir_update_default_rate_if_diff_from_vb_rate.js | Client Script | Sync IR rates with VB rates | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Identify related Vendor Bills and pull rates.
- **Phase 2:** Update IR rates on copy.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Receive from PO with a VB override flag; IR rates update to VB rates.

**Edge Cases:**
1. No related Vendor Bill.
2. Override flag not set.

**Error Handling:**
1. Missing VB rate should skip updates.

### Test Data Requirements
- PO with related Vendor Bill lines and override flags.

### Sandbox Setup
- Deploy script to Item Receipt form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Receiving users.

**Permissions required:**
- View Vendor Bills and edit Item Receipts.

### Data Security
- Uses internal transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm override flag usage on Vendor Bill lines.

### Deployment Steps
1. Upload `sna_hul_cs_ir_update_default_rate_if_diff_from_vb_rate.js`.
2. Deploy to Item Receipt forms.

### Post-Deployment
- Validate IR rate updates after receive from PO.

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
- [ ] Should the Vendor Bill search be rebuilt per line to avoid filter accumulation?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Search filters accumulate per line | Med | Med | Recreate search per line |

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
