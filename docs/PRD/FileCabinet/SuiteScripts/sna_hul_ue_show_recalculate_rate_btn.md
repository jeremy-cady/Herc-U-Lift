# PRD: Show Recalculate Rate Buttons

**PRD ID:** PRD-UNKNOWN-ShowRecalculateRateButtons
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_show_recalculate_rate_btn.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Adds action buttons to a transaction record to trigger rate recalculation and revenue stream updates.

**What problem does it solve?**
Provides an on-record, one-click path to recalculate line rates and update revenue stream dependent pricing.

**Primary Goal:**
Expose recalc actions from the transaction UI without manual navigation to Suitelets.

---

## 2. Goals

1. Add Recalculate Rate and Update Rev Stream & Recalc Rate actions on the record.
2. Route actions to the proper Suitelet or client script depending on context.
3. Avoid blocking record load if button wiring fails.

---

## 3. User Stories

1. **As a** sales user, **I want to** click a Recalculate Rate button **so that** line rates are refreshed.
2. **As a** sales user, **I want to** update revenue stream and recalc rates **so that** pricing reflects the latest stream.
3. **As an** admin, **I want to** expose these actions only on view/edit **so that** create flows remain unchanged.

---

## 4. Functional Requirements

### Core Functionality

1. On VIEW, the system must add a Recalculate Rate button that opens the recalc Suitelet with actionType=recalculateRate.
2. On VIEW, the system must add an Update Rev Stream & Recalc Rate button that opens the same Suitelet with actionType=updateRevStreamRecalcRate.
3. On EDIT, the system must set the client script module and add buttons that call client functions recalculateRate and updateRevStreamRecalcRate.
4. When button creation fails, the system must log an error and continue loading the record.

### Acceptance Criteria

- [ ] Viewing a record shows both recalc buttons and they redirect to the Suitelet with the record id.
- [ ] Editing a record shows both buttons and they call client functions.
- [ ] The script does not add buttons on create.
- [ ] Errors during button creation do not prevent record load.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify line item pricing directly.
- Validate revenue stream data.
- Replace the Suitelet or client script implementations.

---

## 6. Design Considerations

### User Interface
- Two buttons labeled Recalculate Rate and Update Rev Stream & Recalc Rate.
- Buttons appear only on VIEW or EDIT.

### User Experience
- VIEW buttons navigate to the Suitelet in the same window.
- EDIT buttons run client-side functions without navigation.

### Design References
- Existing Suitelet: customscript_sna_hul_sl_recalc_rate_revs.
- Existing client script: sna_hul_cs_recalculate_rate_rev_stream.js.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction record where this UE is deployed (e.g., Sales Order)

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Recalc suitelet target
- [ ] RESTlet - N/A
- [x] User Event - Button injection
- [x] Client Script - Edit-mode handlers

**Custom Fields:**
- None

**Saved Searches:**
- None

### Integration Points
- Suitelet: customscript_sna_hul_sl_recalc_rate_revs
- Client script module: sna_hul_cs_recalculate_rate_rev_stream.js

### Data Requirements

**Data Volume:**
- Per-record usage; no batch processing.

**Data Sources:**
- Current record id.

**Data Retention:**
- No data stored by this script.

### Technical Constraints
- Buttons only render on VIEW and EDIT contexts.
- Suitelet parameters must include custparam_actionType and custparam_soId.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Suitelet and client script must be deployed and accessible.

### Governance Considerations

- **Script governance:** Low usage; only beforeLoad.
- **Search governance:** None.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can trigger both recalc actions from the record UI.
- Suitelet receives the correct actionType and record id.
- No record load errors are reported due to button rendering.

**How we'll measure:**
- User validation in UI.
- Script logs for error-free beforeLoad.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_show_recalculate_rate_btn.js | User Event | Add recalc buttons on VIEW/EDIT | Implemented |

### Development Approach

**Phase 1:** Button wiring
- [x] Add Suitelet links for VIEW.
- [x] Add client script callbacks for EDIT.

**Phase 2:** Hardening
- [x] Add error handling and logging.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. View a record and click Recalculate Rate, confirm Suitelet launches with record id.
2. View a record and click Update Rev Stream & Recalc Rate, confirm Suitelet launches with record id.

**Edge Cases:**
1. View a record with missing id (unsaved), confirm no buttons are added.
2. Edit a record without client script available, confirm error is logged.

**Error Handling:**
1. Suitelet resolution throws an error, record still loads and error logged.

### Test Data Requirements
- A transaction record with line items and a valid internal id.

### Sandbox Setup
- Deploy Suitelet and client script in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to the record and the Suitelet deployment.

### Data Security
- No sensitive data is read or written by this script.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Suitelet deployment exists and is active.
- [ ] Client script file is accessible at the module path.

### Deployment Steps
1. Deploy the User Event to the intended record type.
2. Validate buttons appear on VIEW and EDIT.

### Post-Deployment
- Spot-check a record for button functionality.

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
- Which record types are officially supported for this deployment?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Suitelet deployment missing | Buttons fail | Validate deployment prior to release |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Suitelet

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
