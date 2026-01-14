# PRD: Item Fulfillment WIP COGS Reclass (Custom GL)

**PRD ID:** PRD-UNKNOWN-FulfillmentWipCogsGL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_gl_fulfillment_wip_cogs.js (Custom GL Plugin)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Custom GL plugin that reclassifies COGS on item fulfillment transactions to a WIP account and updates linked journal entries.

**What problem does it solve?**
Ensures fulfillment COGS are moved to a configured WIP account for specific sales order forms, keeping accounting aligned with internal WIP processes.

**Primary Goal:**
Move COGS debits to a WIP account on item fulfillments and update related JE lines.

---

## 2. Goals

1. Identify qualifying item fulfillment transactions created from sales orders.
2. Reclassify COGS lines to a configured WIP account via custom GL lines.
3. Update linked journal entry lines to reflect the reclassification.

---

## 3. User Stories

1. **As an** accountant, **I want** fulfillment COGS reclassified to WIP **so that** WIP reporting is accurate.
2. **As an** admin, **I want** the WIP account configurable **so that** accounting policies can change.
3. **As a** developer, **I want** JE updates aligned **so that** linked entries stay consistent.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run only on `itemfulfillment` transactions created from sales orders.
2. The system must skip transactions that are not from supported sales order forms (IDs 112, 113, 106, 153).
3. The system must read the WIP account from script preference `custscript_sna_hul_gl_wip_account`.
4. For each COGS posting line, the system must create two custom GL lines:
   - Credit the original COGS account.
   - Debit the WIP account.
5. The system must collect COGS line details and update related JE lines referenced in `custbody_sna_hul_je_wip`.
6. Errors must be logged without halting execution.

### Acceptance Criteria

- [ ] Item fulfillment COGS lines are reclassified to the WIP account.
- [ ] Non-qualifying forms are skipped.
- [ ] Related journal entries update with reclassified lines.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Reclassify non-COGS accounts.
- Process non-item-fulfillment transactions.
- Handle sales orders without linked JEs.

---

## 6. Design Considerations

### User Interface
- None (GL plugin execution).

### User Experience
- Accounting reclassification occurs automatically during posting.

### Design References
- Sales order custom forms and WIP JE links.

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
- [x] Custom GL Plugin - COGS reclass on fulfillment

**Custom Fields:**
- Item Fulfillment | `custbody_sna_hul_je_wip`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One custom line pair per COGS line.

**Data Sources:**
- Standard GL lines on item fulfillment.

**Data Retention:**
- GL impact only; JE lines updated as needed.

### Technical Constraints
- Uses SuiteScript 1.0 API (`nlapi*`).
- Sales order form filtering is hard-coded by ID.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** WIP JE link field must contain JE IDs.

### Governance Considerations
- JE updates require record load/save; keep volume in mind.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Fulfillment COGS entries are reclassified to WIP for qualifying orders.

**How we'll measure:**
- Review GL impact and JE lines for a sample fulfillment.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_gl_fulfillment_wip_cogs.js | Custom GL Plugin | Reclassify COGS to WIP on fulfillment | Implemented |

### Development Approach

**Phase 1:** Identify COGS lines
- [x] Filter posting COGS lines and build reclass entries.

**Phase 2:** Update JE
- [x] Update linked journal entries when present.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item fulfillment from a qualifying sales order creates WIP reclass lines.

**Edge Cases:**
1. Item fulfillment from non-qualifying form; no reclass.
2. No linked JE; only custom GL lines added.

**Error Handling:**
1. JE update fails; error logged.

### Test Data Requirements
- Item fulfillment with COGS lines and linked JE.

### Sandbox Setup
- Custom GL plugin deployed with WIP account preference set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- GL plugin execution role with access to JE and account records.

**Permissions required:**
- Edit Journal Entry
- View Item Fulfillment and Sales Order

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_gl_fulfillment_wip_cogs.js`.
2. Set script preference `custscript_sna_hul_gl_wip_account`.
3. Deploy as a Custom GL Plugin.

### Post-Deployment

- [ ] Verify GL impact and JE updates.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Custom GL Plugin deployment.

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

- [ ] Should sales order form IDs be configurable instead of hard-coded?
- [ ] Should reclassification include class or other segments?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form ID changes break logic | Med | Med | Move form IDs to script parameters |
| JE updates overwrite existing lines | Low | Med | Review JE update logic for safety |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 Custom GL Plugin

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
