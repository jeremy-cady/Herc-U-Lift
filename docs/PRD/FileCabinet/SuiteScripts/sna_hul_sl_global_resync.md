# PRD: Global Resync

**PRD ID:** PRD-UNKNOWN-GlobalResync
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_global_resync.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that triggers a global resync of sales rep matrix data for customers matching zip codes.

**What problem does it solve?**
Allows admins to run a scoped resync using zip code filters without manual Map/Reduce scheduling.

**Primary Goal:**
Kick off the Map/Reduce update process for customers in specified zip codes.

---

## 2. Goals

1. Accept zip code input from the user.
2. Find customers whose address zip codes match input values.
3. Execute the Map/Reduce script to update sales matrix mappings.

---

## 3. User Stories

1. **As an** admin, **I want to** run a zip-based resync **so that** only relevant customers are updated.
2. **As an** admin, **I want to** avoid manual deployment management **so that** the process runs reliably.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must display a form requesting zip code input.
2. The Suitelet must parse and de-duplicate comma-separated zip codes.
3. The Suitelet must search active customers with matching address zip codes and non-inactive addresses.
4. The Suitelet must submit Map/Reduce `customscript_sna_hul_mr_update_all_cust` with customer IDs.
5. The Suitelet must manage deployments by reusing available deployments or creating a new one if needed.
6. The Suitelet must show a confirmation message after submission.

### Acceptance Criteria

- [ ] Map/Reduce is scheduled with matching customer IDs.
- [ ] UI confirms resync is in progress.
- [ ] Zip codes are trimmed and de-duplicated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update matrix data directly.
- Validate zip code formats beyond basic parsing.
- Provide progress status beyond a confirmation message.

---

## 6. Design Considerations

### User Interface
- Form titled "Global Resync" with a zip code text area.

### User Experience
- Simple input and confirmation flow.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customer
- scriptdeployment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Trigger resync
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Address | custrecord_sn_inactive_address | Address active flag

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Map/Reduce script `customscript_sna_hul_mr_update_all_cust`.

### Data Requirements

**Data Volume:**
- Potentially large customer sets based on zip coverage.

**Data Sources:**
- Customer address zip codes

**Data Retention:**
- No data created by the Suitelet itself.

### Technical Constraints
- Deployment management relies on cache and script deployment records.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Sales rep matrix update Map/Reduce

### Governance Considerations

- **Script governance:** Customer search and task submission.
- **Search governance:** Address join and filtering.
- **API limits:** Large resyncs may require multiple deployments.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Map/Reduce tasks start for selected customers.
- No duplicate zip codes are processed.

**How we'll measure:**
- Task submission logs and MR execution summaries.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_global_resync.js | Suitelet | Trigger sales matrix resync | Implemented |

### Development Approach

**Phase 1:** Validate customer search
- [ ] Confirm address filters and zip logic

**Phase 2:** Execute MR
- [ ] Run resync and review logs

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Zip codes match customers and MR is scheduled.

**Edge Cases:**
1. No matching customers results in empty parameter set.
2. Duplicate zip inputs are filtered out.

**Error Handling:**
1. No available deployment triggers new deployment creation.

### Test Data Requirements
- Customers with matching address zip codes

### Sandbox Setup
- Deploy Suitelet and Map/Reduce
- Ensure script deployments exist

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or sales ops admin

**Permissions required:**
- View access to customers
- Script deployment management permissions

### Data Security
- Uses address data; restrict access to admin roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Map/Reduce script deployed
- [ ] Suitelet deployed and accessible

### Deployment Steps

1. Deploy Suitelet.
2. Add link or menu access for admin users.

### Post-Deployment

- [ ] Verify MR task submissions

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet deployment.
2. Fix deployment or cache handling.

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

- [ ] Should the Suitelet allow running a full resync without zip filters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Deployment cache prevents new tasks when stale | Med | Med | Clear cache when tasks complete |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/task module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
