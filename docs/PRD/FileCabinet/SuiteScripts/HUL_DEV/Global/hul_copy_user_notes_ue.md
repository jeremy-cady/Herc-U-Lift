# PRD: Copy User Notes from Sales Order to Invoice

**PRD ID:** PRD-UNKNOWN-CopyUserNotes
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_copy_user_notes_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that copies notes from a Sales Order to a newly created Invoice, with robust de‑duplication and note-type/direction handling.

**What problem does it solve?**
Notes added on Sales Orders need to carry forward to Invoices for downstream visibility without creating duplicates.

**Primary Goal:**
On invoice creation, copy unique Sales Order notes to the Invoice.

---

## 2. Goals

1. Fetch SO notes and normalize notetype/direction values.
2. De‑duplicate notes within the source list and against existing Invoice notes.
3. Create new Invoice notes with matching metadata.

---

## 3. User Stories

1. **As an** AR user, **I want to** see SO notes on the invoice **so that** billing context is preserved.
2. **As a** developer, **I want to** prevent duplicate notes **so that** invoices stay clean.
3. **As an** admin, **I want to** keep note metadata intact **so that** note type and direction are preserved.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on Invoice `afterSubmit` CREATE only.
2. The system must read the source Sales Order from `createdfrom`.
3. The system must fetch SO notes using a saved-search style note query.
4. The system must normalize note type and direction using:
   - `lookupFields`, then
   - `record.load` fallback.
5. The system must compute a signature from title, memo, note type, and direction.
6. The system must skip duplicates already on the Invoice.
7. The system must create new notes with:
   - `title`, `note`, `notetype`, `direction`, `company`, `transaction`.

### Acceptance Criteria

- [ ] Notes from the SO are copied to a newly created Invoice.
- [ ] Existing Invoice notes are not duplicated.
- [ ] Duplicate SO notes are collapsed to one.
- [ ] Errors are logged without blocking invoice creation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update notes on existing invoices.
- Copy notes for invoices without `createdfrom`.
- Modify note content beyond whitespace normalization for de‑duplication.

---

## 6. Design Considerations

### User Interface
- None (user event automation).

### User Experience
- Notes appear automatically after invoice creation.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Note
- Sales Order (source)
- Invoice (target)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Copy notes on create
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- Uses an ad‑hoc note search filtered by `transaction.internalid`.

### Integration Points
- Sales Order → Invoice note propagation.

### Data Requirements

**Data Volume:**
- Notes on a single Sales Order.

**Data Sources:**
- Note search + lookupFields + record.load for hydration.

**Data Retention:**
- Notes are stored on the Invoice record.

### Technical Constraints
- Allowed note type IDs: 1–8.
- Allowed direction IDs: 1–2.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Notes must be attached to the Sales Order.

### Governance Considerations
- Multiple note lookups and possible record loads per note.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoices consistently inherit SO notes without duplication.

**How we'll measure:**
- Spot checks on newly created invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_copy_user_notes_ue.js | User Event | Copy SO notes to Invoice | Implemented |

### Development Approach

**Phase 1:** Fetch + de‑dupe
- [x] Note search and hydration
- [x] Signature-based de‑duplication

**Phase 2:** Create notes
- [x] Create Invoice notes with metadata

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Invoice created from SO with notes → notes copied.

**Edge Cases:**
1. SO with duplicate notes → only one copy created.
2. Invoice already has matching note → no duplicate created.
3. Missing note type/direction → still copied with defaults.

**Error Handling:**
1. Note creation errors are logged and processing continues.

### Test Data Requirements
- Sales Orders with multiple notes and varying types/directions.

### Sandbox Setup
- Deploy User Event on Invoice create.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins deploying User Events.

**Permissions required:**
- Create Notes.
- View Sales Orders and Invoices.

### Data Security
- Notes are copied as-is; ensure note content is appropriate for Invoice visibility.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy User Event on Invoice.
2. Validate note copy on invoice creation.

### Post-Deployment

- [ ] Monitor logs for copy errors.

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should allowed note type/direction IDs be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large note counts increase governance | Low | Medium | Optimize search and hydration |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event docs.
- Note record docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
