# PRD: PandaDoc E-Signature Request Button (Client Script)

**PRD ID:** PRD-UNKNOWN-PandaDocESignButtonCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/PandaDocs/sna_hul_cs_pd_esign_button.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that triggers a PandaDoc e-signature request from the current transaction using a Suitelet endpoint.

**What problem does it solve?**
Provides a user-initiated action to send the current transaction for PandaDoc e-signature.

**Primary Goal:**
Call the PandaDoc e-signature Suitelet for the current record and handle the response.

---

## 2. Goals

1. Resolve the PandaDoc Suitelet URL for e-signature requests.
2. Submit an e-signature request for the current record.
3. Reload the page on success or display an error.

---

## 3. User Stories

1. **As a** sales rep, **I want to** request e-signatures from a button **so that** I can send documents quickly.
2. **As an** admin, **I want** consistent request handling **so that** errors are visible to users.
3. **As a** developer, **I want** client logic isolated **so that** Suitelet integration is reusable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must resolve a Suitelet URL using `sna_hul_mod_pd.SUITELET.request_esginature`.
2. The system must send a POST request to the Suitelet with parameters:
   - `action: eSignatureRequest`
   - `id` (current record ID)
   - `record_type` (current record type)
   - `templateId` (template selected by the user)
3. The system must display an information message while the request is in progress.
4. On success response (`status === 'success'`), the system must reload the page.
5. On failure response, the system must display an alert with the error message.
6. Errors in the request flow must be logged to the console.

### Acceptance Criteria

- [ ] The button initiates a Suitelet POST with the correct parameters.
- [ ] Success response triggers a page reload.
- [ ] Failure response displays an alert message.
- [ ] Users see a progress message during the request.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Render or manage PandaDoc templates.
- Perform server-side document creation directly.
- Validate user permissions beyond Suitelet access.

---

## 6. Design Considerations

### User Interface
- Button triggers a request; progress message shown via `N/ui/message`.

### User Experience
- User receives immediate feedback and the page reloads after a successful request.

### Design References
- PandaDoc Suitelet defined in `sna_hul_mod_pd.SUITELET`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Any transaction types supported by the Suitelet.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Target endpoint
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - E-signature request action

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript_sna_hul_sl_esign_request` / `customdeploy_sna_hul_sl_esign_request`.

### Data Requirements

**Data Volume:**
- One request per button click.

**Data Sources:**
- Current record ID and type.

**Data Retention:**
- None; response is handled in the client.

### Technical Constraints
- Requires module `./modules/sna_hul_mod_pd` for Suitelet IDs.
- Uses `https.post.promise` for async request.

### Dependencies
- **Libraries needed:** `FileCabinet/SuiteScripts/SNA/PandaDocs/modules/sna_hul_mod_pd.js`.
- **External dependencies:** None.
- **Other features:** Suitelet implementation must support `eSignatureRequest` action.

### Governance Considerations
- Client script uses one Suitelet request per action.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can trigger PandaDoc e-signature requests from the record page.

**How we'll measure:**
- Verify Suitelet requests and successful page reloads.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_pd_esign_button.js | Client Script | Trigger PandaDoc e-signature request | Implemented |

### Development Approach

**Phase 1:** Request setup
- [x] Resolve Suitelet URL and parameters.

**Phase 2:** Response handling
- [x] Reload on success; alert on error.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Click e-signature button with a valid template ID; page reloads after success.

**Edge Cases:**
1. Suitelet returns error status; alert is shown.
2. Network error while posting; error logged in console.

**Error Handling:**
1. Invalid template ID results in error response.

### Test Data Requirements
- A transaction record and valid PandaDoc template ID.

### Sandbox Setup
- Client script deployed to the transaction form with the PandaDoc Suitelet deployed.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- User roles with permission to run the Suitelet and view the transaction.

**Permissions required:**
- Access to Suitelet deployment
- View transaction record

### Data Security
- Client script transmits record ID/type only; sensitive data handled server-side.

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

1. Upload `sna_hul_cs_pd_esign_button.js`.
2. Deploy on target transaction forms.
3. Verify Suitelet URL resolution and request flow.

### Post-Deployment

- [ ] Verify successful e-signature requests.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the form.

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

- [ ] Should the client script validate template IDs before sending?
- [ ] Should the progress message auto-hide on error?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Suitelet unavailable or misconfigured | Med | Med | Validate deployment IDs and permissions |
| User cancels before reload | Low | Low | Provide clearer status messaging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/url and N/https modules

### External Resources
- PandaDoc API docs (for backend Suitelet actions)

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
