# PRD: Bulk Invoice Update Trigger (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-BulkInvoiceUpdateMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_bulk_update.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that loads invoices from a saved search and re-saves them to trigger User Event logic.

**What problem does it solve?**
Provides a controlled way to reprocess invoices in bulk when User Events need to re-run.

**Primary Goal:**
Trigger invoice User Event scripts by loading and saving invoices from a saved search.

---

## 2. Goals

1. Load a saved search specified by a script parameter.
2. Iterate through invoice results and resave each invoice.
3. Log processing and errors during the run.

---

## 3. User Stories

1. **As an** admin, **I want** to re-run invoice User Events in bulk **so that** data is corrected.
2. **As a** developer, **I want** a simple bulk trigger **so that** I can rerun logic without manual edits.
3. **As an** accountant, **I want** invoices reprocessed **so that** related fields update consistently.

---

## 4. Functional Requirements

### Core Functionality

1. The system must load a saved search ID from `custscript_sna_bulk_srch_upd`.
2. The system must parse each search result and load the invoice record by ID.
3. The system must save the invoice record without changes to trigger User Events.
4. The system must log updated invoice IDs.
5. The system must log any map errors in the summarize stage.

### Acceptance Criteria

- [ ] Invoices from the saved search are loaded and saved.
- [ ] User Event scripts are triggered by the save.
- [ ] Errors are logged in the summarize stage.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Apply field updates directly.
- Modify invoice data intentionally.
- Process records outside the saved search.

---

## 6. Design Considerations

### User Interface
- None (batch processing).

### User Experience
- Background process re-saves invoices without UI interaction.

### Design References
- Saved search specified by script parameter.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice

**Script Types:**
- [x] Map/Reduce - Bulk invoice re-save
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Triggered by invoice save
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Saved search referenced by `custscript_sna_bulk_srch_upd`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One save per invoice in the search.

**Data Sources:**
- Saved search results.

**Data Retention:**
- No data retained; invoices are re-saved.

### Technical Constraints
- Map stage saves invoices without modification.
- Reduce stage is unused.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** User Event scripts on invoice.

### Governance Considerations
- One load/save per invoice; governance usage scales with result count.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- User Event logic runs for all invoices in the search.

**How we'll measure:**
- Confirm updated fields or logs produced by downstream User Events.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_bulk_update.js | Map/Reduce | Re-save invoices to trigger User Events | Implemented |

### Development Approach

**Phase 1:** Input search
- [x] Load saved search from script parameter.

**Phase 2:** Re-save invoices
- [x] Load and save each invoice in map stage.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Saved search returns invoices; each is saved and logged.

**Edge Cases:**
1. Saved search ID missing or invalid.
2. Invoice load fails for a result.

**Error Handling:**
1. Map errors are logged in summarize.

### Test Data Requirements
- Saved search with a small set of invoices.

### Sandbox Setup
- Map/Reduce deployment with `custscript_sna_bulk_srch_upd` set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to invoices.

**Permissions required:**
- View and edit invoices

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_mr_bulk_update.js`.
2. Set `custscript_sna_bulk_srch_upd` to a saved search ID.
3. Run the Map/Reduce in sandbox.

### Post-Deployment

- [ ] Verify invoices were processed and updated.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

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

- [ ] Should the script support record types other than invoices?
- [ ] Should map stage include error retries for failed saves?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large searches consume governance | Med | Med | Limit search size or schedule runs |
| Re-saving triggers unintended side effects | Med | Med | Validate UE logic before run |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- record.load and record.save APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
