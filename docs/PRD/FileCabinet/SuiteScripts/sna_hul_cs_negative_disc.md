# PRD: Negative Discount Validation Client Script

**PRD ID:** PRD-UNKNOWN-NegativeDiscount
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_negative_disc.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that prevents negative discount values on item lines for a specific record.

**What problem does it solve?**
It protects against negative discount entry for a targeted transaction record.

**Primary Goal:**
Clear negative discount values on item lines for the specified record ID.

---

## 2. Goals

1. Detect negative percent or dollar discount values.
2. Reset invalid discount values and warn the user.

---

## 3. User Stories

1. **As a** user, **I want** negative discounts blocked **so that** pricing stays valid.

---

## 4. Functional Requirements

### Core Functionality

1. On line validation, if the current record ID equals 2841204, the script must check `custcol_sna_hul_perc_disc` and `custcol_sna_hul_dollar_disc`.
2. If either value is negative, the script must clear both fields and alert the user.
3. Validation should allow the line to commit after clearing values.

### Acceptance Criteria

- [ ] Negative discount values are cleared and user is alerted.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Enforce discount rules for other records.
- Block save for negative discounts beyond clearing values.

---

## 6. Design Considerations

### User Interface
- Uses alert messages when invalid values are detected.

### User Experience
- Users are informed immediately when negative values are entered.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction record with item sublist (exact type not specified)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line validation

**Custom Fields:**
- Line | `custcol_sna_hul_perc_disc`
- Line | `custcol_sna_hul_dollar_disc`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One line check per validation.

**Data Sources:**
- Current line values.

**Data Retention:**
- None.

### Technical Constraints
- Record ID is hard-coded to 2841204.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** None.

### Governance Considerations
- Client-side only; no server governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Negative discounts are cleared on the targeted record.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_negative_disc.js | Client Script | Clear negative discounts on line validate | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Detect and clear negative values.
- **Phase 2:** None.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Enter a negative discount on record 2841204; fields clear and alert shows.

**Edge Cases:**
1. Enter positive discounts; no changes.
2. Open a different record ID; no validation executed.

**Error Handling:**
1. Missing record ID should not trigger validation.

### Test Data Requirements
- Record ID 2841204 with item lines.

### Sandbox Setup
- Deploy script to the relevant transaction form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users editing the specific transaction.

**Permissions required:**
- Edit transactions.

### Data Security
- Uses in-form data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm record ID 2841204 is correct for scope.

### Deployment Steps
1. Upload `sna_hul_cs_negative_disc.js`.
2. Deploy to the relevant transaction form.

### Post-Deployment
- Verify negative discount handling.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should the record ID be parameterized instead of hard-coded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Record ID changes or differs in other environments | Med | Med | Use script parameter for target record |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
