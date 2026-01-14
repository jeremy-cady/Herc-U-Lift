# PRD: Link Vendor Credit to Journal Entry (User Event)

**PRD ID:** PRD-UNKNOWN-LinkVBCreditToJE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sn_hul_ue_link_vb_to_je.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that links a vendor credit to a related journal entry after the credit is submitted.

**What problem does it solve?**
Ensures the journal entry record references the vendor credit for tracking and reconciliation.

**Primary Goal:**
Populate the journal entry field `custbody_sn_claimsbillcredit` with the vendor credit ID.

---

## 2. Goals

1. Detect the related journal entry from the vendor credit.
2. Update the journal entry with the vendor credit ID.
3. Log and surface errors if the update fails.

---

## 3. User Stories

1. **As an** accountant, **I want** journal entries linked to vendor credits **so that** I can trace claim activity.
2. **As an** admin, **I want** links created automatically **so that** manual updates are avoided.
3. **As a** developer, **I want** the update to occur after submit **so that** record IDs are available.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `afterSubmit`.
2. The system must read `custbody_sna_claims_je` on the vendor credit.
3. If a journal entry ID is present, the system must update the journal entry field `custbody_sn_claimsbillcredit` with the vendor credit ID.
4. The system must log debug messages for the JE ID and update result.
5. Errors must be logged and rethrown as a NetSuite error.

### Acceptance Criteria

- [ ] When `custbody_sna_claims_je` is set, the journal entry is updated with the vendor credit ID.
- [ ] When the JE field is empty, no update occurs.
- [ ] Errors are logged and raised.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create journal entries.
- Update vendor credit fields.
- Handle record types other than vendor credits.

---

## 6. Design Considerations

### User Interface
- None (server-side update).

### User Experience
- Journal entry linkage happens automatically after vendor credit save.

### Design References
- Vendor credit field `custbody_sna_claims_je`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Credit (trigger record)
- Journal Entry (target update)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Vendor credit afterSubmit handler
- [ ] Client Script - Not used

**Custom Fields:**
- Vendor Credit | `custbody_sna_claims_je`
- Journal Entry | `custbody_sn_claimsbillcredit`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One JE update per vendor credit with a linked JE.

**Data Sources:**
- Vendor credit fields and related JE ID.

**Data Retention:**
- Updates JE field only.

### Technical Constraints
- Runs after submit to ensure vendor credit ID is available.
- Throws a NetSuite error on failure.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Vendor credit must store JE ID in `custbody_sna_claims_je`.

### Governance Considerations
- One submitFields call per qualifying record.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Journal entries are correctly linked to vendor credits.

**How we'll measure:**
- Verify `custbody_sn_claimsbillcredit` on related journal entries.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_ue_link_vb_to_je.js | User Event | Link vendor credit to journal entry | Implemented |

### Development Approach

**Phase 1:** Read JE link
- [x] Read `custbody_sna_claims_je` from vendor credit.

**Phase 2:** Update JE
- [x] Submit JE update with vendor credit ID.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save a vendor credit with `custbody_sna_claims_je` populated; JE field updates.

**Edge Cases:**
1. Vendor credit without `custbody_sna_claims_je` does nothing.

**Error Handling:**
1. JE update fails due to permissions; error is logged and thrown.

### Test Data Requirements
- Vendor credit with a valid linked JE.

### Sandbox Setup
- User Event deployment on vendor credits.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to journal entries.

**Permissions required:**
- Edit Journal Entry
- View Vendor Credit

### Data Security
- Updates only the JE link field.

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

1. Upload `sn_hul_ue_link_vb_to_je.js`.
2. Deploy on Vendor Credit `afterSubmit`.
3. Test with a vendor credit linked to a journal entry.

### Post-Deployment

- [ ] Verify JE link field updates.
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

- [ ] Should the script validate the JE is not already linked to a different vendor credit?
- [ ] Should it run on create only instead of all edits?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing JE ID prevents linking | Med | Low | Ensure `custbody_sna_claims_je` is set earlier |
| JE update fails due to permissions | Med | Med | Verify deployment role permissions |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- record.submitFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
