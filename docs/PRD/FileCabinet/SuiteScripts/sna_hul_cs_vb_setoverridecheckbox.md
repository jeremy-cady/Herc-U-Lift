# PRD: Vendor Bill Override IR Price Client Script

**PRD ID:** PRD-UNKNOWN-VBSetOverrideCheckbox
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_vb_setoverridecheckbox.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that toggles IR price override flags on Vendor Bill lines based on price differences from related purchase orders.

**What problem does it solve?**
It ensures IR price override flags are set when vendor bill rates differ from related PO rates.

**Primary Goal:**
Automatically set override flags when rate differences are detected.

---

## 2. Goals

1. Mirror `custcol_sna_hul_ir_price_diff` to `custcol_sna_override_ir_price`.
2. Compare Vendor Bill line rates against related PO rates and set flags when different.

---

## 3. User Stories

1. **As an** AP user, **I want** override flags set automatically **so that** IR prices reflect vendor bill differences.

---

## 4. Functional Requirements

### Core Functionality

1. When `custcol_sna_hul_ir_price_diff` changes, the script must set `custcol_sna_override_ir_price` to the same value.
2. When `rate` changes on a line, the script must load related PO rate data using saved search `customsearch_sna_bill_purchaseorders`.
3. If the related PO rate differs from the line rate, the script must set:
   - `custcol_sna_hul_ir_price_diff` to true
   - `custcol_sna_override_ir_price` to true
4. The script must cache related PO lookup results per item.

### Acceptance Criteria

- [ ] Override fields update when rate differs from PO rate.
- [ ] Override fields mirror manual `custcol_sna_hul_ir_price_diff` changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update PO rates.
- Validate items with no related PO.

---

## 6. Design Considerations

### User Interface
- Flags are updated automatically on line change.

### User Experience
- Users see override flags set without manual checks.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Bill
- Purchase Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Vendor bill pricing logic

**Custom Fields:**
- Line | `custcol_sna_hul_ir_price_diff`
- Line | `custcol_sna_override_ir_price`
- Line | `item`
- Line | `rate`

**Saved Searches:**
- `customsearch_sna_bill_purchaseorders`

### Integration Points
- Uses saved search data tied to applying transaction.

### Data Requirements

**Data Volume:**
- Search per item on first rate change (cached afterward).

**Data Sources:**
- Vendor Bill lines and purchase order search results.

**Data Retention:**
- Updates Vendor Bill line flags only.

### Technical Constraints
- Requires saved search ID in the script.

### Dependencies
- **Libraries needed:** N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** PO-to-VB relationship.

### Governance Considerations
- Client-side search and caching per item.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Override flags are set whenever vendor bill rates differ from PO rates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_vb_setoverridecheckbox.js | Client Script | Set override flags for IR pricing | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Mirror manual IR price diff flag.
- **Phase 2:** Auto-detect rate differences vs PO.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Change rate and verify override flags set when PO rate differs.

**Edge Cases:**
1. No related PO line; flags not set.
2. Rate equals PO rate; flags remain false.

**Error Handling:**
1. Saved search missing; no updates should occur.

### Test Data Requirements
- Vendor Bill applied to a PO with known rates.

### Sandbox Setup
- Deploy client script to Vendor Bill form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- AP users.

**Permissions required:**
- Edit Vendor Bills and view Purchase Orders.

### Data Security
- Uses internal transaction data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm saved search `customsearch_sna_bill_purchaseorders` exists.

### Deployment Steps
1. Upload `sna_hul_cs_vb_setoverridecheckbox.js`.
2. Deploy to Vendor Bill form.

### Post-Deployment
- Validate override flag behavior.

### Rollback Plan
- Remove client script deployment from Vendor Bill form.

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
- [ ] Should the cached lookup reset when vendor bill lines change items?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Saved search returns multiple PO lines | Low | Med | Ensure search filters are specific |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
