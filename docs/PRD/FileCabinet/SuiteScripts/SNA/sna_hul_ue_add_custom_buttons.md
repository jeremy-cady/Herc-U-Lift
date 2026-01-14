# PRD: Support Case Create Transaction Buttons (User Event)

**PRD ID:** PRD-UNKNOWN-AddCustomButtons
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_add_custom_buttons.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that adds custom buttons on Support Case records to create Sales Orders or Estimates, and pre-populates transaction fields when those records are created from the case.

**What problem does it solve?**
Streamlines creation of Sales Orders and Estimates from support cases, ensuring consistent defaults and preventing duplicate Sales Orders.

**Primary Goal:**
Provide quick-create buttons on support cases and auto-populate transaction fields based on case data.

---

## 2. Goals

1. Add buttons on support cases to create Sales Orders and Estimates using custom forms.
2. Pre-fill Sales Order and Estimate fields when created from a support case.
3. Warn about duplicate Sales Orders for the same case.

---

## 3. User Stories

1. **As a** support user, **I want** buttons to create Sales Orders and Estimates **so that** I can act quickly on cases.
2. **As an** admin, **I want** default fields populated **so that** data entry is consistent.
3. **As a** manager, **I want** duplicate Sales Orders flagged **so that** duplicates are avoided.

---

## 4. Functional Requirements

### Core Functionality

1. On Support Case view, the system must add "Create Sales Order" and "Create Estimate/Quote" buttons.
2. The system must select the Sales Order and Estimate custom forms based on case department and script parameters.
3. The Sales Order creation button must warn users if an open Sales Order already exists for the case.
4. When creating Sales Orders or Estimates with `supportcase` parameter, the system must pre-fill key fields (customer, subsidiary, department, location, contact, asset, revenue stream).
5. When creating a Sales Order, the system must set `custbody_nx_case` and `custbody_nx_task` defaults.
6. The system must update the support case with the created Sales Order ID in `custevent_nx_case_transaction`.

### Acceptance Criteria

- [ ] Buttons appear on support case view.
- [ ] Clicking buttons opens the correct custom form for the case department.
- [ ] New Sales Orders/Estimates are pre-filled with case data.
- [ ] Duplicate Sales Order warning is shown when appropriate.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create transactions automatically without user confirmation.
- Validate all field values beyond lookup results.
- Handle case creation or editing beyond button logic.

---

## 6. Design Considerations

### User Interface
- Buttons on support case view to launch Sales Order or Estimate creation.

### User Experience
- Quick access to create transactions, with confirmation when a duplicate SO is detected.

### Design References
- Script parameters for custom forms:
  - `custscript_sna_hul_rental_request`
  - `custscript_sna_hul_parts_req`
  - `custscript_sna_hul_form_serv_req`
  - `custscript_sna_hul_def_cust_form`
  - `custscript_sna_hul_rental_request_est`
  - `custscript__sna_hul_parts_req_esti`
  - `custscript_sna_hul_form_serv_req_esti`
  - `custscript_sna_hul_def_cust_form_estimat`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Sales Order
- Estimate
- Task

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Adds buttons and sets defaults
- [ ] Client Script - Not used

**Custom Fields:**
- Support Case | `custevent_nx_customer`
- Support Case | `custevent_sna_hul_casedept`
- Support Case | `custevent_sna_hul_caselocation`
- Support Case | `custevent_nx_case_asset`
- Support Case | `custevent_nxc_case_assets`
- Support Case | `cseg_sna_revenue_st`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_task`
- Support Case | `custevent_nx_case_transaction`

**Saved Searches:**
- Sales Order search to check for duplicates by case.

### Integration Points
- SuiteQL query to fetch earliest task for the case.

### Data Requirements

**Data Volume:**
- Single case and related task lookup per request.

**Data Sources:**
- Support case fields, task records, Sales Orders.

**Data Retention:**
- Updates support case with created Sales Order ID.

### Technical Constraints
- Duplicate detection only checks open Sales Orders.
- Form selection is driven by hardcoded department IDs.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Custom forms and task records.

### Governance Considerations
- Search and query usage per transaction creation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can create transactions from cases with correct defaults and warnings.

**How we'll measure:**
- Verify default values and duplicate warnings in sandbox.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_add_custom_buttons.js | User Event | Add buttons and set defaults | Implemented |

### Development Approach

**Phase 1:** Button logic
- [x] Add buttons on support case view.

**Phase 2:** Defaults and updates
- [x] Set default values and update support case on Sales Order creation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open support case and click "Create Sales Order"; verify defaults and task assignment.
2. Open support case and click "Create Estimate/Quote"; verify defaults.

**Edge Cases:**
1. Existing open Sales Order for case triggers confirmation.
2. Case lacks task records; Sales Order still opens without task default.

**Error Handling:**
1. Lookup or query errors are logged without blocking UI.

### Test Data Requirements
- Support case with department, customer, and tasks.

### Sandbox Setup
- Configure script parameters for custom forms.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Support and sales users.

**Permissions required:**
- View support cases
- Create Sales Orders and Estimates
- View tasks

### Data Security
- Ensure only authorized roles can create transactions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `sna_hul_ue_add_custom_buttons.js`.
2. Set custom form parameters for Sales Orders and Estimates.
3. Deploy User Event to Support Case, Sales Order, and Estimate as needed.

### Post-Deployment

- [ ] Verify button visibility and default field behavior.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should duplicate Sales Order detection include closed statuses?
- [ ] Should Estimate creation also check for duplicates?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect custom form parameter leads to wrong form | Med | Med | Validate parameter values per environment |
| Missing task data leaves Sales Order without task link | Low | Med | Add fallback or prompt user to select task |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/query module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
