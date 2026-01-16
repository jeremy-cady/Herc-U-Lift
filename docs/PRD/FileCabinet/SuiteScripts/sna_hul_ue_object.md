# PRD: Object Config Field Visibility and Updates

**PRD ID:** PRD-UNKNOWN-Object
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_object.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that controls visibility of configuration fields on Object records and triggers downstream updates when object values change.

**What problem does it solve?**
Limits object configuration fields based on equipment segment rules and keeps related Sales Orders and POs in sync when object values change.

**Primary Goal:**
Show only relevant configuration fields for objects and propagate key changes to related records.

---

## 2. Goals

1. Show/hide configuration fields based on object segment rules.
2. Trigger a Map/Reduce update when commissionable book value changes.
3. Sync fleet code/serial updates to open Purchase Orders.

---

## 3. User Stories

1. **As a** user, **I want to** see only relevant configuration fields **so that** object forms are easier to use.
2. **As a** sales admin, **I want to** update SOs and POs when object values change **so that** data stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. In UI view mode, the script must show/hide fields based on configuration rules in `customrecord_sna_object_config_rule`.
2. On edit/xedit, if commissionable book value changes, the script must trigger MR `customscript_sna_hul_mr_upd_socombookval`.
3. On edit/xedit, if fleet code or serial number changes, the script must update matching PO lines with new values.

### Acceptance Criteria

- [ ] Configuration fields display based on matching segment rules.
- [ ] Commissionable book value changes trigger MR update.
- [ ] Related PO lines update fleet code/serial number.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify object configuration rules.
- Update closed or fully received POs.

---

## 6. Design Considerations

### User Interface
- Hides or shows configuration fields dynamically in view mode.

### User Experience
- Object form shows only applicable fields for the equipment segment.

### Design References
- Configuration rules stored in `customrecord_sna_object_config_rule`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects
- customrecord_sna_object_config_rule
- purchaseorder

**Script Types:**
- [ ] Map/Reduce - Uses MR for SO updates
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Field visibility and update triggers
- [ ] Client Script - N/A

**Custom Fields:**
- object | cseg_sna_hul_eq_seg | Equipment segment
- object | custrecord_sna_hul_obj_commissionable_bv | Commissionable book value
- object | custrecord_sna_fleet_code | Fleet code
- object | custrecord_sna_serial_no | Serial number
- PO line | custcol_sna_po_fleet_code | Fleet code
- PO line | custcol_sna_hul_eq_serial | Serial number
- PO line | custcol_sna_hul_fleet_no | Fleet object

**Saved Searches:**
- Search for open POs with fleet/serial values and outstanding quantities.

### Integration Points
- Map/Reduce `customscript_sna_hul_mr_upd_socombookval`.

### Data Requirements

**Data Volume:**
- Field visibility controlled per form view; PO updates per matching PO.

**Data Sources:**
- Object configuration rule records and PO line data.

**Data Retention:**
- Updates PO lines and triggers MR updates.

### Technical Constraints
- UI field hiding only runs in view mode and UI context.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Map/Reduce script for SO updates
- **Other features:** Object configuration rule records

### Governance Considerations

- **Script governance:** UI-only field logic and possible PO load/save.
- **Search governance:** PO search when fleet/serial changes.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Object forms show correct fields and PO/SO updates occur after object changes.

**How we'll measure:**
- Validate UI field visibility and PO updates after changes.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_object.js | User Event | Field visibility and update triggers | Implemented |

### Development Approach

**Phase 1:** Field visibility
- [ ] Validate rules for segment-based display

**Phase 2:** Update triggers
- [ ] Validate MR triggering and PO line updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. View object form and verify fields display per configuration rule.
2. Update commissionable book value and verify MR triggers.

**Edge Cases:**
1. Object without matching config rule uses default rule.
2. No related PO lines results in no updates.

**Error Handling:**
1. PO update errors are logged.

### Test Data Requirements
- Object records with configuration rules and linked PO lines

### Sandbox Setup
- Deploy User Event on Object record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Asset and sales admin roles

**Permissions required:**
- View objects
- Edit purchase orders

### Data Security
- Object data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm configuration rule records exist

### Deployment Steps

1. Deploy User Event on Object record.
2. Validate UI and update behavior.

### Post-Deployment

- [ ] Monitor logs for MR and PO update errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update POs manually if needed.

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

- [ ] Should PO updates be restricted to specific PO types?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field visibility rules drift from business needs | Low | Med | Review rule records periodically |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
