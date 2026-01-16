# PRD: NX Asset Redirect to Case

**PRD ID:** PRD-UNKNOWN-NXAsset
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_nxasset.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that redirects to a support case and sets the case asset when a NextService asset is created via a "Save and Create" flow.

**What problem does it solve?**
Links a newly created NextService asset back to its related case without manual navigation.

**Primary Goal:**
Redirect the user to the related case and set the case asset field.

---

## 2. Goals

1. Identify related support case based on customer and case title.
2. Redirect to the case in edit mode with the asset linked.

---

## 3. User Stories

1. **As a** service user, **I want to** return to the case after creating an asset **so that** the case is updated quickly.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on NextService asset records (non-delete).
2. If `custrecord_sna_related_case` and `custrecord_sna_hul_from_save_and_create` are present, the script must find the related case.
3. The script must redirect to the case in edit mode and pass `custevent_nx_case_asset` as a parameter.

### Acceptance Criteria

- [ ] Asset creation redirects to the related case when triggered from Save and Create.
- [ ] Case asset field is populated on redirect.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update cases when not triggered by the Save and Create flag.
- Create new cases.

---

## 6. Design Considerations

### User Interface
- Redirects the user to the case record.

### User Experience
- User lands on the related case with the asset field set.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_nx_asset
- supportcase

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Redirect and link asset
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_nx_asset | custrecord_sna_related_case | Case title
- customrecord_nx_asset | custrecord_nx_asset_customer | Customer
- customrecord_nx_asset | custrecord_sna_hul_from_save_and_create | Save and create flag
- supportcase | custevent_nx_case_asset | Case asset
- supportcase | custevent_nx_customer | Customer

**Saved Searches:**
- Search for support cases by customer and title.

### Integration Points
- Redirects to support case record.

### Data Requirements

**Data Volume:**
- One case search per asset creation.

**Data Sources:**
- NextService asset and support case data.

**Data Retention:**
- No data stored; redirect only.

### Technical Constraints
- Only runs when Save and Create flag is set.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Case creation flow

### Governance Considerations

- **Script governance:** One search per asset.
- **Search governance:** Low.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users are redirected to cases with asset field set after asset creation.

**How we'll measure:**
- Perform Save and Create from case and verify redirect behavior.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_nxasset.js | User Event | Redirect and link asset to case | Implemented |

### Development Approach

**Phase 1:** Case lookup
- [ ] Validate case search criteria

**Phase 2:** Redirect
- [ ] Validate redirect to case with parameters

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create asset via Save and Create and verify redirect to case.

**Edge Cases:**
1. No matching case results in no redirect.

**Error Handling:**
1. Search errors are logged.

### Test Data Requirements
- Support case with customer and title matching asset

### Sandbox Setup
- Deploy User Event on NextService asset record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Service roles

**Permissions required:**
- View and edit support cases

### Data Security
- Case data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm Save and Create flag field on NX asset

### Deployment Steps

1. Deploy User Event on NextService asset.
2. Validate redirect behavior.

### Post-Deployment

- [ ] Monitor logs for missing case matches

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Link cases manually if needed.

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

- [ ] Should case matching use case ID instead of title?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Case title mismatch prevents redirect | Med | Low | Consider using case ID field if available |

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
