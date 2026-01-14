# PRD: Item Fulfillment WIP Reclass Custom GL Plugin

**PRD ID:** PRD-UNKNOWN-IFCustomGLPlugin
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_if_custom_gl_plugin.js (Custom GL Plugin)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A custom GL plugin that reclassifies COGS to a WIP account for item fulfillments created from specific Sales Order forms, and optionally updates linked Journal Entries.

**What problem does it solve?**
Ensures COGS is reclassified to the correct WIP account for eligible fulfillment transactions.

**Primary Goal:**
Add custom GL lines to move COGS to a WIP account and keep linked JEs in sync.

---

## 2. Goals

1. Detect eligible item fulfillments and sales order forms.
2. Generate custom GL lines to reclass COGS to WIP.
3. Update related WIP JEs when present.

---

## 3. User Stories

1. **As an** accounting user, **I want** COGS reclassified to WIP **so that** fulfillment accounting aligns with policy.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on item fulfillment transactions only.
2. The system must read WIP account from `custscript_sna_hul_gl_wip_account` preference.
3. The system must only proceed when the fulfillment is created from a Sales Order and the SO custom form is one of: 112, 113, 106, 153.
4. The system must build COGS groupings from fulfillment lines and add custom GL lines to credit COGS and debit WIP.
5. If `custbody_sna_hul_je_wip` contains JE IDs, the system must update those JE lines based on the fulfillment lines.

### Acceptance Criteria

- [ ] Eligible item fulfillments reclass COGS to WIP via custom GL lines.
- [ ] Linked WIP JEs are updated when referenced.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Reclassify non-item-fulfillment transactions.
- Run when WIP account preference is missing.
- Adjust transactions not created from Sales Orders or not in approved forms.

---

## 6. Design Considerations

### User Interface
- No UI changes; accounting effect only.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Fulfillment
- Sales Order
- Journal Entry
- Account

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used
- [x] Custom GL Plugin - WIP reclass

**Custom Fields:**
- Item Fulfillment | `custbody_sna_project_mainline`
- Item Fulfillment | `custbody_sna_hul_je_wip`
- Item Fulfillment | `custbody_sn_removed_lines`

**Saved Searches:**
- Item fulfillment COGS summary search.
- Account type lookup search.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per fulfillment transaction.

**Data Sources:**
- Fulfillment lines, standard GL lines, WIP JE references.

**Data Retention:**
- Custom GL lines and JE line updates.

### Technical Constraints
- Requires WIP account preference to be set.
- SO custom form IDs are hardcoded.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom GL framework and JE references on fulfillment.

### Governance Considerations
- Search usage for COGS and account types; JE loads and saves when present.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- COGS is reclassified to WIP for eligible fulfillments.

**How we'll measure:**
- Review GL impact and WIP JEs for test fulfillments.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_if_custom_gl_plugin.js | Custom GL Plugin | Reclass COGS to WIP | Implemented |

### Development Approach

**Phase 1:** Eligibility checks
- [x] Validate WIP account and SO form.

**Phase 2:** GL reclass
- [x] Add custom GL lines and update JEs.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item fulfillment from eligible SO form produces custom GL lines.

**Edge Cases:**
1. Missing WIP account preference; no reclass occurs.
2. Non-eligible SO form; no reclass occurs.
3. JE references present; lines updated.

**Error Handling:**
1. JE update failures are logged.

### Test Data Requirements
- Item fulfillment with COGS lines and WIP JE references.

### Sandbox Setup
- Set `custscript_sna_hul_gl_wip_account` preference.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting roles.

**Permissions required:**
- View and edit item fulfillments and JEs
- Run custom GL plugin

### Data Security
- No additional data exposure.

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

1. Upload `sn_hul_if_custom_gl_plugin.js`.
2. Deploy as custom GL plugin for item fulfillments.
3. Configure WIP account preference.

### Post-Deployment

- [ ] Verify GL reclass and JE updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the custom GL plugin deployment.

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

- [ ] Should the list of eligible SO forms be moved to parameters?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Hardcoded form IDs change | Med | Med | Use script parameters |
| JE updates fail due to missing lines | Low | Med | Add validation and logging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Custom GL Plugin

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
