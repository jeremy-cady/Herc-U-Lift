# PRD: Select Objects Suitelet Client Script

**PRD ID:** PRD-UNKNOWN-SelectObjects
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_selectobjects.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_selectobjects.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the Select Objects Suitelet that manages filter changes, pagination, and object selection from a list.

**What problem does it solve?**
It keeps Suitelet filters synchronized with the originating transaction and enforces selecting at least one object.

**Primary Goal:**
Let users filter and select objects, then return the selection to the Suitelet.

---

## 2. Goals

1. Populate default filter values from the originating transaction.
2. Refresh the Suitelet when filters or page navigation change.
3. Enforce object selection before saving.

---

## 3. User Stories

1. **As a** sales user, **I want** to filter available objects **so that** I can pick the correct equipment.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must capture current filter values into a global state and set defaults from the opener transaction when missing.
2. When pagination changes, the script must redirect the Suitelet while retaining selected objects and filter values.
3. When filter fields change, the script must refresh the Suitelet with updated parameters.
4. On save, the script must ensure at least one object is selected and set `custpage_selectedfld`.
5. The script must support canceling the Suitelet by closing the window.

### Acceptance Criteria

- [ ] Suitelet refreshes on filter and page changes.
- [ ] Save is blocked if no objects are selected.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate object availability.
- Create or update object records.

---

## 6. Design Considerations

### User Interface
- Uses URL redirects to update Suitelet filters.

### User Experience
- Keeps prior filter selections when navigating pages.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Suitelet for object selection
- Originating transaction (Sales Order or Quote)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Object selection UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Filter and selection handling

**Custom Fields:**
- Suitelet | `custpage_selectedfld`
- Suitelet | `custpage_objfld`
- Suitelet | `custpage_fleetnofld`
- Suitelet | `custpage_segmfld`
- Suitelet | `custpage_segmkeyfld`
- Suitelet | `custpage_respcenterfld`
- Suitelet | `custpage_manuffld`
- Suitelet | `custpage_modelfld`
- Suitelet | `custpage_custfld`
- Suitelet | `custpage_custprgrpfld`
- Suitelet | `custpage_trandtefld`
- Suitelet | `custpage_loccodefld`
- Suitelet | `custpage_dummyfld`
- Suitelet | `custpage_earliestfld`
- Suitelet | `custpage_equipsublist.custpage_selectsubfld`
- Suitelet | `custpage_equipsublist.custpage_objidsubfld`

**Saved Searches:**
- None.

### Integration Points
- Redirects to Suitelet `customscript_sna_hul_sl_selectobject` with filter parameters.

### Data Requirements

**Data Volume:**
- Suitelet filter updates and selection persistence.

**Data Sources:**
- Suitelet field values and opener transaction fields.

**Data Retention:**
- Selected object IDs stored in `custpage_selectedfld`.

### Technical Constraints
- Uses `window.opener` to read originating transaction fields.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/format.
- **External dependencies:** None.
- **Other features:** Select Objects Suitelet.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can filter and select objects without losing filter context.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_selectobjects.js | Client Script | Filter and selection handling in Suitelet | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Initialize filters from opener record.
- **Phase 2:** Handle filter changes, pagination, and selection validation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open Suitelet from Sales Order; filters prefill from transaction.
2. Select an object and save; selected value stored.

**Edge Cases:**
1. No objects selected; save blocked with alert.
2. Change page and ensure filters persist.

**Error Handling:**
1. Missing opener record should not crash page load.

### Test Data Requirements
- Sales Order with object selection workflow enabled.

### Sandbox Setup
- Deploy client script to the Select Objects Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Access to the Select Objects Suitelet.

### Data Security
- Uses internal transaction and object data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet script and deployment IDs.

### Deployment Steps
1. Upload `sna_hul_cs_selectobjects.js`.
2. Deploy to the Select Objects Suitelet.

### Post-Deployment
- Validate filter and selection behavior.

### Rollback Plan
- Remove client script deployment from the Suitelet.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should multiple object selection be allowed (radio vs checkbox)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large filters cause slow Suitelet reloads | Low | Med | Add server-side caching |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
