# PRD: Online Case Form Field Toggle (SuiteScript 1.0)

**PRD ID:** PRD-UNKNOWN-OnlineCaseFormApi1
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_onlinecaseform_api1.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A SuiteScript 1.0 client script that enables or disables body and sublist fields based on job category and job type selections.

**What problem does it solve?**
It limits user input to fields relevant to the selected certification/testing job types and categories.

**Primary Goal:**
Control visibility and editability of related fields based on job category and job type.

---

## 2. Goals

1. Enable only relevant job fields when job category and types match rules.
2. Disable irrelevant product and test site fields on related sublists.
3. Disable case asset site when case category is empty.

---

## 3. User Stories

1. **As a** user, **I want** only the correct job fields enabled **so that** I do not enter irrelevant data.

---

## 4. Functional Requirements

### Core Functionality

1. When `custbody_sna_ob_type` or `custevent_sna_hul_caseassetsite` changes, the script must read `custbody_sna_job_category` and the selected job types.
2. For job categories 1, 2, or 4, the script must enable or disable fields based on selected job types (FCC, ISED, CE, MiC).
3. The script must toggle body fields such as model, assessment, IC, FCCID, and certification dates.
4. The script must toggle line fields on sublists `recmachcustrecord_sna_product_so` and `recmachcustrecord_sna_online_customer`.
5. On page init, if `category` is empty, the script must disable `custevent_sna_hul_caseassetsite`.

### Acceptance Criteria

- [ ] Fields are enabled only for matching job category and job type combinations.
- [ ] Case asset site field is disabled when category is empty.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate field values beyond enabling and disabling.
- Persist or calculate any data values.

---

## 6. Design Considerations

### User Interface
- Fields are disabled/enabled using client-side UI controls.

### User Experience
- Users see only the fields relevant to their job selections.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Applied-to record type for the deployment (not specified)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Field enable/disable

**Custom Fields:**
- Body | `custbody_sna_job_category`
- Body | `custbody_sna_ob_type`
- Body | `custbody_timco_modelno`
- Body | `custbody_sna_assessment_requested`
- Body | `custbody_timco_ic`
- Body | `custbody_timco_fccid`
- Body | `custbody_sna_target_certification_date`
- Body | `custbody_sna_certifcation_deferral_dat`
- Body | `custevent_sna_hul_caseassetsite`
- Line (Product) | `custrecord_sna_model_number`
- Line (Product) | `custrecord_sna_product_name`
- Line (Product) | `custrecord_sna_product_desc`
- Line (Product) | `custrecord_sna_technical_docu_id`
- Line (Product) | `custrecord_sna_trademark`
- Line (Online Customer) | `custrecord_sna_fcc_test_site`
- Line (Online Customer) | `custrecord_sna_ised_test_site`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- No data processing beyond field toggling.

**Data Sources:**
- Body field values and selected job types.

**Data Retention:**
- None.

### Technical Constraints
- SuiteScript 1.0 APIs (`nlapiDisableField`, `nlapiDisableLineItemField`).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Field configurations and job type values.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Only relevant job fields are enabled based on selections.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_onlinecaseform_api1.js | Client Script | Enable/disable job-related fields | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Implement job category/type rules and field toggles.
- **Phase 2:** Add case category check on page init.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select job category and FCC job type; FCC fields enabled and others disabled.
2. Select ISED job type; model and IC fields enabled.

**Edge Cases:**
1. Job category not in 1, 2, 4; all related fields disabled.
2. Case category empty; `custevent_sna_hul_caseassetsite` disabled.

**Error Handling:**
1. Missing job type selection should disable dependent fields.

### Test Data Requirements
- Job category and job type values matching the rule sets.

### Sandbox Setup
- Deploy script to the applicable record type with required fields.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users editing the applied-to record.

**Permissions required:**
- Edit access to the record and sublists.

### Data Security
- No sensitive data handling.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm job category and job type value IDs.

### Deployment Steps
1. Upload `sna_hul_cs_onlinecaseform_api1.js`.
2. Deploy to the applicable record.

### Post-Deployment
- Verify field enable/disable logic in the UI.

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
- [ ] What specific record type is this script deployed on?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Job type IDs change or expand | Med | Med | Externalize IDs or update rules |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 1.0 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
