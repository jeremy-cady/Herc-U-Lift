# PRD: Vendor Price Mass Approval UI (Client Script)

**PRD ID:** PRD-UNKNOWN-VPMassApprovalCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_vpmassapproval.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that drives the vendor price mass approval Suitelet UI, including selection, paging, and filter controls.

**What problem does it solve?**
Enables users to select vendor price records for approval/rejection and navigate pages of results.

**Primary Goal:**
Provide client-side controls for selecting and paging vendor price approval records.

---

## 2. Goals

1. Track selected vendor price records in a hidden field.
2. Provide paging and filter controls for the Suitelet.
3. Support select-all and unselect-all behavior on the sublist.

---

## 3. User Stories

1. **As an** approver, **I want** to select multiple records **so that** I can approve them in batch.
2. **As an** approver, **I want** paging controls **so that** I can navigate large result sets.
3. **As an** admin, **I want** filter controls **so that** I can narrow results.

---

## 4. Functional Requirements

### Core Functionality

1. The system must track selected vendor prices in `custpage_fld_vptoapprove`.
2. When a line checkbox is toggled, the system must add/remove the vendor price ID.
3. The system must support changing pages via `next`, `prev`, and `jump`.
4. The system must refresh the Suitelet URL with page and filter parameters.
5. The system must support mark-all and unmark-all on the sublist.
6. The system must update URL parameters when the item category filter changes.

### Acceptance Criteria

- [ ] Selected vendor price IDs are tracked in the hidden field.
- [ ] Paging buttons update the Suitelet with the correct page.
- [ ] Mark-all toggles all row selections.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform approvals or rejections directly (Suitelet handles this).
- Export data to CSV (function exists but not exposed).
- Validate record eligibility for approval.

---

## 6. Design Considerations

### User Interface
- Operates on a Suitelet sublist (`custpage_slist_vp`).

### User Experience
- Users can select records and navigate pages without leaving the Suitelet.

### Design References
- Suitelet `customscript_sna_hul_sl_vpmassapprover`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Price custom records (displayed in Suitelet).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Host UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - UI controls

**Custom Fields:**
- Page fields: `custpage_fld_vptoapprove`, `custpage_fld_vptoreject`, `custpage_ps_fld_page`, `custpage_ps_fld_itemcatfilter`
- Sublist fields: `custpage_slf_select`, `custpage_slf_vp`

**Saved Searches:**
- None (Suitelet handles data).

### Integration Points
- Suitelet `customscript_sna_hul_sl_vpmassapprover` and export Suitelet `customscript_sna_hul_sl_vpforapprovalexp`.

### Data Requirements

**Data Volume:**
- Per page navigation and selection.

**Data Sources:**
- Suitelet-provided sublist rows.

**Data Retention:**
- Selection list stored in a hidden field.

### Technical Constraints
- Uses URL query parameters to manage pagination and filters.
- Some functions (export/reject) are defined but not returned.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet must render expected fields/sublist.

### Governance Considerations
- Client-side only; minimal governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can select multiple vendor prices and navigate pages reliably.

**How we'll measure:**
- Validate selected IDs and page navigation behavior.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_vpmassapproval.js | Client Script | Mass approval UI controls | Implemented |

### Development Approach

**Phase 1:** Selection handling
- [x] Track selected vendor prices in hidden field.

**Phase 2:** Paging
- [x] Navigate pages and refresh Suitelet URL.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select multiple records; hidden field updates.
2. Navigate pages; results update.

**Edge Cases:**
1. No records selected; actions should be blocked (handled by Suitelet).
2. Page number invalid; no action taken.

**Error Handling:**
1. URL resolve fails; user remains on current page.

### Test Data Requirements
- Suitelet with multiple pages of vendor price records.

### Sandbox Setup
- Client script deployed on mass approval Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users authorized to approve vendor pricing.

**Permissions required:**
- Access to the Suitelet.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_cs_vpmassapproval.js`.
2. Deploy with the vendor price approval Suitelet.
3. Validate selection and paging behavior.

### Post-Deployment

- [ ] Verify selection persistence and paging.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the Suitelet.

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

- [ ] Should selection persist across page refreshes?
- [ ] Should export/reject functions be exposed in the UI?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Selection list desyncs on paging | Med | Low | Persist selection in hidden field as designed |
| Large result sets slow UI | Low | Med | Optimize Suitelet paging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/url module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
