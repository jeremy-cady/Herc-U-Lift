# PRD: Case Record Client Script

**PRD ID:** PRD-UNKNOWN-CaseClientScript
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_case.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for case records that auto-populates related fields from selected equipment assets and can launch a new site asset creation flow.

**What problem does it solve?**
It reduces manual data entry and ensures case metadata is synced to the related equipment asset and case object.

**Primary Goal:**
Auto-populate case object, ownership, posting status, and warranty fields when equipment assets are selected.

---

## 2. Goals

1. Populate case fields based on equipment asset selection.
2. Allow creation of a new site asset when none is selected.
3. Support deep-linking case assets from URL parameters.

---

## 3. User Stories

1. **As a** support agent, **I want** case fields filled from the selected asset **so that** I do not enter redundant data.
2. **As a** support agent, **I want** to create a site asset from the case **so that** I can continue without leaving the workflow.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, if `custevent_nx_case_asset` is present in the URL, the system must set the case asset field.
2. When `custevent_nxc_case_assets` changes, the system must look up the related case object on the selected asset.
3. The system must populate `custevent_sna_hul_case_object` from the asset lookup.
4. The system must look up owner status, posting status, and warranty expiration from the case object and set corresponding case fields.
5. The system must provide a `showPrompt` action to open a new site asset in edit mode with context parameters.

### Acceptance Criteria

- [ ] Selecting an equipment asset auto-fills case object, owner status, posting status, and warranty expiration.
- [ ] `showPrompt` redirects to a new site asset record with prefilled parameters.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate warranty expiration rules.
- Create or update equipment assets directly (outside the new record flow).

---

## 6. Design Considerations

### User Interface
- Case fields update automatically after asset selection.
- New site asset opens in a separate edit flow.

### User Experience
- Minimal manual entry for key fields.
- User is redirected to create an asset only when needed.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Case (Support Case)
- Custom Record | `customrecord_nx_asset`
- Custom Record | `customrecord_sna_objects`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Case UI actions

**Custom Fields:**
- Case | `custevent_nx_case_asset`
- Case | `custevent_nxc_case_assets`
- Case | `custevent_sna_hul_case_object`
- Case | `custevent_sna_hul_owner_status`
- Case | `custevent_sna_hul_posting_status`
- Case | `custevent_sna_hul_warranty_expiration`
- Case | `custevent_nx_customer`
- Asset | `custrecord_sna_hul_nxcassetobject`
- Case Object | `custrecord_sna_owner_status`
- Case Object | `custrecord_sna_posting_status`
- Case Object | `custrecord_sna_warranty_expiration_date`
- Asset | `custrecord_nxc_na_asset_type`
- Asset | `custrecord_nx_asset_customer`
- Asset | `custrecord_sna_related_case`
- Asset | `custrecord_sna_hul_from_save_and_create`

**Saved Searches:**
- None.

### Integration Points
- Asset and case object lookups via `search.lookupFields`.
- Redirect to new asset record via `url.resolveRecord`.

### Data Requirements

**Data Volume:**
- One asset lookup per selection.

**Data Sources:**
- Case form fields, URL parameters, custom record lookups.

**Data Retention:**
- Updates case fields only.

### Technical Constraints
- Relies on client-side redirects and lookupFields.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/search.
- **External dependencies:** None.
- **Other features:** Custom case object and asset records.

### Governance Considerations
- Client-side only; minimal server usage for lookupFields.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Case fields consistently populate from selected assets.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_case.js | Client Script | Case field auto-population and asset creation flow | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Populate fields from asset selection.
- **Phase 2:** Add new asset creation redirect.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an equipment asset and verify case fields update.
2. Use `showPrompt` to create a new site asset from the case.

**Edge Cases:**
1. Asset selection is empty or first value is blank.
2. Case object lacks owner or posting status.

**Error Handling:**
1. Invalid asset ID should not break field updates.

### Test Data Requirements
- Equipment asset linked to a case object with owner, posting, and warranty values.

### Sandbox Setup
- Case form with the required custom fields and client script deployment.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Support agents.

**Permissions required:**
- View custom asset and case object records.

### Data Security
- Only reads related records; no sensitive data stored.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm field IDs on the case form match the script.

### Deployment Steps
1. Upload `sna_hul_cs_case.js`.
2. Deploy to the case record.

### Post-Deployment
- Verify field population on new and edited cases.

### Rollback Plan
- Remove the client script deployment from the case form.

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
- [ ] Should the script support multiple asset selections beyond the first value?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Asset lookup returns empty case object | Med | Low | Guard and skip field set |
| Redirect on showPrompt loses unsaved case changes | Med | Med | Notify users before redirect |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
