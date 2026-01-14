# PRD: Lease Sales Orders Summary Suitelet

**PRD ID:** PRD-UNKNOWN-LeaseSalesOrdersSL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_mr.js (Map/Reduce)
- FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: `customscript_hul_lease_so_mr` (MR)
- Deployment ID: `customdeploy_hul_lease_so_mr` (MR)

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet UI that displays a lease sales orders dataset with filters, CSV export, and a rebuild workflow that triggers a Map/Reduce job.

**What problem does it solve?**
Provides a user‑friendly, performant view of lease sales orders using a cached JSON dataset instead of real‑time searches.

**Primary Goal:**
Render lease sales order data with filtering and dataset rebuild controls.

---

## 2. Goals

1. Display lease sales orders in a styled, filterable table.
2. Allow CSV export of filtered results.
3. Trigger and monitor dataset rebuilds.

---

## 3. User Stories

1. **As a** user, **I want** a filterable lease order list **so that** I can find records quickly.
2. **As an** admin, **I want** a rebuild button **so that** I can refresh the dataset.
3. **As a** user, **I want** to download CSV **so that** I can analyze data offline.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must support actions:
   - `action=csv` to download CSV
   - `action=rebuild` to trigger Map/Reduce
   - `action=poll` to show rebuild progress
2. The Suitelet must render a main page with:
   - Dataset status banner (last rebuild date)
   - Filter fields (order #, date range, customer, location)
   - Results table with clickable order numbers
3. The Suitelet must read the dataset file ID from:
   - URL parameter `fileid` (preferred)
   - Script parameter `custscript_hul_dataset_fileid` (fallback)
4. The Suitelet must load the dataset JSON and apply filters client‑side.
5. The CSV export must include only filtered rows.
6. The rebuild action must:
   - Submit MR task `customscript_hul_lease_so_mr`
   - Redirect to a poll page that refreshes every 10 seconds
7. The poll page must:
   - Display progress (with % estimate)
   - Delete the previous dataset file (best effort)
   - Find the newest dataset file in `OUTPUT_FOLDER_ID`
   - Update deployment params:
     - `custscript_hul_dataset_fileid`
     - `custscript_hul_last_rebuild_iso`
8. The main page must embed hidden fields with URLs for client script actions:
   - `custpage_csv_url`
   - `custpage_rebuild_url`
   - `custpage_clear_url`
9. The Suitelet must inject a custom CSS/JS theme and toolbar UI.

### Acceptance Criteria

- [ ] Main page renders dataset with filters and styled table.
- [ ] CSV export respects filters.
- [ ] Rebuild triggers MR and shows poll progress.
- [ ] Latest dataset file is selected and stored in deployment params.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Build the dataset directly (handled by MR).
- Provide real‑time transaction search.
- Manage dataset retention beyond latest file.

---

## 6. Design Considerations

### User Interface
- Material‑esque card UI, progress bar, and table styling.

### User Experience
- Rebuild flow with progress feedback and automatic refresh.

### Design References
- Lease dataset Suitelet UI CSS injected via INLINEHTML.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File
- Script Deployment
- Sales Order (for URL links only)

**Script Types:**
- [ ] Map/Reduce - Triggered by Suitelet
- [ ] Scheduled Script - Not used
- [x] Suitelet - UI and orchestration
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - UI buttons

**Custom Fields:**
- Script Deployment | `custscript_hul_dataset_fileid`
- Script Deployment | `custscript_hul_last_rebuild_iso`

**Saved Searches:**
- File search for latest dataset file in output folder.

### Integration Points
- Map/Reduce dataset builder
- Client script button handlers

### Data Requirements

**Data Volume:**
- Dataset JSON with all active lease orders.

**Data Sources:**
- JSON file in File Cabinet.

**Data Retention:**
- Latest dataset file; older files may be deleted manually.

### Technical Constraints
- `OUTPUT_FOLDER_ID` is hard‑coded to 5940799.
- Client script file ID is hard‑coded to 8441113.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** MR outputs dataset file and cache key.

### Governance Considerations
- File load and search operations during poll.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can rebuild and view lease datasets without errors.

**How we'll measure:**
- Suitelet logs and user feedback.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_lease_sales_orders_sl.js | Suitelet | Lease dataset UI and rebuild flow | Implemented |

### Development Approach

**Phase 1:** UI
- [x] Render status banner, filters, and results
- [x] Inject custom CSS/JS toolbar

**Phase 2:** Rebuild flow
- [x] Trigger MR and poll for completion
- [x] Update deployment params with latest file

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Load Suitelet with valid file ID and view dataset.
2. Apply filters and verify table + CSV export.
3. Trigger rebuild and confirm dataset refresh.

**Edge Cases:**
1. Missing file ID shows “No dataset selected.”
2. File load error shows error card.
3. Polling fails to locate new file.

**Error Handling:**
1. MR submission errors display a message.
2. File delete or param update errors are logged.

### Test Data Requirements
- Dataset file created by MR.

### Sandbox Setup
- Configure deployment parameters and output folder.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users with access to Suitelet deployment.

**Permissions required:**
- File Cabinet access to output folder
- Script deployment update permissions

### Data Security
- Dataset file access should be restricted by folder permissions.

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

1. Upload `hul_lease_sales_orders_sl.js`.
2. Deploy Suitelet with correct permissions.
3. Set `custscript_hul_dataset_fileid` and `custscript_hul_last_rebuild_iso`.
4. Ensure client script file ID is correct.

### Post-Deployment

- [ ] Validate UI, filters, and rebuild workflow.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet deployment.

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

- [ ] Should output folder ID be configurable?
- [ ] Should MR file lookup be replaced by cache retrieval?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hard-coded file IDs | Med | Med | Move to script parameters |
| Large dataset file | Med | Low | Consider pagination |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_mr.md
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Sales/hul_lease_sales_orders_cs.md

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- Task, File, Search APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
