# PRD: Sales Order Commission Override Client Script

**PRD ID:** PRD-UNKNOWN-SalesOrderCommissionOverride
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_salesorder.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enables manual commission amount entry on Sales Order lines when override is selected.

**What problem does it solve?**
It ensures commission amount edits are controlled and required when overrides are used.

**Primary Goal:**
Allow commission amount editing only when override is enabled and enforce required fields.

---

## 2. Goals

1. Enable or disable commission amount field based on override.
2. Require sales rep and commission amount when override is true.

---

## 3. User Stories

1. **As a** sales user, **I want** to override commission amounts **so that** special cases are supported.

---

## 4. Functional Requirements

### Core Functionality

1. When `custcol_sna_override_commission` changes on an item line, the script must enable or disable `custcol_sna_commission_amount`.
2. On line validation, if override is true and sales rep or commission amount is empty, the script must alert and block line commit.

### Acceptance Criteria

- [ ] Commission amount field is editable only when override is enabled.
- [ ] Missing sales rep or commission amount blocks line commit when override is enabled.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate commission amounts automatically.
- Update commission plan assignments.

---

## 6. Design Considerations

### User Interface
- Enables or disables the commission amount field in the item sublist.

### User Experience
- Users receive an alert when required override fields are missing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Commission override validation

**Custom Fields:**
- Line | `custcol_sna_override_commission`
- Line | `custcol_sna_commission_amount`
- Line | `custcol_sna_sales_rep`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per-line validation.

**Data Sources:**
- Current line values.

**Data Retention:**
- No data persisted beyond line changes.

### Technical Constraints
- None.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Sales Order line commission fields.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Commission override lines require sales rep and commission amount.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_salesorder.js | Client Script | Control commission override fields | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Toggle commission amount field.
- **Phase 2:** Enforce validation on line commit.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Enable override and enter sales rep and commission amount; line commits.

**Edge Cases:**
1. Override enabled without sales rep or commission amount; line blocked.

**Error Handling:**
1. Missing line values should prompt alert.

### Test Data Requirements
- Sales Order with commission fields on item lines.

### Sandbox Setup
- Deploy client script to Sales Order form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit Sales Orders.

### Data Security
- Uses line-level commission data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm commission fields are present on the item sublist.

### Deployment Steps
1. Upload `sna_hul_cs_salesorder.js`.
2. Deploy to Sales Order form.

### Post-Deployment
- Verify override behavior and validation.

### Rollback Plan
- Remove client script deployment from Sales Order form.

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
- [ ] Should commission amount be cleared when override is unchecked?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Users bypass override by leaving fields blank | Low | Med | Keep validation strict |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
