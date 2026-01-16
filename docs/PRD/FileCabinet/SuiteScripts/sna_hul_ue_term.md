# PRD: Terms Description Custom Field

**PRD ID:** PRD-UNKNOWN-TermDescription
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_term.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Adds a custom Description field to the Terms record and stores its value in a custom record.

**What problem does it solve?**
Provides a managed, custom description for Terms without altering the native record schema.

**Primary Goal:**
Persist a user-entered Terms description in a related custom record.

---

## 2. Goals

1. Display a Description field on the Terms form.
2. Load existing description from the custom record.
3. Create or update the custom record on save.

---

## 3. User Stories

1. **As an** accounting admin, **I want to** store a detailed term description **so that** I can reference it later.
2. **As a** user, **I want to** see the current description when editing a term **so that** I can update it.
3. **As an** admin, **I want to** avoid modifying native fields **so that** upgrades remain safe.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeLoad, the system must add a LONGTEXT field custpage_desc labeled Description.
2. On beforeLoad, the system must load existing description from customrecord_sna_term_desc for the current term.
3. On afterSubmit, the system must update the existing custom record if found.
4. If no custom record exists, the system must create a new customrecord_sna_term_desc linked to the term.

### Acceptance Criteria

- [ ] The Description field appears on the Terms form.
- [ ] Existing description is pre-filled when editing a term.
- [ ] Saving the term updates or creates the custom record.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify native Terms fields.
- Enforce validation rules on the description.
- Update descriptions for inactive custom records.

---

## 6. Design Considerations

### User Interface
- Adds a LONGTEXT field labeled Description to the Terms form.

### User Experience
- Description is stored via a custom record behind the scenes.

### Design References
- Custom record: customrecord_sna_term_desc

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Terms
- Custom record: customrecord_sna_term_desc

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Form field and persistence
- [ ] Client Script - N/A

**Custom Fields:**
- Custom record | custrecord_sna_payment_term | Linked term
- Custom record | custrecord_sna_term_desc | Description
- UI field | custpage_desc | Form-only field

**Saved Searches:**
- None (ad hoc search for custom record)

### Integration Points
- Custom record storage for term descriptions

### Data Requirements

**Data Volume:**
- One custom record per term.

**Data Sources:**
- Terms record id.

**Data Retention:**
- Description stored in customrecord_sna_term_desc.

### Technical Constraints
- Uses form-only field and custom record persistence.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Custom record definition for term descriptions

### Governance Considerations

- **Script governance:** One search per load and submitFields or record create on save.
- **Search governance:** Single search for existing description record.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can save and retrieve term descriptions.

**How we'll measure:**
- Verify description persists across edits.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_term.js | User Event | Add and persist term description | Implemented |

### Development Approach

**Phase 1:** UI field
- [x] Add custpage_desc to the Terms form.

**Phase 2:** Persistence
- [x] Create or update customrecord_sna_term_desc.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open a term with existing description, verify field pre-populates.
2. Update description and save, verify custom record updated.

**Edge Cases:**
1. Term without existing custom record, verify record creation on save.

**Error Handling:**
1. Custom record creation fails, verify error logged.

### Test Data Requirements
- Terms records with and without related customrecord_sna_term_desc.

### Sandbox Setup
- Deploy User Event on Terms record.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to Terms and custom term description records.

### Data Security
- Only description text is stored in custom records.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Custom record customrecord_sna_term_desc exists and is active.

### Deployment Steps
1. Deploy User Event to Terms record.

### Post-Deployment
- Validate description persistence.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should inactive custom description records be reused or replaced?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing custom record | Description not saved | Ensure custom record deployment |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
