# PRD: Call Migrate To Precompute

**PRD ID:** PRD-UNKNOWN-CallMigrateToPrecompute
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sc_callmigratetoprecompute.js (Scheduled)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Scheduled script that triggers the FAM Migrate to Precompute scheduled script when needed.

**What problem does it solve?**
Ensures FAM Asset Values are created for script-created FAM assets when asset values are missing.

**Primary Goal:**
Kick off the FAM precompute process when there are eligible assets.

---

## 2. Goals

1. Identify FAM assets missing asset values.
2. Trigger the FAM migrate-to-precompute scheduled script when required.
3. Avoid unnecessary scheduling when no assets need processing.

---

## 3. User Stories

1. **As an** admin, **I want to** run precompute only when needed **so that** system usage is optimized.
2. **As a** finance user, **I want to** ensure FAM asset values are generated **so that** asset reporting is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search `customrecord_ncfar_asset` for records with empty `custrecord_assetvals` and `custrecord_sna_fa_created` = true.
2. When at least one record matches, the system must submit the scheduled script `customscript_fam_migratetoprecompute_ss` with deployment `customdeploy_fam_migratetoprecompute_ss`.

### Acceptance Criteria

- [ ] Precompute script is submitted only when eligible assets exist.
- [ ] No task is submitted when no assets match.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update FAM assets directly.
- Validate asset value correctness.
- Provide a UI for execution.

---

## 6. Design Considerations

### User Interface
- No UI; scheduled script only.

### User Experience
- Automatic background processing.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_ncfar_asset

**Script Types:**
- [ ] Map/Reduce - N/A
- [x] Scheduled Script - Trigger precompute
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_ncfar_asset | custrecord_assetvals | Asset values flag
- customrecord_ncfar_asset | custrecord_sna_fa_created | Script-created flag

**Saved Searches:**
- None (script builds search at runtime).

### Integration Points
- NetSuite FAM scheduled script `customscript_fam_migratetoprecompute_ss`.

### Data Requirements

**Data Volume:**
- Single lookup of eligible assets.

**Data Sources:**
- FAM Asset records.

**Data Retention:**
- No changes to records; only triggers another script.

### Technical Constraints
- Task submission depends on FAM script availability.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** NetSuite FAM bundle
- **Other features:** FAM migrate-to-precompute scheduled script

### Governance Considerations

- **Script governance:** Minimal, single search and optional task submit.
- **Search governance:** Simple search with two filters.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Precompute job runs when assets lack values.
- No unnecessary scheduling occurs.

**How we'll measure:**
- Task submission logs and FAM asset value checks.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sc_callmigratetoprecompute.js | Scheduled | Trigger FAM precompute | Implemented |

### Development Approach

**Phase 1:** Confirm search criteria
- [ ] Validate FAM fields are populated as expected

**Phase 2:** Execute and verify
- [ ] Run scheduled script and confirm downstream task submission

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Eligible assets exist and precompute task is submitted.

**Edge Cases:**
1. No eligible assets and task is not submitted.

**Error Handling:**
1. Missing FAM script deployment logs an error.

### Test Data Requirements
- FAM asset with empty `custrecord_assetvals` and `custrecord_sna_fa_created` = true

### Sandbox Setup
- Ensure FAM bundle and scheduled script are installed

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or FAM admin

**Permissions required:**
- Access to FAM assets and scheduled script execution

### Data Security
- No sensitive data beyond FAM asset metadata.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] FAM scheduled script exists
- [ ] Ensure script deployment IDs match

### Deployment Steps

1. Deploy scheduled script.
2. Schedule execution as needed.

### Post-Deployment

- [ ] Confirm precompute task submission

### Rollback Plan

**If deployment fails:**
1. Disable scheduled script.
2. Fix deployment IDs and re-run.

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

- [ ] Should the script be scheduled or triggered ad hoc?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| FAM script IDs change | Low | Med | Keep deployment IDs in configuration documentation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Scheduled Script
- N/task module

### External Resources
- NetSuite FAM documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
