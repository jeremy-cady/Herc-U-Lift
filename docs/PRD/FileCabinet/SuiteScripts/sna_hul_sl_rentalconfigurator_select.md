# PRD: Rental Configurator Select Options

**PRD ID:** PRD-UNKNOWN-RentalConfiguratorSelect
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator_select.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays select options for object fields and returns the selected value to the rental configurator.

**What problem does it solve?**
Allows users to set values for select-type configuration fields using a popup selection list.

**Primary Goal:**
Provide a dropdown of valid values for a selected object field.

---

## 2. Goals

1. Display a list of select options for a specified object field.
2. Return the selected value to the parent configurator sublist.
3. Support dummy and actual object selection contexts.

---

## 3. User Stories

1. **As a** rental user, **I want to** choose valid select values **so that** configuration entries are correct.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `fldname`, `line`, `objid`, and `actualobj` parameters.
2. The Suitelet must inspect the object record to find a select field matching `fldname`.
3. The Suitelet must populate a select field with available options.
4. On submit, the Suitelet must write the selected value back to the parent window and close.

### Acceptance Criteria

- [ ] Options display for select-type fields.
- [ ] Selected value is written to `custpage_actualsubfld` on the parent sublist.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate values beyond field options.
- Update the object record directly.
- Support non-select field types.

---

## 6. Design Considerations

### User Interface
- Popup form titled "Select Options" with a single dropdown and Submit/Cancel.

### User Experience
- Quick value selection for configuration rows.

### Design References
- Rental configurator suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Select option popup
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Uses object record select fields by label.

**Saved Searches:**
- None.

### Integration Points
- Rental configurator popup workflow.

### Data Requirements

**Data Volume:**
- Single object record lookup per request.

**Data Sources:**
- Object record field metadata

**Data Retention:**
- No data changes.

### Technical Constraints
- Field lookup is by label, which must be unique.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental configurator parent suitelet

### Governance Considerations

- **Script governance:** Object record load to inspect fields.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can select values and update configuration rows.

**How we'll measure:**
- Validate updated configuration values in the parent suitelet.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_rentalconfigurator_select.js | Suitelet | Select options for config fields | Implemented |

### Development Approach

**Phase 1:** Field option testing
- [ ] Confirm select fields populate correctly

**Phase 2:** Parent integration
- [ ] Validate value write-back

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select field returns options and writes value to parent.

**Edge Cases:**
1. Field name not found returns empty options.

**Error Handling:**
1. Invalid object ID logs an error and shows empty list.

### Test Data Requirements
- Object record with select fields

### Sandbox Setup
- Deploy Suitelet and configure popup link

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental operations roles

**Permissions required:**
- View access to object records

### Data Security
- No sensitive data beyond object configuration.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm popup URL is configured in parent suitelet

### Deployment Steps

1. Deploy Suitelet.
2. Ensure parent suitelet uses external URL parameter.

### Post-Deployment

- [ ] Validate selection flow

### Rollback Plan

**If deployment fails:**
1. Disable suitelet and remove popup link.
2. Use manual entry as fallback.

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

- [ ] Should field identification use internal ID instead of label?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field label changes break option lookup | Med | Med | Use internal IDs where possible |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/record getField

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
