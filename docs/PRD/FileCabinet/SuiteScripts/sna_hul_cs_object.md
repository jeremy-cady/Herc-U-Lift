# PRD: Object Configuration Field Visibility Client Script

**PRD ID:** PRD-UNKNOWN-ObjectConfigVisibility
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_object.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that controls which configuration fields are visible on the Object record based on equipment segment rules.

**What problem does it solve?**
It ensures only relevant configurable fields display for a given equipment segment and rule set.

**Primary Goal:**
Dynamically show or hide object configuration fields based on segment-driven rules.

---

## 2. Goals

1. Determine the applicable configuration rule based on equipment segment.
2. Show only fields listed by the rule and hide others.
3. Apply the same display logic on page load and when segment changes.

---

## 3. User Stories

1. **As a** user, **I want** only relevant configuration fields shown **so that** the form is easier to complete.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must read the segment `cseg_sna_hul_eq_seg` and apply field visibility based on configuration rules.
2. When `cseg_sna_hul_eq_seg` changes, the script must reapply visibility rules.
3. The script must load `customrecord_sna_object_config_rule` records to gather configurable field IDs.
4. The script must show fields listed in the matching rule and hide all other fields listed across rules.
5. If no segment match is found, the script must fall back to the rule with no segment or the temporary default rule.

### Acceptance Criteria

- [ ] Only fields configured for the segment are displayed.
- [ ] Switching the segment updates visible fields immediately.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate field values.
- Modify configuration rule records.

---

## 6. Design Considerations

### User Interface
- Fields are dynamically shown or hidden on the Object record.

### User Experience
- Users see a cleaner form relevant to the selected segment.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | `customrecord_sna_object_config_rule`
- Object record (custom record)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Field visibility control

**Custom Fields:**
- Object | `cseg_sna_hul_eq_seg`
- Config Rule | `custrecord_sna_hul_configurable_fields`
- Config Rule | `cseg_sna_hul_eq_seg`
- Object | various configuration fields listed in rules

**Saved Searches:**
- None (search created in script).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Reads all configuration rules on page init and segment change.

**Data Sources:**
- Configuration rule custom records.

**Data Retention:**
- No data persisted.

### Technical Constraints
- Relies on segment text inclusion matching for rule selection.

### Dependencies
- **Libraries needed:** N/search, N/currentRecord.
- **External dependencies:** None.
- **Other features:** Configuration rule records with field lists.

### Governance Considerations
- Client-side search on page load and segment changes.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Object configuration fields display correctly per segment rules.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_object.js | Client Script | Control object field visibility | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement rule lookup and field visibility.
- **Phase 2:** Add no-segment fallback behavior.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a segment and verify fields display based on rule.

**Edge Cases:**
1. Segment does not match any rule; fallback rule applied.
2. Segment is empty; rule with empty segment applied.

**Error Handling:**
1. Missing configuration rule records should not crash the form.

### Test Data Requirements
- Configuration rules with field lists and segments.

### Sandbox Setup
- Deploy client script to object record form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users editing object records.

**Permissions required:**
- View configuration rule records.

### Data Security
- Uses internal configuration metadata only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm configuration rules exist for each segment.

### Deployment Steps
1. Upload `sna_hul_cs_object.js`.
2. Deploy to object record form.

### Post-Deployment
- Validate field visibility by segment.

### Rollback Plan
- Remove client script deployment from object record.

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
- [ ] Should rule matching use internal IDs instead of segment text?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Segment text mismatch leads to wrong rule | Med | Med | Use internal IDs or normalized comparison |

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
