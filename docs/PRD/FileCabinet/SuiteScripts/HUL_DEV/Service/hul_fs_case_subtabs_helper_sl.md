# PRD: FS Case Subtabs Helper Suitelet

**PRD ID:** PRD-UNKNOWN-FSCaseSubtabsHelperSL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_sl.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that returns JSON for related open cases based on customer and asset IDs for use in the FS case subtab UI.

**What problem does it solve?**
Provides a lightweight, query‑based API to fetch related case data without loading heavy searches in the client.

**Primary Goal:**
Return a list of related cases filtered by customer, assets, revenue segments, and status.

---

## 2. Goals

1. Accept customer and asset IDs via GET parameters.
2. Query related support cases via SuiteQL.
3. Return JSON rows for the client UI.

---

## 3. User Stories

1. **As a** service user, **I want** related cases returned **so that** I can view them in the subtab.
2. **As an** admin, **I want** controlled filtering **so that** only relevant cases appear.
3. **As a** developer, **I want** a fast JSON endpoint **so that** the UI stays responsive.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept GET parameters:
   - `customerId`
   - `assetIds` (comma-separated)
2. The Suitelet must filter cases where:
   - `custevent_nx_customer` equals customerId
   - `cseg_sna_revenue_st` in `['106','107','108','263','18','19','204','205','206']`
   - `status` in `['1','2','4']`
   - case assets include any provided asset IDs
3. The Suitelet must return JSON with:
   - `case_id`, `case_number`, `case_start_date`
   - `custevent_nx_customer`, `case_assigned_to`, `revenue_stream`, `subject`
   - `open_url` pointing to the case
4. Missing or invalid parameters must return `ok: true` with empty rows.
5. Non‑GET requests must return `ok: false` with an error.

### Acceptance Criteria

- [ ] Valid parameters return matching case rows.
- [ ] Missing parameters return an empty row set.
- [ ] Errors return a structured JSON response.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update case data.
- Support POST/PUT/DELETE.
- Expose all case fields.

---

## 6. Design Considerations

### User Interface
- None (JSON response only).

### User Experience
- Fast response to power the Open Cases subtab.

### Design References
- FS case subtab client script.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - JSON endpoint
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Uses this Suitelet

**Custom Fields:**
- Case | `custevent_nx_customer`
- Case | `cseg_sna_revenue_st`
- Case | `custevent_nxc_case_assets`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- Client script loads this Suitelet via hidden URL field.

### Data Requirements

**Data Volume:**
- Case list per customer/asset selection.

**Data Sources:**
- SuiteQL query on supportcase + MAP table.

**Data Retention:**
- None.

### Technical Constraints
- Uses MAP_supportcase_custevent_nxc_case_assets join table.
- Hard‑coded revenue segment and status lists.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Client script for rendering.

### Governance Considerations
- SuiteQL query per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- The Open Cases subtab consistently loads relevant case data.

**How we'll measure:**
- Client script logs and user feedback.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_fs_case_subtabs_helper_sl.js | Suitelet | Provide related case JSON | Implemented |

### Development Approach

**Phase 1:** Input parsing
- [x] Validate GET parameters

**Phase 2:** Query + response
- [x] SuiteQL to fetch cases
- [x] Return JSON rows

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. GET with valid customer and asset IDs returns rows.

**Edge Cases:**
1. Missing customer or assets returns empty rows.
2. Non‑GET request returns error response.

**Error Handling:**
1. SuiteQL failure returns `{ ok: false, error: 'Query failed' }`.

### Test Data Requirements
- Support cases with matching revenue segments and assets.

### Sandbox Setup
- Ensure MAP table exists for asset associations.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles with access to Suitelet and support cases.

**Permissions required:**
- View access to support cases.

### Data Security
- Access controlled by Suitelet deployment permissions.

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

1. Upload `hul_fs_case_subtabs_helper_sl.js`.
2. Create Suitelet deployment.
3. Provide Suitelet URL to client script.

### Post-Deployment

- [ ] Verify JSON response and client rendering.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should revenue segments be configurable?
- [ ] Should status list include additional values?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Revenue/status lists change | Med | Med | Move to parameters |
| MAP table name changes | Low | High | Confirm mapping table name |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Service/hul_fs_case_subtabs_helper_cs.md

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
