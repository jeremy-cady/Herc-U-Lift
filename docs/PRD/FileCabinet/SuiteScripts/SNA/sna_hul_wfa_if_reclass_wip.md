# PRD: Item Fulfillment WIP Reclass (Workflow Action)

**PRD ID:** PRD-UNKNOWN-IFReclassWIP
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_wfa_if_reclass_wip.js (Workflow Action Script)
- FileCabinet/SuiteScripts/sn_hul_mod_reclasswipaccount.js (Module)

**Script Deployment (if applicable):**
- Workflow Action Script ID: Not specified
- Workflow ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A workflow action script that reclassifies WIP account entries for item fulfillments.

**What problem does it solve?**
Ensures WIP accounts are properly reclassified when item fulfillment workflows run.

**Primary Goal:**
Invoke the WIP reclassification module for item fulfillment records.

---

## 2. Goals

1. Accept a workflow action context and extract the record.
2. Call the reclass module for item fulfillment records.

---

## 3. User Stories

1. **As an** accounting user, **I want** WIP accounts reclassified **so that** fulfillment accounting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run as a workflow action script.
2. The system must call `mod_reclasswip.reclassWIPAccount` with the current record and record type `itemfulfillment`.

### Acceptance Criteria

- [ ] Workflow action executes without errors.
- [ ] WIP reclassification runs for item fulfillment records.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform reclassification logic inside the workflow action script itself.
- Handle record types other than item fulfillment.

---

## 6. Design Considerations

### User Interface
- No UI; workflow action only.

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
- [ ] User Event - Not used
- [x] Workflow Action Script - Triggers reclass logic

**Custom Fields:**
- None referenced here.

**Saved Searches:**
- None.

### Integration Points
- Module `sn_hul_mod_reclasswipaccount.js`.

### Data Requirements

**Data Volume:**
- One record per workflow action.

**Data Sources:**
- Item fulfillment record context.

**Data Retention:**
- Changes performed by module.

### Technical Constraints
- Depends on module availability at `/SuiteScripts/sn_hul_mod_reclasswipaccount.js`.

### Dependencies
- **Libraries needed:** `sn_hul_mod_reclasswipaccount.js`.
- **External dependencies:** None.
- **Other features:** Workflow configuration.

### Governance Considerations
- Minimal; dependent on module logic.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- WIP reclassification completes for fulfillment records.

**How we'll measure:**
- Verify GL impact for item fulfillments after workflow action runs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_wfa_if_reclass_wip.js | Workflow Action | Trigger WIP reclass | Implemented |

### Development Approach

**Phase 1:** Workflow hook
- [x] Invoke reclass module on action.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Trigger workflow on item fulfillment and verify reclass action runs.

**Edge Cases:**
1. Module load failure; error logged.

**Error Handling:**
1. Exceptions are caught and logged.

### Test Data Requirements
- Item fulfillment record with WIP impact.

### Sandbox Setup
- Workflow configured to run this action.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users running fulfillment workflows.

**Permissions required:**
- Execute workflow actions

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

1. Upload `sna_hul_wfa_if_reclass_wip.js` and the module.
2. Deploy Workflow Action and associate with workflow.

### Post-Deployment

- [ ] Verify workflow action runs and reclassification occurs.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the workflow action.

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

- [ ] Should this action validate record type before calling the module?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Module path changes break action | Med | Med | Validate module path during deployment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Workflow Action

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
