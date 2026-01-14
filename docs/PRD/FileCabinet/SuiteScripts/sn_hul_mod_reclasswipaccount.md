# PRD: Reclass WIP Account Module

**PRD ID:** PRD-UNKNOWN-ReclassWIPAccount
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sn_hul_mod_reclasswipaccount.js (Module)
- FileCabinet/SuiteScripts/SNA/sna_hul_wfa_if_reclass_wip.js (Workflow Action)
- FileCabinet/SuiteScripts/sn_hul_if_custom_gl_plugin.js (Custom GL Plugin)

**Script Deployment (if applicable):**
- Module only; referenced by other scripts

---

## 1. Introduction / Overview

**What is this feature?**
A shared module that reclasses COGS to WIP by creating or reversing Journal Entries tied to item fulfillments and invoices.

**What problem does it solve?**
Ensures WIP accounting entries are created or reversed consistently across workflows and integrations.

**Primary Goal:**
Create and reverse WIP journal entries for eligible item fulfillments and invoices.

---

## 2. Goals

1. Generate WIP JE lines from item fulfillment and invoice data.
2. Create WIP journal entries with correct segments and references.
3. Reverse existing WIP JEs when needed.

---

## 3. User Stories

1. **As an** accounting user, **I want** WIP JEs created and reversed correctly **so that** WIP balances are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must support `reclassWIPAccount` for invoices and item fulfillments.
2. The system must locate related item fulfillments for invoices and build JE lines from saved searches.
3. The system must create a Journal Entry with debit/credit lines for WIP reclass.
4. The system must tag item fulfillments with created JE IDs in `custbody_sna_hul_je_wip`.
5. The system must support `reverseWIPAccount` to reverse JEs tied to an invoice.

### Acceptance Criteria

- [ ] WIP JEs are created with correct accounts, segments, and amounts.
- [ ] Item fulfillments are tagged with WIP JE IDs.
- [ ] Reverse function sets reversal date on JEs linked to invoices.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle non-invoice or non-item-fulfillment records.
- Determine WIP account outside script parameters.
- Provide UI for managing JEs.

---

## 6. Design Considerations

### User Interface
- No UI; module only.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Item Fulfillment
- Journal Entry

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used
- [x] Module - Reclass WIP logic

**Custom Fields:**
- Item Fulfillment | `custbody_sna_hul_je_wip`
- Journal Entry | `custbody_sna_hul_inv_wip`
- Journal Entry | `custbody_sna_hul_so_wip`
- Item Fulfillment | `custbody_sn_removed_lines`

**Saved Searches:**
- `customsearch_sna_hul_if_custom_gl`
- `customsearch_sn_hul_invoiceif_custom_new`
- `customsearch_sna_hul_invoiceif_custom_2`

### Integration Points
- Used by workflow actions and custom GL plugins.

### Data Requirements

**Data Volume:**
- Per fulfillment or invoice transaction.

**Data Sources:**
- Fulfillment lines, invoice lines, JE references, saved searches.

**Data Retention:**
- Creates and updates Journal Entries and fulfillment tags.

### Technical Constraints
- WIP account parameter is required for JE creation.
- Saved searches must exist and return expected columns.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Workflow or script invoking the module.

### Governance Considerations
- Multiple searches, JE creation, and submitFields operations.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- WIP JEs are created or reversed without errors.

**How we'll measure:**
- Review JE records and fulfillment tags after runs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sn_hul_mod_reclasswipaccount.js | Module | Create/reverse WIP JEs | Implemented |

### Development Approach

**Phase 1:** Build JE lines
- [x] Load fulfillment/invoice data via saved searches.

**Phase 2:** Create/reverse JEs
- [x] Create JE and tag fulfillments; reverse existing JEs.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run reclass for invoice and verify JE creation and tagging.

**Edge Cases:**
1. Missing fulfillment IDs; no JE created.
2. Missing WIP account; no JE created.
3. Reverse for invoice with no JEs; no action.

**Error Handling:**
1. JE create/update errors are logged.

### Test Data Requirements
- Invoice with related item fulfillments and COGS.

### Sandbox Setup
- Ensure saved searches exist and WIP account parameter is set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting/admin roles.

**Permissions required:**
- Create and edit Journal Entries
- Edit item fulfillments and invoices

### Data Security
- No additional data exposure beyond accounting access.

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

1. Upload `sn_hul_mod_reclasswipaccount.js`.
2. Ensure scripts referencing the module are deployed.
3. Verify saved searches and parameters.

### Post-Deployment

- [ ] Verify JE creation/reversal.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable calling scripts or revert to previous module version.

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

- [ ] Should saved search IDs be parameters instead of hardcoded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing or changed saved search IDs | Med | Med | Move IDs to parameters |
| JE creation fails due to segment mismatch | Low | Med | Validate segment values before save |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
