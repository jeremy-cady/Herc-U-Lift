# PRD: Address Change Asset Update (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-AddressChangeMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_mr_address_change_update.js (Map/Reduce)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_sl_address_change_update.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: `customscript_hul_mr_address_change_update`
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce that performs bulk updates when a customer’s site address changes, updating equipment, projects, cases, and tasks in a required sequence.

**What problem does it solve?**
Large address‑change batches exceed Suitelet real‑time limits; this MR handles the heavy updates while enforcing FSM sequencing constraints.

**Primary Goal:**
Safely update all related records for an address change with equipment → project → case → task ordering.

---

## 2. Goals

1. Build work items from Suitelet‑supplied IDs.
2. Update records in strict phase order.
3. Send a completion email with success/error counts.

---

## 3. User Stories

1. **As a** service admin, **I want to** process large address‑change batches **so that** updates complete reliably.
2. **As an** FSM user, **I want to** maintain equipment‑first sequencing **so that** downstream record updates are valid.
3. **As an** operator, **I want to** receive a completion email **so that** I know if errors occurred.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept parameters:
   - `custscript_acu_customer_id`
   - `custscript_acu_old_site_id`
   - `custscript_acu_new_site_id`
   - `custscript_acu_equipment_ids`
   - `custscript_acu_case_ids`
   - `custscript_acu_project_ids`
   - `custscript_acu_task_ids`
   - `custscript_acu_user_email`
2. The system must generate phased work items:
   - Phase 1: Equipment (update `parent`)
   - Phase 2: Projects (update `custentity_nx_asset` + name)
   - Phase 3: Cases (update `custevent_nx_case_asset` + title)
   - Phase 4: Tasks (update `custevent_nx_task_asset` + title + address/lat/long)
3. The system must enforce ordering using `phase_sequence` keys.
4. Projects must rebuild name from type + number + site name (83 char limit).
5. Cases/Tasks must replace old site name in title with new site name.
6. Project and case equipment assets must be preserved.
7. Tasks must update address fields from the new site asset.
8. The system must send a summary email to `custscript_acu_user_email`.

### Acceptance Criteria

- [ ] Equipment updates complete before project/case/task updates.
- [ ] Project names are rebuilt and truncated to 83 characters.
- [ ] Case/task titles reflect the new site name.
- [ ] Tasks update address, latitude, and longitude from site asset.
- [ ] Summary email contains counts and errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Execute real‑time Suitelet updates (handled by Suitelet).
- Validate inputs beyond provided IDs.
- Update unrelated records.

---

## 6. Design Considerations

### User Interface
- None (batch processing).

### User Experience
- Email summary provides visibility into success/errors.

### Design References
- Address Change Suitelet PRD in ADMIN_DEV documentation.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Equipment Asset (`customrecord_nx_asset`)
- Project (`job`)
- Support Case
- Task

**Script Types:**
- [x] Map/Reduce - Bulk updates with sequencing
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Project | `custentity_nx_asset`
- Project | `custentity_nxc_project_assets`
- Case | `custevent_nx_case_asset`
- Case | `custevent_nxc_case_assets`
- Task | `custevent_nx_task_asset`
- Task | `custevent_nx_address`
- Task | `custevent_nx_latitude`
- Task | `custevent_nx_longitude`

**Saved Searches:**
- None (SuiteQL used for name/address lookup).

### Integration Points
- Invoked by the Address Change Suitelet.

### Data Requirements

**Data Volume:**
- Batch IDs provided by Suitelet.

**Data Sources:**
- Script parameters and SuiteQL lookups for site/customer names.

**Data Retention:**
- Updated records only; no custom record storage.

### Technical Constraints
- FSM requires equipment updates before dependent records.
- Uses name replacement for case/task titles; project name is rebuilt.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet provides IDs and triggers MR.

### Governance Considerations
- record.load/save for projects/cases/tasks; submitFields for equipment.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Large batches complete without sequencing errors.
- Address updates match Suitelet preview.

**How we'll measure:**
- Email summaries and spot checks on updated records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_mr_address_change_update.js | Map/Reduce | Bulk address change updates | Implemented |

### Development Approach

**Phase 1:** Input + sequencing
- [x] Parameter parsing and phased work items
- [x] Key sort for ordering

**Phase 2:** Updates + email
- [x] Record updates per type
- [x] Summary email with errors

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Batch with equipment, projects, cases, tasks → all update in order.

**Edge Cases:**
1. No tasks or cases → only equipment/projects update.
2. Missing site name → titles remain unchanged.

**Error Handling:**
1. Record save fails → error captured and emailed.

### Test Data Requirements
- Customer with assets, cases, projects, tasks tied to a site.

### Sandbox Setup
- Run Suitelet with batch size above real‑time threshold.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running Map/Reduce.

**Permissions required:**
- Edit assets, projects, cases, tasks.
- Send email.

### Data Security
- Updates operational data; restrict deployment to admin roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Map/Reduce.
2. Configure Suitelet to trigger MR for large batches.

### Post-Deployment

- [ ] Verify email summaries and record updates.

### Rollback Plan

**If deployment fails:**
1. Disable Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the phase order be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Name replacement misses edge cases | Medium | Medium | Improve normalization logic |

---

## 15. References & Resources

### Related PRDs
- FileCabinet/SuiteScripts/HUL_DEV/ADMIN_DEV/Documentation/PRDs/PRD-20251210-AddressChangeAssetUpdate.md

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
