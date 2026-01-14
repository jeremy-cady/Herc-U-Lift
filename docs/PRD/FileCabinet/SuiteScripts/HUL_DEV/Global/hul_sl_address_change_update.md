# PRD: Address Change Asset Update (Suitelet)

**PRD ID:** PRD-UNKNOWN-AddressChangeSL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_sl_address_change_update.js (Suitelet)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_mr_address_change_update.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified (Suitelet); Map/Reduce uses `customscript_hul_mr_address_change_updat`
- Deployment ID: Not specified (Suitelet); Map/Reduce uses `customdeploy_hul_mr_address_change_updat`

---

## 1. Introduction / Overview

**What is this feature?**
A multi-step Suitelet wizard that updates equipment, projects, cases, and tasks when a customer’s site address changes, with real-time processing for small batches and Map/Reduce for large ones.

**What problem does it solve?**
Large address-change updates can exceed UI execution limits and require strict FSM sequencing; this wizard guides selection and executes updates safely.

**Primary Goal:**
Provide a guided workflow that enforces equipment-first updates and scales to large batches.

---

## 2. Goals

1. Guide users through selecting customer, sites, and impacted records.
2. Preview the changes before execution.
3. Execute updates in the required sequence with safe fallback to Map/Reduce.

---

## 3. User Stories

1. **As a** service admin, **I want to** update a site’s related records **so that** equipment, projects, cases, and tasks stay in sync.
2. **As an** FSM user, **I want** equipment updated first **so that** dependent records remain valid.
3. **As a** user, **I want** a preview of changes **so that** I can confirm before applying updates.

---

## 4. Functional Requirements

### Core Functionality

1. The system must present a 5-step wizard:
   - Step 1: Customer search
   - Step 2: Old/New site selection
   - Step 3: Record selection (equipment, cases, projects, tasks)
   - Step 4: Preview and processing mode
   - Step 5: Results or Map/Reduce confirmation
2. The system must search customers by name or ID and return up to 50 results.
3. The system must list active site assets (`custrecord_nxc_na_asset_type = '1'`) for the selected customer.
4. The system must list equipment assets by old site (`custrecord_nxc_na_asset_type = '2'`, `parent = oldSiteId`).
5. The system must list open cases for the customer/site (`status != 5`).
6. The system must list open projects for the customer/site (not inactive and status not closed).
7. The system must list open tasks by site (`status != COMPLETE`).
8. The system must allow select/deselect all per sublist and default all rows to selected.
9. The system must show a preview with record counts and prospective name/title changes.
10. For batches over 20 records, the system must offer a Map/Reduce processing option.
11. Real-time processing must enforce equipment-first updates and stop if equipment updates fail.
12. Real-time updates must:
    - Update equipment parent to new site.
    - Update project site, rebuild project name, and preserve equipment assets.
    - Update case site, update title, and preserve equipment assets.
    - Update task site, update title, and update address fields from the new site.
13. Map/Reduce processing must be triggered with parameters:
    - `custscript_acu_customer_id`
    - `custscript_acu_old_site_id`
    - `custscript_acu_new_site_id`
    - `custscript_acu_equipment_ids`
    - `custscript_acu_case_ids`
    - `custscript_acu_project_ids`
    - `custscript_acu_task_ids`
    - `custscript_acu_user_email`

### Acceptance Criteria

- [ ] Users can search for and select a customer.
- [ ] Old/New site dropdowns populate with active site assets.
- [ ] Equipment, cases, projects, and tasks lists render and can be selected in bulk.
- [ ] Preview page displays a summary and proposed name/title changes.
- [ ] Real-time processing updates records in the required order and halts on equipment failure.
- [ ] Map/Reduce is offered for large batches and triggers successfully.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update closed cases or inactive projects.
- Validate all business rules beyond the provided selections.
- Update unrelated record types.

---

## 6. Design Considerations

### User Interface
- Multi-step wizard with inline HTML and CSS for a guided flow.
- Select/deselect all buttons for each record sublist.

### User Experience
- Preview and confirmation reduce risk of incorrect updates.
- Clear results and error summary for real-time runs.

### Design References
- Address Change MR script behavior and FSM sequencing rules.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer
- Field Service Asset (`customrecord_nx_asset`)
- Project (`job`)
- Support Case
- Task

