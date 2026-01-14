# PRD: Object Configurator Client Script

**PRD ID:** PRD-UNKNOWN-ConfigureObject
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_configureobject.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_configureobjects.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that powers the rental object configurator UI, populating fields from prior selections and writing configuration data back to the originating transaction.

**What problem does it solve?**
It ensures object configuration data persists between Suitelet and transaction lines, and supports pre-filling values from rate cards or existing line data.

**Primary Goal:**
Keep object configuration fields synchronized between the Suitelet UI and the originating transaction.

---

## 2. Goals

1. Pre-fill configurator fields from stored configuration or transaction line values.
2. Disable configured or locked fields to prevent edits.
3. Write requested configuration values back to the transaction on save.
4. Support a back button flow to return to the object selection Suitelet.

---

## 3. User Stories

1. **As a** sales user, **I want** configurator fields prefilled **so that** I can continue editing quickly.
2. **As a** sales user, **I want** completed fields locked **so that** configured values are preserved.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the system must detect if the configurator was launched from a rate card or line and prefill fields accordingly.
2. When launched from a transaction line, the system must read JSON configuration data from line fields and apply values to the Suitelet form.
3. The system must disable fields that are already configured or listed as locked.
4. On save, the system must serialize current field values into a configuration array and write it back to the opener transaction.
5. The system must format select, checkbox, and date fields correctly for configuration output.
6. The back button must redirect to the object selection Suitelet with key context parameters.

### Acceptance Criteria

- [ ] Configurator fields populate based on stored configuration data.
- [ ] Locked fields cannot be edited.
- [ ] Configuration JSON is written back to the originating transaction.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate configuration rule logic server-side.
- Persist configuration changes outside the transaction context.

---

## 6. Design Considerations

### User Interface
- Configurator fields appear prefilled and may be disabled.

### User Experience
- Users can return to object selection without browser warnings.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order or Quote (originating transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Object configurator UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Configurator interactions

**Custom Fields:**
- Suitelet | `custpage_fromratecardfld`
- Suitelet | `custpage_fromlinefld`
- Suitelet | `custpage_fldidsfld`
- Suitelet | `custpage_lockedfldidsfld`
- Suitelet | `custpage_fldconfigfld`
- Suitelet | `custpage_custfld`
- Suitelet | `custpage_custpricegrpfld`
- Suitelet | `custpage_trandtefld`
- Suitelet | `custpage_loccodefld`
- Suitelet | `custpage_respcenterfld`
- Transaction Line | `custcol_sna_hul_object_configurator`
- Transaction Line | `custcol_sna_hul_object_configurator_2`
- Transaction Body | `custbody_sna_hul_rental_temp_config`
- Transaction Body | `custbody_sna_hul_rental_temp_config_id`

**Saved Searches:**
- None.

### Integration Points
- Uses `window.opener` to read and write values to the originating transaction.
- Redirects to Suitelet `customscript_sna_hul_sl_selectobject`.

### Data Requirements

**Data Volume:**
- One configuration object per configured element.

**Data Sources:**
- Suitelet fields and transaction line configuration JSON.

**Data Retention:**
- Configuration stored on the originating transaction.

### Technical Constraints
- Requires the Suitelet to be opened from a transaction context so `window.opener` is available.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/format.
- **External dependencies:** None.
- **Other features:** Suitelet `sna_hul_sl_configureobjects.js` and object selection Suitelet.

### Governance Considerations
- Client-side only; no server governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Configuration values persist between Suitelet sessions and the originating transaction.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_configureobject.js | Client Script | Prefill and save object configurator values | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Prefill fields from rate card or line data.
- **Phase 2:** Save configuration and return flow.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open configurator from a transaction line and verify fields populate.
2. Save configuration and confirm it writes to transaction fields.

**Edge Cases:**
1. Locked fields are disabled and preserved.
2. Date fields format correctly on save.

**Error Handling:**
1. Missing `window.opener` should be handled gracefully.

### Test Data Requirements
- Transaction with configured line JSON data.

### Sandbox Setup
- Suitelet and client script deployed in a transaction context.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users configuring rental objects.

**Permissions required:**
- Edit transactions.

### Data Security
- Configuration data stored on the transaction record only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet field IDs match the script expectations.

### Deployment Steps
1. Upload `sna_hul_cs_configureobject.js`.
2. Deploy to the object configurator Suitelet.

### Post-Deployment
- Validate configuration save and back button flows.

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
- [ ] Should the configurator validate required fields before save?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| `window.opener` not available | Low | Med | Display error and stop save |
| Locked field list out of sync | Low | Low | Validate locked field JSON |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- SuiteScript 2.x N/format

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
