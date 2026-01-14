# PRD: Send to LiftNet Suitelet

**PRD ID:** PRD-UNKNOWN-SendToLiftNet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_sendtoliftnet.js (Suitelet)
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_sendtoliftnet.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that presents a "Send To LiftNet" form, generates an XML payload from an opportunity, and provides buttons to open/configure LiftNet workflows.

**What problem does it solve?**
Gives users a guided UI to send opportunity data to LiftNet and run related configurator actions.

**Primary Goal:**
Generate customer XML and provide UI actions to integrate with LiftNet.

---

## 2. Goals

1. Accept request parameters for quote and opportunity identifiers.
2. Search opportunity data and generate an XML payload.
3. Display a form with LiftNet-related actions.

---

## 3. User Stories

1. **As a** sales rep, **I want** to send opportunity data to LiftNet **so that** configurations can be created.
2. **As an** admin, **I want** a consistent UI **so that** LiftNet actions are easy to use.
3. **As a** developer, **I want** the XML generated from opportunity data **so that** LiftNet can consume it.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `quote_id`, `param_id` (transaction ID), and `estimate_id` parameters.
2. The system must load LiftNet URL from script parameter `custscript_param_liftneturl`.
3. The system must search opportunity data by transaction ID.
4. The system must generate a customer XML payload from the opportunity data.
5. The system must render a form with salesperson code, MCFA credentials, quote ID, and XML payload.
6. The system must attach client script `sna_hul_cs_sendtoliftnet.js`.
7. The system must provide buttons to open configurator, process LiftNet configuration, print quote, and download worksheet when a quote ID is present.

### Acceptance Criteria

- [ ] Form renders with required fields and XML payload.
- [ ] Buttons invoke client script functions with LiftNet URL.
- [ ] XML payload matches opportunity data.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update LiftNet records directly.
- Persist the XML to NetSuite records.
- Validate credentials entered in the form.

---

## 6. Design Considerations

### User Interface
- Suitelet form with fields and action buttons.

### User Experience
- Users can view XML payload and trigger LiftNet actions without leaving NetSuite.

### Design References
- LiftNet URL parameter `custscript_param_liftneturl`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Opportunity (transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - LiftNet form and XML generation
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Used for button actions

**Custom Fields:**
- Opportunity | `custbody_sna_mfr` (manufacturer)

**Saved Searches:**
- Transaction search for opportunity data.

### Integration Points
- LiftNet via client-side actions using provided URL.

### Data Requirements

**Data Volume:**
- One XML payload per request.

**Data Sources:**
- Opportunity fields and line items.

**Data Retention:**
- XML generated on demand; not stored.

### Technical Constraints
- XML is constructed manually and may require escaping.
- Client script functions must exist in `sna_hul_cs_sendtoliftnet.js`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** LiftNet URL and LiftNet availability.
- **Other features:** Client script for button actions.

### Governance Considerations
- Search usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- LiftNet form loads and XML payload is generated correctly.

**How we'll measure:**
- Validate XML output for a test opportunity and confirm buttons launch LiftNet actions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_sendtoliftnet.js | Suitelet | Render LiftNet form and XML | Implemented |

### Development Approach

**Phase 1:** Data retrieval
- [x] Search opportunity data.

**Phase 2:** UI rendering
- [x] Build Suitelet form and add client script buttons.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open Suitelet with valid opportunity ID and verify XML payload and buttons.

**Edge Cases:**
1. Opportunity not found; XML payload empty and form still renders.
2. Missing LiftNet URL parameter; buttons may fail.

**Error Handling:**
1. Search fails; error is logged.

### Test Data Requirements
- Opportunity with customer and line item data.

### Sandbox Setup
- Set `custscript_param_liftneturl` parameter for Suitelet deployment.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users sending data to LiftNet.

**Permissions required:**
- View opportunity records
- Access to client script

### Data Security
- XML payload includes customer data; ensure access is restricted to appropriate roles.

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

1. Upload `sna_hul_sl_sendtoliftnet.js` and `sna_hul_cs_sendtoliftnet.js`.
2. Set `custscript_param_liftneturl` for the deployment.
3. Validate form actions.

### Post-Deployment

- [ ] Verify LiftNet form and actions.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should XML be persisted for audit or re-use?
- [ ] Should LiftNet URL be validated in the Suitelet?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| XML output contains unescaped characters | Med | Med | Escape special characters in XML values |
| Missing LiftNet URL breaks client actions | Med | Med | Add validation for URL parameter |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/ui/serverWidget module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
