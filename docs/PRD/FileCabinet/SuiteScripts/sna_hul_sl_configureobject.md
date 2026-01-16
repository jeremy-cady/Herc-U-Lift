# PRD: Configure Object

**PRD ID:** PRD-UNKNOWN-ConfigureObject
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_configureobject.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet used in rental order entry to configure object fields based on configuration rules.

**What problem does it solve?**
Allows users to enter or lock object configuration values per rule set and pass them back to the transaction line.

**Primary Goal:**
Collect and save object configuration values for a rental line or guide users to the next configuration step.

---

## 2. Goals

1. Determine configurable fields from object configuration rules.
2. Render those fields for editing or display based on locked rules.
3. Return selected configuration values to the transaction line.

---

## 3. User Stories

1. **As a** rental user, **I want to** configure object attributes **so that** order lines carry the correct configuration.
2. **As an** admin, **I want to** lock fields based on rules **so that** users cannot change restricted values.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must load object configuration rules from `customrecord_sna_object_config_rule`.
2. The Suitelet must match rules based on the object equipment segment or fallback rule.
3. The Suitelet must dynamically add object fields defined by the rule.
4. The Suitelet must respect locked fields by disabling them.
5. On submit from a line context, the Suitelet must write JSON configuration into line fields and close the window.
6. On submit from order entry, the Suitelet must redirect to `sna_hul_sl_selectratecard`.

### Acceptance Criteria

- [ ] Dynamic fields match the rule configuration.
- [ ] Locked fields are disabled.
- [ ] Line fields receive configuration JSON when used from a line.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Persist configuration values directly to object records.
- Validate user input beyond field types.
- Handle rule creation or maintenance.

---

## 6. Design Considerations

### User Interface
- Form titled "Configure Object" with General and Configuration groups.

### User Experience
- Supports both line-level popup and multi-step order entry flow.

### Design References
- Client script `sna_hul_cs_configureobject.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_objects
- customrecord_sna_object_config_rule

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Configure object fields
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_object_config_rule | custrecord_sna_hul_configurable_fields | Configurable field IDs
- customrecord_sna_object_config_rule | custrecord_hul_locked_fields | Locked field IDs
- customrecord_sna_object_config_rule | cseg_sna_hul_eq_seg | Segment filter
- customrecord_sna_object_config_rule | custrecord_sna_config_rule_type | Rule type
- Transaction Line | custcol_sna_hul_object_configurator | Config JSON
- Transaction Line | custcol_sna_hul_object_configurator_2 | Config JSON (overflow)
- Transaction Line | custcol_sna_hul_rental_config_comment | Config comments

**Saved Searches:**
- None (script builds search at runtime).

### Integration Points
- Redirects to `sna_hul_sl_selectratecard` in order entry flow.

### Data Requirements

**Data Volume:**
- Single object and rule lookup per request.

**Data Sources:**
- Object record fields
- Configuration rule records

**Data Retention:**
- Configuration stored on transaction line fields.

### Technical Constraints
- JSON configuration is split into two fields when > 4000 characters.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental order entry flow

### Governance Considerations

- **Script governance:** One object load and rule search per request.
- **Search governance:** Rule search is unfiltered and stops at first match.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Config fields are rendered and saved to the line correctly.
- Locked fields remain protected.

**How we'll measure:**
- Validation of line-level configuration fields after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_configureobject.js | Suitelet | Configure object fields for rental lines | Implemented |

### Development Approach

**Phase 1:** Rule validation
- [ ] Confirm rule configuration and segment matching

**Phase 2:** UI validation
- [ ] Test from line and order entry flows

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Object with segment matches rule and fields render.
2. Submit from line writes configuration JSON to line fields.

**Edge Cases:**
1. No matching segment uses fallback rule.
2. Long JSON splits into two fields.

**Error Handling:**
1. Missing object ID results in no dynamic fields.

### Test Data Requirements
- Object record with segment
- Rule records with configurable fields

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental order entry roles

**Permissions required:**
- View access to object records
- Edit access to transaction lines

### Data Security
- Configuration data should be limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm rule records exist
- [ ] Confirm line fields exist

### Deployment Steps

1. Deploy Suitelet.
2. Link from rental order entry flow or line popup.

### Post-Deployment

- [ ] Validate configuration output on line fields

### Rollback Plan

**If deployment fails:**
1. Remove Suitelet button/link.
2. Disable deployment.

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

- [ ] Should configuration rules be cached for performance?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Rule misconfiguration hides required fields | Med | Med | Validate rule content and test thoroughly |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/ui/serverWidget module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
