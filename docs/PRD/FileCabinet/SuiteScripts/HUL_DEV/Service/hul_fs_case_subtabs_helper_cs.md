# PRD: FS Case Subtabs Helper (Client Script)

**PRD ID:** PRD-UNKNOWN-FSCaseSubtabsHelperCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.js (Client Script)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that populates and manages the “Open Cases” subtab on Field Service cases, including dynamic loading, filtering, and SweetAlert notifications.

**What problem does it solve?**
Provides a responsive UI for related open cases based on customer and asset selections, with a guided “Show me” flow to the subtab.

**Primary Goal:**
Fetch related cases from a Suitelet and render them in a custom subtab list with optional user notification.

---

## 2. Goals

1. Detect changes to customer and asset fields.
2. Call a Suitelet to fetch related cases.
3. Render results in a custom list with notification.

---

## 3. User Stories

1. **As a** service user, **I want** related cases displayed **so that** I can see open work immediately.
2. **As an** admin, **I want** the list to update on changes **so that** it stays accurate.
3. **As a** user, **I want** a prompt to jump to the tab **so that** I can find the list quickly.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read:
   - Customer field `custevent_nx_customer` (fallback `company`)
   - Asset field `custevent_nxc_case_assets`
2. The system must build a Suitelet URL using hidden field `custpage_oc_sl_url`.
3. The system must fetch JSON from the Suitelet and expect:
   - `ok: true`
   - `rows: []`
4. The system must render a table with columns:
   - Open link, Case ID, Case #, Start Date, Customer, Assigned To, Revenue Stream, Subject
5. The system must display “No related cases” when empty.
6. The system must notify the user via SweetAlert:
   - One-time per selection (customer + assets)
   - Optional FORCE_NOTIFY override
7. The notification must offer “Show me” to activate the Open Cases tab and scroll to the list.
8. The system must watch for dynamic DOM insertion of the list container (`openCasesList`) and initialize listeners.
9. The system must refresh the list on:
   - pageInit
   - fieldChanged for customer/assets
   - DOM change listeners

### Acceptance Criteria

- [ ] Related cases render in the Open Cases list when customer/assets are present.
- [ ] Notifications appear when cases exist and prompt to switch tabs.
- [ ] No cases shows the empty message.
- [ ] Errors or missing prerequisites result in an empty list.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update case records.
- Provide server-side filtering beyond the Suitelet.
- Enforce access control (handled by Suitelet permissions).

---

## 6. Design Considerations

### User Interface
- Custom subtab list rendered with HTML table.
- SweetAlert informational prompt.

### User Experience
- Auto-refresh on customer/asset changes and “Show me” navigation.

### Design References
- FS Case Subtabs Suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Provides JSON data
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - UI and fetch/render

**Custom Fields:**
- Case | `custevent_nx_customer`
- Case | `custevent_nxc_case_assets`

**Saved Searches:**
- None.

### Integration Points
- Suitelet endpoint for related case data.

### Data Requirements

**Data Volume:**
- Case list for selected customer/assets.

**Data Sources:**
- Suitelet JSON response.

**Data Retention:**
- None.

### Technical Constraints
- Uses DOM APIs and `fetch` with XHR fallback.
- FORCE_NOTIFY is enabled for testing in script.

### Dependencies
- **Libraries needed:** `SuiteScripts/HUL_DEV/Global/hul_swal`.
- **External dependencies:** None.
- **Other features:** Subtab container IDs and hidden URL field must exist.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users see accurate related case lists on FS cases.

**How we'll measure:**
- User feedback and reduced navigation time.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fs_case_subtabs_helper_cs.js | Client Script | Render related case list and notify | Implemented |

### Development Approach

**Phase 1:** Data fetch
- [x] Build Suitelet URL and fetch JSON

**Phase 2:** UI
- [x] Render table and empty state
- [x] SweetAlert notification and tab activation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Case with customer/assets shows related cases list.
2. SweetAlert prompt appears and navigates to subtab.

**Edge Cases:**
1. No related cases renders empty state.
2. Missing Suitelet URL field renders empty state.

**Error Handling:**
1. Suitelet errors or bad JSON result in empty list.

### Test Data Requirements
- Support cases with assets and related open cases.

### Sandbox Setup
- Ensure subtab IDs and hidden URL field are present on the form.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users accessing FS case forms.

**Permissions required:**
- Access to Suitelet endpoint for related cases.

### Data Security
- Access governed by Suitelet deployment permissions.

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

1. Upload `hul_fs_case_subtabs_helper_cs.js`.
2. Deploy as client script on FS case form.
3. Verify Suitelet URL field and subtab IDs.

### Post-Deployment

- [ ] Confirm related cases list renders correctly.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the client script deployment.

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

- [ ] Should FORCE_NOTIFY be disabled in production?
- [ ] Should notifications be per-session only?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Subtab IDs change | Med | Med | Centralize IDs in config |
| Suitelet URL missing | Med | Low | Add guard or fallback |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.md

### NetSuite Documentation
- SuiteScript 2.x Client Script
- Fetch/XHR browser APIs

### External Resources
- SweetAlert2 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
