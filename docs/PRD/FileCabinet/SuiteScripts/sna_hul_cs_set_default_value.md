# PRD: Sales Order Default Values Client Script

**PRD ID:** PRD-UNKNOWN-SetDefaultValue
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_set_default_value.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets default location, department, and revenue stream on Rental Sales Orders.

**What problem does it solve?**
It ensures required defaults are applied automatically for a specific sales order form.

**Primary Goal:**
Auto-populate location, department, and revenue stream for Rental Sales Orders.

---

## 2. Goals

1. Set employee location as the default transaction location.
2. Set Department to Rental (23).
3. Set Revenue Stream to 416 for Rental Sales Orders.

---

## 3. User Stories

1. **As a** sales user, **I want** defaults set automatically **so that** I do not manually set location and department.

---

## 4. Functional Requirements

### Core Functionality

1. On page init in create mode, if the form is ID 121, the script must set:
   - `location` to the current employee location
   - `department` to 23
   - `cseg_sna_revenue_st` to 416
2. On field change for `entity` or `customform`, if form ID is 121, the script must reapply the same defaults.
3. If department is missing after changes, the script must reset it to 23.

### Acceptance Criteria

- [ ] Defaults are set on create for the Rental Sales Order form.
- [ ] Defaults reapply when customer or form changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Set defaults on other forms.
- Validate that the user has access to the location.

---

## 6. Design Considerations

### User Interface
- No UI changes; fields are set automatically.

### User Experience
- Users see prefilled values on new Rental Sales Orders.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Employee

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Default value assignment

**Custom Fields:**
- Header | `customform`
- Header | `location`
- Header | `department`
- Header | `cseg_sna_revenue_st`

**Saved Searches:**
- None.

### Integration Points
- Looks up employee location via `search.lookupFields`.

### Data Requirements

**Data Volume:**
- Single lookup per create or change.

**Data Sources:**
- Current employee record.

**Data Retention:**
- Updates Sales Order header fields.

### Technical Constraints
- Form ID 121 is hard-coded.

### Dependencies
- **Libraries needed:** N/record, N/search, N/runtime.
- **External dependencies:** None.
- **Other features:** Rental Sales Order form configuration.

### Governance Considerations
- Client-side lookup on create and field change.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental Sales Orders have location, department, and revenue stream prefilled.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_set_default_value.js | Client Script | Set defaults on Rental Sales Orders | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Set defaults on create.
- **Phase 2:** Reapply defaults on field change.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a Rental Sales Order (form 121) and verify defaults.

**Edge Cases:**
1. Use a different form; defaults should not apply.
2. Change customer; defaults remain set.

**Error Handling:**
1. Employee has no location; location remains unchanged.

### Test Data Requirements
- Employee with a location set.

### Sandbox Setup
- Deploy client script to Sales Order form 121.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit Sales Orders and view employee records.

### Data Security
- Uses employee location data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm form ID 121 is the Rental Sales Order form.

### Deployment Steps
1. Upload `sna_hul_cs_set_default_value.js`.
2. Deploy to Sales Order form 121.

### Post-Deployment
- Validate defaults on new orders.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should form ID be parameterized instead of hard-coded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form ID changes | Low | Med | Use a script parameter for form ID |

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
