# PRD: LiftNet Quote Integration (Client Script)

**PRD ID:** PRD-UNKNOWN-LiftNetCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_sendtoliftnet.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that integrates NetSuite estimates/opportunities with LiftNet by creating or updating quotes, launching the configurator, and importing quote results.

**What problem does it solve?**
Automates the LiftNet quote workflow from NetSuite, including item creation, estimate generation, and quote document actions.

**Primary Goal:**
Send and retrieve quote data between NetSuite and LiftNet and manage related items and estimates.

---

## 2. Goals

1. Create or update LiftNet quotes from NetSuite records.
2. Launch LiftNet configurator for quote editing.
3. Retrieve LiftNet quote data and create/update NetSuite items and estimates.

---

## 3. User Stories

1. **As a** sales rep, **I want** to launch LiftNet from NetSuite **so that** I can configure quotes quickly.
2. **As an** admin, **I want** quotes synced back into NetSuite **so that** estimates and items are consistent.
3. **As a** manager, **I want** quote documents available **so that** I can email or print them.

---

## 4. Functional Requirements

### Core Functionality

1. The system must hide the standard UI table block on page init.
2. The system must resolve and open the LiftNet Suitelet for sending quotes (`customscript_sna_hul_sl_sendtoliftnet`).
3. The system must send email quotes via Suitelet (`customscript_sna_hul_sl_sendquoteviaemai`).
4. The system must create or update LiftNet quotes via LiftNet API endpoints using credentials and XML payloads.
5. The system must launch the LiftNet configurator using the quote ID.
6. The system must retrieve LiftNet quote data and parse XML into JSON.
7. The system must search for or create NetSuite items based on LiftNet quote lines.
8. The system must create or update an estimate from the opportunity and add quote items.
9. The system must support printing quote documents and worksheets from LiftNet.

### Acceptance Criteria

- [ ] LiftNet quote creation returns a quote ID saved to NetSuite.
- [ ] Configurator launches for the provided quote ID.
- [ ] LiftNet quote data is parsed and items are created or selected.
- [ ] Estimate is created/updated with items from LiftNet.
- [ ] Quote and worksheet print actions open LiftNet documents.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate LiftNet credentials beyond request errors.
- Handle LiftNet API rate limits or retries.
- Perform server-side integration processing.

---

## 6. Design Considerations

### User Interface
- Provides client-side buttons/actions for LiftNet workflows.

### User Experience
- Users can initiate LiftNet processes from the NetSuite UI and receive progress messages.

### Design References
- LiftNet API endpoints and document URLs.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Opportunity/Estimate
- Item (inventory and non-inventory)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for sending quotes and emailing
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - LiftNet UI actions

**Custom Fields:**
- Opportunity/Estimate | `custbody_liftnetquoteid`
- Custom page fields: `custpage_quoteid`, `custpage_salespersoncode`, `custpage_mcfausername`, `custpage_mcfapassword`, `custpage_customerapiinformation`

**Saved Searches:**
- Item search by name for LiftNet items.

### Integration Points
- LiftNet API endpoints (`/PDC/CreateUpdatePortalQuote`, `/PDC/ConfigureQuote`, `/PDC/LaunchConfig`).
- LiftNet document endpoints for print/worksheet.

### Data Requirements

**Data Volume:**
- One LiftNet request per action; multiple items per quote.

**Data Sources:**
- LiftNet XML responses and NetSuite transaction data.

**Data Retention:**
- Quote IDs saved on transactions; items created as needed.

### Technical Constraints
- Uses client-side HTTPS requests to external LiftNet endpoints.
- Includes XML-to-JSON conversion logic in the client script.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** LiftNet endpoints, jQuery (for XML parsing helpers).
- **Other features:** Suitelet deployments for sending quotes and emails.

### Governance Considerations
- Client-side record creation and search operations can be heavy.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- LiftNet quotes sync into NetSuite and estimates are populated accurately.

**How we'll measure:**
- Verify quote IDs, created items, and estimate line items match LiftNet data.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_sendtoliftnet.js | Client Script | LiftNet quote integration and UI actions | Implemented |

### Development Approach

**Phase 1:** LiftNet API calls
- [x] Create/update quotes and launch configurator.

**Phase 2:** NetSuite updates
- [x] Create items and estimates from LiftNet quote data.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create LiftNet quote and store quote ID on opportunity.
2. Retrieve quote and create/update estimate with items.
3. Print quote and worksheet documents.

**Edge Cases:**
1. LiftNet API returns empty response.
2. Item creation fails or item already exists.

**Error Handling:**
1. LiftNet request errors show alerts and halt processing.

### Test Data Requirements
- Valid LiftNet credentials and quote configurations.

### Sandbox Setup
- Client script deployed on opportunity/estimate forms with required fields.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users initiating LiftNet quote actions.

**Permissions required:**
- Create/edit estimates and items (client-side operations).

### Data Security
- LiftNet credentials handled in client context; ensure access is limited.

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

1. Upload `sna_hul_cs_sendtoliftnet.js`.
2. Deploy to opportunity/estimate forms.
3. Validate LiftNet workflow end-to-end.

### Post-Deployment

- [ ] Verify quote ID updates and estimate line items.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from affected forms.

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

- [ ] Should LiftNet credentials be stored server-side instead of client-side?
- [ ] Should item creation be moved to a backend script?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client-side credentials exposure | Med | High | Move LiftNet calls to Suitelet/RESTlet |
| Large quotes cause long UI delays | Med | Med | Move processing to scheduled script |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/https and N/record modules

### External Resources
- LiftNet API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
