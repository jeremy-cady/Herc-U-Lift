# PRD: Flag Invoice Lines from Internal Billing Task

**PRD ID:** PRD-UNKNOWN-CreateJEFromInternalBillingTask
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_create_je_from_internal_billing_task.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that flags invoice lines as processed when an Internal Billing Task is created.

**What problem does it solve?**
Prevents duplicate processing of invoice lines tied to internal billing tasks.

**Primary Goal:**
Mark invoice lines as processed based on line IDs stored on the internal billing task.

---

## 2. Goals

1. Read line IDs from the internal billing task record.
2. Locate the linked invoice and flag the specified lines.

---

## 3. User Stories

1. **As an** internal billing user, **I want to** flag invoice lines as processed **so that** downstream workflows avoid reprocessing.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run afterSubmit on Internal Billing Task create.
2. The script must read `custrecord_sna_internal_billing_line_id` and `custrecord_sna_hul_linked_invoice`.
3. The script must set `custcol_sn_internal_billing_processed` to true for matching invoice lines.

### Acceptance Criteria

- [ ] Linked invoice lines are flagged as processed when the task is created.
- [ ] Errors in loading or saving the invoice are logged.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create journal entries directly.
- Validate line ID formats beyond simple parsing.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Invoice lines are flagged automatically after task creation.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom internal billing task record
- invoice

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Flag invoice lines
- [ ] Client Script - N/A

**Custom Fields:**
- internal billing task | custrecord_sna_internal_billing_line_id | Comma-delimited invoice line IDs
- internal billing task | custrecord_sna_hul_linked_invoice | Linked invoice ID
- invoice line | custcol_sn_internal_billing_processed | Processed flag

**Saved Searches:**
- None.

### Integration Points
- Invoice line processing logic in downstream workflows.

### Data Requirements

**Data Volume:**
- One invoice load per task.

**Data Sources:**
- Internal billing task record fields

**Data Retention:**
- Updates invoice line flags.

### Technical Constraints
- Line IDs are parsed from a comma-delimited string.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Internal billing task creation flow

### Governance Considerations

- **Script governance:** Low; one invoice load/save per task.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoice lines referenced by the task are flagged as processed.

**How we'll measure:**
- Review invoice lines for the processed flag after task creation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_create_je_from_internal_billing_task.js | User Event | Flag invoice lines | Implemented |

### Development Approach

**Phase 1:** Line lookup
- [ ] Validate line ID parsing

**Phase 2:** Invoice update
- [ ] Validate line flag updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create internal billing task with invoice line IDs and confirm lines are flagged.

**Edge Cases:**
1. Missing invoice ID skips processing.

**Error Handling:**
1. Invoice save errors are logged.

### Test Data Requirements
- Internal billing task with linked invoice and line IDs

### Sandbox Setup
- Deploy User Event on internal billing task record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Finance roles

**Permissions required:**
- Edit invoices
- View internal billing task record

### Data Security
- Invoice line flags should be restricted to finance roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm internal billing task record type and field IDs

### Deployment Steps

1. Deploy User Event on internal billing task record.
2. Validate invoice line flags on task creation.

### Post-Deployment

- [ ] Monitor logs for invoice update errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Flag invoice lines manually if needed.

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

- [ ] Should the script validate line IDs against item IDs?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Line ID mismatch results in no updates | Low | Low | Validate line IDs in the task creation flow |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