**Script Types:**
- [ ] Map/Reduce - Used by Suitelet for large batches
- [ ] Scheduled Script - Not used
- [x] Suitelet - Wizard interface and real-time updates
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Field Service Asset | `custrecord_nxc_na_asset_type` | Site vs equipment type
- Field Service Asset | `custrecord_nx_asset_customer` | Customer link
- Field Service Asset | `custrecord_sna_hul_fleetcode` | Fleet code
- Field Service Asset | `custrecord_nx_asset_serial` | Serial number
- Field Service Asset | `custrecord_nx_asset_address_text` | Address text
- Field Service Asset | `custrecord_nx_asset_latitude` | Latitude
- Field Service Asset | `custrecord_nx_asset_longitude` | Longitude
- Project | `custentity_nx_asset` | Site asset
- Project | `custentity_nxc_project_assets` | Equipment assets
- Project | `custentity_nx_project_type` | Project type (text)
- Case | `custevent_nx_case_asset` | Site asset
- Case | `custevent_nxc_case_assets` | Equipment assets
- Task | `custevent_nx_task_asset` | Site asset
- Task | `custevent_nx_address` | Address text
- Task | `custevent_nx_latitude` | Latitude
- Task | `custevent_nx_longitude` | Longitude

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- Triggers `customscript_hul_mr_address_change_updat` for Map/Reduce processing.

### Data Requirements

**Data Volume:**
- Real-time processing up to 20 records; larger sets via Map/Reduce.

**Data Sources:**
- SuiteQL queries on customer, assets, cases, projects, tasks.

**Data Retention:**
- Updated field values on existing records only.

### Technical Constraints
- FSM requires equipment parent updates before dependent record updates.
- Project name is rebuilt from type + number + new site, capped at 83 chars.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Address Change Map/Reduce script for large batches.

### Governance Considerations
- Real-time record loads/saves may hit governance limits; Map/Reduce used for scale.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Address changes are applied without FSM sequencing errors.
- Users can complete updates in real-time for small batches.
- Large batches successfully run via Map/Reduce.

**How we'll measure:**
- Suitelet completion logs and Map/Reduce status.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_sl_address_change_update.js | Suitelet | Wizard UI and real-time updates | Implemented |
| hul_mr_address_change_update.js | Map/Reduce | Background processing for large batches | Implemented |

### Development Approach

**Phase 1:** Wizard flow
- [x] Customer search and site selection
- [x] Record selection lists

**Phase 2:** Preview and processing
- [x] Preview summary and name/title regeneration
- [x] Real-time update logic and Map/Reduce trigger

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select customer, sites, and records; run real-time updates under 20 records.
2. Run a batch over 20 records and trigger Map/Reduce.
3. Verify project, case, and task names update correctly.

**Edge Cases:**
1. No records selected for one or more lists.
2. Equipment update fails and processing stops.
3. Old/new site names do not appear in titles (no change).

**Error Handling:**
1. SuiteQL query failure logs an error and returns empty list.
2. Record save failure logs and surfaces in results.

### Test Data Requirements
- Customer with multiple sites, equipment assets, open cases/projects/tasks.

### Sandbox Setup
- Ensure FSA site and equipment records exist and link to the customer.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users with access to run the Suitelet and edit related records.

**Permissions required:**
- Edit access to `customrecord_nx_asset`, `job`, `supportcase`, and `task`.

### Data Security
- Access restricted by role permissions and Suitelet deployment settings.

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

1. Upload `hul_sl_address_change_update.js` and `hul_mr_address_change_update.js`.
2. Create Suitelet and Map/Reduce script records.
3. Configure Suitelet deployment and permissions.
4. Configure Map/Reduce deployment and parameters.
5. Validate end-to-end flow in sandbox.

### Post-Deployment

- [ ] Verify updates on sample records.
- [ ] Monitor logs for errors.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet and Map/Reduce deployments.
2. Revert record updates if needed.

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

- [ ] Should the realtime threshold of 20 be configurable?
- [ ] Should closed cases be optionally included?
- [ ] Should site selection include inactive sites for historical updates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Equipment update failure halts processing | Med | High | Clear error summary and retry |
| Large batch timeouts | Med | High | Map/Reduce option for large batches |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_mr_address_change_update.md

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- SuiteScript 2.1 Map/Reduce
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
