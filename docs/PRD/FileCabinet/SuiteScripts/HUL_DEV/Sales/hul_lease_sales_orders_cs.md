# PRD: Lease Dataset Viewer Button Handlers (Client Script)

**PRD ID:** PRD-UNKNOWN-LeaseDatasetViewerCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that handles button actions for a Lease Dataset Viewer, including CSV download and dataset rebuild.

**What problem does it solve?**
Provides simple, reliable button actions on the Suitelet UI for downloading data and triggering rebuilds.

**Primary Goal:**
Wire UI buttons to hidden URLs for CSV download and rebuild actions.

---

## 2. Goals

1. Read hidden URL values from the page.
2. Navigate to the CSV download URL on click.
3. Navigate to the rebuild URL on click.

---

## 3. User Stories

1. **As a** user, **I want** to download the lease dataset **so that** I can analyze it offline.
2. **As an** admin, **I want** a rebuild action **so that** I can refresh the dataset.
3. **As a** support user, **I want** clear errors **so that** I know why a button failed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must expose `pageInit`, `onDownloadCsv`, and `onRebuildClick`.
2. The system must read hidden fields:
   - `custpage_csv_url`
   - `custpage_rebuild_url`
3. `onDownloadCsv` must navigate to `custpage_csv_url`.
4. `onRebuildClick` must navigate to `custpage_rebuild_url`.
5. Missing URLs must surface a user alert.

### Acceptance Criteria

- [ ] Clicking Download navigates to the CSV URL.
- [ ] Clicking Rebuild navigates to the rebuild URL.
- [ ] Missing URLs show an alert with error text.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Generate CSV content.
- Perform rebuild logic directly.
- Validate permissions.

---

## 6. Design Considerations

### User Interface
- Button handlers only; UI is provided by a Suitelet.

### User Experience
- Simple navigation actions with error alerts.

### Design References
- Lease Dataset Viewer Suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- None.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Provides UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Button handlers

**Custom Fields:**
- None (uses hidden page fields).

**Saved Searches:**
- None.

### Integration Points
- Suitelet page providing hidden URLs.

### Data Requirements

**Data Volume:**
- N/A.

**Data Sources:**
- DOM hidden fields.

**Data Retention:**
- None.

### Technical Constraints
- Requires DOM access to hidden fields.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet that sets hidden URLs.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Buttons reliably navigate to download/rebuild endpoints.

**How we'll measure:**
- User feedback and UI testing.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_lease_sales_orders_cs.js | Client Script | Button handlers for Lease Dataset Viewer | Implemented |

### Development Approach

**Phase 1:** URL access
- [x] Read hidden URL values

**Phase 2:** Actions
- [x] Navigate to download/rebuild URLs

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Click Download and verify CSV download starts.
2. Click Rebuild and verify rebuild request fires.

**Edge Cases:**
1. Hidden URL missing; alert shown.

**Error Handling:**
1. JavaScript errors display alert with message.

### Test Data Requirements
- Suitelet page with hidden URL fields.

### Sandbox Setup
- Ensure hidden fields are populated in the Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users with access to the Lease Dataset Viewer.

**Permissions required:**
- Permissions enforced by Suitelet endpoints.

### Data Security
- URLs should be protected by NetSuite permissions.

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

1. Upload `hul_lease_sales_orders_cs.js`.
2. Deploy as client script for the Lease Dataset Viewer Suitelet.
3. Verify hidden URL fields are populated.

### Post-Deployment

- [ ] Confirm download and rebuild actions work.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove/disable the client script deployment.

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

- [ ] Should button clicks be logged server-side?
- [ ] Should rebuild action require confirmation?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing hidden URL fields | Med | Low | Validate Suitelet fields |
| Rebuild endpoint unavailable | Low | Med | Add retry or error message |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
