# PRD: Sales Tax Module (Internal Revenue Stream)

**PRD ID:** PRD-UNKNOWN-ModSalesTax
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mod_sales_tax.js (Library Module)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that determines whether a revenue stream is internal and returns that flag for downstream tax handling.

**What problem does it solve?**
It centralizes the lookup of internal revenue stream flags used by other scripts to set tax behavior.

**Primary Goal:**
Return whether the current transaction revenue stream is internal.

---

## 2. Goals

1. Look up the internal flag for a revenue stream segment.
2. Return the internal flag to calling scripts.

---

## 3. User Stories

1. **As a** developer, **I want** a central revenue stream check **so that** tax logic is consistent.

---

## 4. Functional Requirements

### Core Functionality

1. `updateLines` must read `cseg_sna_revenue_st` from the record.
2. The module must look up `custrecord_sna_hul_revstreaminternal` on the revenue stream record.
3. The module must return true when the revenue stream is internal.
4. The module must read script parameter `custscript_sna_tax_nontaxable` for downstream use.

### Acceptance Criteria

- [ ] Internal revenue streams return true for downstream tax logic.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Directly update tax codes or amounts.
- Persist changes to transaction lines.

---

## 6. Design Considerations

### User Interface
- None (library module).

### User Experience
- No direct UI impact.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_cseg_sna_revenue_st`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `cseg_sna_revenue_st`
- Revenue Stream | `custrecord_sna_hul_revstreaminternal`

**Saved Searches:**
- None.

### Integration Points
- Used by client scripts to determine internal tax logic.

### Data Requirements

**Data Volume:**
- Single lookup per call.

**Data Sources:**
- Revenue stream custom record.

**Data Retention:**
- No data persisted.

### Technical Constraints
- Module does not apply tax settings itself.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** Revenue stream configuration.

### Governance Considerations
- Minimal usage per lookup.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Downstream scripts can reliably detect internal revenue streams.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mod_sales_tax.js | Library Module | Return internal revenue stream flag | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Revenue stream lookup and return flag.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Revenue stream marked internal returns true.

**Edge Cases:**
1. Revenue stream missing; returns false.

**Error Handling:**
1. Lookup fails; return false without crash.

### Test Data Requirements
- Revenue stream records with internal flag values.

### Sandbox Setup
- None (module used by other scripts).

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Scripts using the module.

**Permissions required:**
- View revenue stream records.

### Data Security
- Uses internal configuration only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm revenue stream custom record field is present.

### Deployment Steps
1. Upload `sna_hul_mod_sales_tax.js`.
2. Ensure dependent scripts reference the module.

### Post-Deployment
- Validate internal revenue stream logic in dependent scripts.

### Rollback Plan
- Remove module or revert dependent scripts to prior logic.

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
- [ ] Should the module apply tax codes directly when internal is true?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Downstream scripts expect side effects | Low | Med | Document module behavior clearly |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
