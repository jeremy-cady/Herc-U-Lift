# PRD: Doc Distribution Shift-Click Selection

**PRD ID:** PRD-UNKNOWN-DocDistributionShiftClick
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_doc_distribution_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Client Script that enables Shift‑click range selection for checkbox columns on the Doc Distribution results sublist.

**What problem does it solve?**
Users can quickly select or clear multiple rows at once instead of clicking each checkbox individually.

**Primary Goal:**
Improve sublist bulk‑selection efficiency without changing server logic.

---

## 2. Goals

1. Support Shift‑click range selection on key checkbox columns.
2. Avoid recursive field change events during bulk toggles.
3. Keep behavior limited to the current visible sublist page.

---

## 3. User Stories

1. **As a** user, **I want to** Shift‑click a checkbox range **so that** I can select multiple rows quickly.
2. **As a** user, **I want to** bulk‑clear a range **so that** I can reset selections easily.
3. **As an** admin, **I want to** limit changes to visible rows **so that** pagination behavior remains predictable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must listen for Shift key down/up events to detect Shift‑clicks.
2. The system must target sublist `custpage_results` only.
3. The system must apply range selection to fields: `hide_line`, `dismiss`, `apply_email`.
4. When Shift is held and a prior line exists for the field, the system must toggle the entire range to match the current checkbox value.
5. The system must prevent re‑entrant fieldChanged logic while toggling a range.

### Acceptance Criteria

- [ ] Shift‑clicking a checkbox in the supported columns toggles the range between the last click and current line.
- [ ] No infinite loop or recursion occurs during bulk updates.
- [ ] Behavior applies only within the current page of results.
- [ ] Non‑target sublists or fields are unaffected.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Apply selections across paged sublist results.
- Add new columns or modify server‑side processing.
- Persist custom selection state outside the sublist.

---

## 6. Design Considerations

### User Interface
- No UI changes; behavior is purely client‑side.

### User Experience
- Shift‑click mirrors standard desktop list selection behavior.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Suitelet sublist (`custpage_results`) in the Doc Distribution UI.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Host UI (not in this script)
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Shift‑click logic

**Custom Fields:**
- Sublist | `hide_line` | Hide line toggle
- Sublist | `dismiss` | Dismiss toggle
- Sublist | `apply_email` | Apply email toggle

**Saved Searches:**
- None.

### Integration Points
- Relies on the Doc Distribution Suitelet sublist structure.

### Data Requirements

**Data Volume:**
- Current page of sublist rows only.

**Data Sources:**
- Sublist values via `getSublistValue` and `setSublistValue`.

**Data Retention:**
- N/A.

### Technical Constraints
- Shift detection is global to the window and only affects supported fields.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** The sublist must expose `custpage_results` with supported fields.

### Governance Considerations
- Client‑side only; no server usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can bulk‑select or bulk‑clear lines using Shift‑click without errors.
- No reports of unexpected fieldChanged behavior occur.

**How we'll measure:**
- User feedback during Doc Distribution usage.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_doc_distribution_cs.js | Client Script | Shift‑click selection for sublist checkboxes | Implemented |

### Development Approach

**Phase 1:** Client‑side enhancement
- [x] Track Shift key state
- [x] Toggle range for supported checkbox columns
- [x] Prevent recursive fieldChanged calls

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Click a checkbox, then Shift‑click another in the same column → range toggled.
2. Repeat in each supported column.

**Edge Cases:**
1. Shift‑click without a prior anchor line → only current line toggles.
2. Shift‑click across page boundaries → only current page affected.

**Error Handling:**
1. Verify no console errors when toggling ranges.

### Test Data Requirements
- A results sublist with multiple rows and the three checkbox columns.

### Sandbox Setup
- Deploy client script to the Doc Distribution Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users of the Doc Distribution Suitelet.

**Permissions required:**
- Access to the Suitelet UI.

### Data Security
- No sensitive data is logged.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Attach the client script to the Doc Distribution Suitelet.
2. Validate Shift‑click behavior in production.

### Post-Deployment

- [ ] Monitor for UI issues or user complaints

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the Suitelet.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should additional checkbox columns be supported?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Sublist field IDs change in the Suitelet | Low | Medium | Update `CHECKBOX_FIELDS` list |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
