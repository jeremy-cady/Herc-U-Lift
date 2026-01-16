# PRD: Timebill SO Update

**PRD ID:** PRD-UNKNOWN-TimebillSo
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_timebill_so.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that updates sales order line actual service hours based on a timebill.

**What problem does it solve?**
Keeps sales order line service hours aligned with timebill updates and triggers UE logic.

**Primary Goal:**
Update SO line service hours when timebill changes meet criteria.

---

## 2. Goals

1. Load the linked sales order and find the matching line by timebill ID.
2. Update actual service hours when conditions are met.
3. Redirect back to the timebill record.

---

## 3. User Stories

1. **As a** service manager, **I want to** sync timebill hours to SO lines **so that** billing is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `recid`, `linkedso`, `hours`, and `timeposted` parameters.
2. The Suitelet must locate the SO line with `custcol_sna_linked_time` equal to the timebill ID.
3. The Suitelet must update `custcol_sna_hul_act_service_hours` when conditions are met.
4. The Suitelet must redirect back to the timebill.

### Acceptance Criteria

- [ ] SO line hours update when timebill conditions match.
- [ ] No update occurs for closed orders or posted timebills.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or edit timebills.
- Update unrelated SO lines.
- Override order status constraints.

---

## 6. Design Considerations

### User Interface
- No UI; background update and redirect.

### User Experience
- Redirects back to timebill after update.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- timebill

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Update SO hours
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- SO Line | custcol_sna_linked_time | Linked timebill
- SO Line | custcol_sna_hul_act_service_hours | Actual service hours
- SO Line | custcol_nx_task | Task reference
- SO Line | custcol_sna_service_itemcode | Service item code

**Saved Searches:**
- None.

### Integration Points
- Uses script parameter `custscript_sna_servicetype_resource` for service item code.

### Data Requirements

**Data Volume:**
- Single timebill and SO per request.

**Data Sources:**
- SO line fields

**Data Retention:**
- Updates SO line hours.

### Technical Constraints
- Updates only when order status is not G or H and time is not posted.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Timebill UE process

### Governance Considerations

- **Script governance:** SO load/save per request.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- SO line service hours align with timebill hours.

**How we'll measure:**
- Spot checks of SO line hours vs timebill entries.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_timebill_so.js | Suitelet | Sync timebill hours to SO line | Implemented |

### Development Approach

**Phase 1:** Parameter validation
- [ ] Confirm timebill and SO link fields

**Phase 2:** Update validation
- [ ] Test updates under different order statuses

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Timebill updates SO line hours for resource service item.

**Edge Cases:**
1. Order status G/H prevents update.
2. Timebill already posted prevents update.

**Error Handling:**
1. Missing SO line logs and exits.

### Test Data Requirements
- Timebill linked to SO line

### Sandbox Setup
- Deploy Suitelet and set script parameter

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service management roles

**Permissions required:**
- Edit access to sales orders

### Data Security
- Only service-related fields are updated.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Script parameter for resource item set

### Deployment Steps

1. Deploy Suitelet.
2. Trigger from timebill workflow.

### Post-Deployment

- [ ] Validate updated SO line hours

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to manual updates.

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

- [ ] Should updates occur when timeposted is true?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect line mapping if linked timebill is missing | Low | Med | Validate linking on timebill creation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/record module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
