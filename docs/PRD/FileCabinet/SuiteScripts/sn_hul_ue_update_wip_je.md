# PRD: Update WIP JE on IF Edit/Delete (User Event)

**PRD ID:** PRD-UNKNOWN-UpdateWIPJE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_ue_update_wip_je.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that blocks deletion of item fulfillments with related WIP JEs and tracks removed lines on edit.

**What problem does it solve?**
Prevents deleting fulfillments with WIP reclass JEs and captures removed items for downstream JE updates.

**Primary Goal:**
Guard deletions and record removed line items for WIP JE maintenance.

---

## 2. Goals

1. Block deletion when WIP JE references exist.
2. Track removed item lines on edit using `custbody_sn_removed_lines`.

---

## 3. User Stories

1. **As an** accounting user, **I want** to block deleting fulfillments with WIP JEs **so that** accounting stays consistent.
2. **As an** admin, **I want** removed line items captured **so that** WIP JE updates can be applied.

---

## 4. Functional Requirements

### Core Functionality

1. On delete, the system must throw an error if `custbody_sna_hul_je_wip` is populated.
2. On edit, the system must identify item lines where `itemreceive` is false and record them in `custbody_sn_removed_lines`.
3. The system must exclude items that are still received from the removed list.

### Acceptance Criteria

- [ ] Deletion is blocked when related WIP JE exists.
- [ ] Removed items list is stored on edit.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update JEs directly.
- Run on create or other contexts beyond edit/delete.

---

## 6. Design Considerations

### User Interface
- Error message on delete.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Fulfillment

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Edit/delete guard
- [ ] Client Script - Not used

**Custom Fields:**
- Item Fulfillment | `custbody_sna_hul_je_wip`
- Item Fulfillment | `custbody_sn_removed_lines`

**Saved Searches:**
- None.

### Integration Points
- Downstream WIP JE update logic uses `custbody_sn_removed_lines`.

### Data Requirements

**Data Volume:**
- Line-level processing on edit.

**Data Sources:**
- Item fulfillment line items.

**Data Retention:**
- Writes removed line IDs to a header field.

### Technical Constraints
- Removed lines are tracked by item IDs only.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.

### Governance Considerations
- Line iteration per edit.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fulfillment deletions are blocked when WIP JEs exist.

**How we'll measure:**
- Attempt delete and verify error; edit and verify removed list.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_ue_update_wip_je.js | User Event | Guard delete and track removed lines | Implemented |

### Development Approach

**Phase 1:** Delete guard
- [x] Throw error when WIP JE exists.

**Phase 2:** Removed line tracking
- [x] Build `custbody_sn_removed_lines` on edit.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Edit IF with removed lines; field is populated.

**Edge Cases:**
1. Delete IF with WIP JE; deletion blocked.
2. No removed lines; field remains empty.

**Error Handling:**
1. Errors are logged by NetSuite.

### Test Data Requirements
- Item fulfillment with multiple lines and WIP JE reference.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users editing item fulfillments.

**Permissions required:**
- Edit item fulfillments

### Data Security
- No additional data exposure.

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

1. Upload `sn_hul_ue_update_wip_je.js`.
2. Deploy on Item Fulfillment.

### Post-Deployment

- [ ] Verify delete guard and removed lines field.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should removed lines track line IDs instead of item IDs?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate items in removed list | Med | Low | Store line IDs or de-duplicate |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
