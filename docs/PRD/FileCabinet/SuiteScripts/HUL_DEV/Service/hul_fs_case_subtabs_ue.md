# PRD: FS Case Open Cases Subtabs (User Event)

**PRD ID:** PRD-UNKNOWN-FSCaseSubtabsUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_ue.js (User Event)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: `customscript4392` (Suitelet)
- Deployment ID: `customdeploy1` (Suitelet)

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that injects an “Open Cases” tab/subtab UI on FS case forms and bootstraps inline client logic to load related cases.

**What problem does it solve?**
Adds a lightweight, embedded UI for related open cases without requiring custom form development.

**Primary Goal:**
Render the Open Cases subtab and wire it to the Suitelet data source on create/edit.

---

## 2. Goals

1. Add a top tab and subtab to the form on create/edit.
2. Inject a hidden Suitelet URL field for client use.
3. Render the Open Cases list container and CSS.

---

## 3. User Stories

1. **As a** service user, **I want** an Open Cases subtab **so that** I can see related cases quickly.
2. **As an** admin, **I want** the UI injected automatically **so that** no form customization is needed.
3. **As a** developer, **I want** inline bootstrap JS **so that** the list loads without extra dependencies.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad` for `CREATE` and `EDIT`.
2. The system must add:
   - Tab `custpage_open_cases_tab` (Open Cases)
   - Subtab `custpage_open_cases_subtab` (Related Cases)
3. The system must resolve Suitelet URL using:
   - Script ID `customscript4392`
   - Deployment ID `customdeploy1`
4. The system must add a hidden field `custpage_oc_sl_url` containing the Suitelet URL.
5. The system must add inline HTML with:
   - A card wrapper and list container (`openCasesList`)
   - CSS for table styling
6. The system must inject inline bootstrap JS that:
   - Loads SweetAlert2 from `SWAL_MEDIA_URL`
   - Fetches related cases via the Suitelet
   - Renders the table and shows a modal when cases exist

### Acceptance Criteria

- [ ] Open Cases tab appears on create/edit.
- [ ] Related Cases subtab renders the list container.
- [ ] Suitelet URL is available to the client logic.
- [ ] Inline JS initializes and loads case data when fields are set.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Run on view mode.
- Provide server‑side case filtering beyond the Suitelet.
- Store data on the case record.

---

## 6. Design Considerations

### User Interface
- Subtab card with table styling and inline CSS.

### User Experience
- Related cases list appears without navigation to other pages.

### Design References
- FS case subtab helper scripts.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Data endpoint
- [ ] RESTlet - Not used
- [x] User Event - UI injection
- [ ] Client Script - Inline bootstrap used instead

**Custom Fields:**
- None (uses injected fields).

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript4392` / `customdeploy1`
- SweetAlert2 media URL

### Data Requirements

**Data Volume:**
- Related cases per selection.

**Data Sources:**
- Suitelet JSON responses.

**Data Retention:**
- None.

### Technical Constraints
- SweetAlert2 loaded via external media URL.
- Inline JS does not use AMD modules.

### Dependencies
- **Libraries needed:** SweetAlert2 (media URL).
- **External dependencies:** Suitelet URL.
- **Other features:** Client helper/SL for data shape.

### Governance Considerations
- UI injection only; no record changes.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Open Cases subtab renders and loads related cases reliably.

**How we'll measure:**
- UI validation and user feedback.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fs_case_subtabs_ue.js | User Event | Inject Open Cases subtab UI | Implemented |

### Development Approach

**Phase 1:** UI injection
- [x] Add tab/subtab and list container

**Phase 2:** Inline bootstrap
- [x] Insert JS/CSS for data loading and alerts

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create or edit an FS case and see Open Cases tab.
2. Select customer/assets and see related cases list populate.

**Edge Cases:**
1. Suitelet URL fails to resolve; list remains empty.
2. SweetAlert fails to load; list still renders.

**Error Handling:**
1. Errors logged in UE and inline JS.

### Test Data Requirements
- FS cases with assets and related cases.

### Sandbox Setup
- Ensure Suitelet deployment IDs are correct.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users creating/editing FS cases.

**Permissions required:**
- Access to Suitelet deployment.

### Data Security
- Suitelet response governed by deployment permissions.

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

1. Upload `hul_fs_case_subtabs_ue.js`.
2. Deploy as User Event on support case record.
3. Verify subtab renders on create/edit.

### Post-Deployment

- [ ] Confirm case list loads in UI.
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

- [ ] Should the Suitelet script/deploy IDs be parameterized?
- [ ] Should the inline bootstrap be replaced with the helper client script?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hard-coded Suitelet IDs | Med | Med | Move to script parameters |
| Inline JS maintenance | Med | Low | Consolidate with helper CS |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.md

### NetSuite Documentation
- SuiteScript 2.1 User Event
- serverWidget API

### External Resources
- SweetAlert2 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
