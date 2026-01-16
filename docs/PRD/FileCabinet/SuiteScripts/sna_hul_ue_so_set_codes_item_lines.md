# PRD: Set Task Codes on Item Lines

**PRD ID:** PRD-UNKNOWN-SoSetCodesItemLines
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_set_codes_item_lines.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Copies repair, work, and group codes onto item lines based on the revenue stream of the linked NXC support case.

**What problem does it solve?**
Ensures line-level task codes align with the revenue stream assigned to the related service case.

**Primary Goal:**
Populate item line task codes automatically after record submission.

---

## 2. Goals

1. Read revenue stream from the linked support case.
2. Apply repair/work/group codes to item lines when available.
3. Retain prior line codes when configured to do so.

---

## 3. User Stories

1. **As a** service coordinator, **I want to** populate task codes from the case **so that** lines are coded consistently.
2. **As a** user, **I want to** retain task codes across lines **so that** I can quickly add similar items.
3. **As an** admin, **I want to** avoid manual updates when revenue stream data is present.

---

## 4. Functional Requirements

### Core Functionality

1. On afterSubmit, the system must load the current transaction record and skip deletes.
2. If custbody_nx_case is empty, the system must exit without changes.
3. If the linked case has a revenue stream with repair/work/group codes, the system must set those codes on all item lines.
4. If the revenue stream does not provide codes, the system must copy codes from the previous line when custcol_sna_hul_nxc_retain_task_codes is true.
5. After updates, the system must save the record.

### Acceptance Criteria

- [ ] Lines receive repair/work/group codes when revenue stream codes exist.
- [ ] Lines with retain flag copy codes from the previous line when stream codes are empty.
- [ ] The script exits when there is no linked case.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate whether codes are active or valid for the item.
- Update header-level fields.
- Handle delete context.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Line codes are set immediately after save.

### Design References
- Revenue stream custom segment record.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (or deployed transaction type)
- Support Case
- Custom segment record: customrecord_cseg_sna_revenue_st

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Line updates
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction header | custbody_nx_case | Linked support case
- Item line | custcol_sna_repair_code | Repair code
- Item line | custcol_sna_work_code | Work code
- Item line | custcol_sna_group_code | Group code
- Item line | custcol_sna_hul_nxc_retain_task_codes | Retain task codes flag

**Saved Searches:**
- None

### Integration Points
- Support Case record lookup for cseg_sna_revenue_st
- Revenue stream custom segment record lookup

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- Support Case revenue stream and its related codes.

**Data Retention:**
- Codes stored on item lines.

### Technical Constraints
- Uses record.load and record.save after submit.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Revenue stream codes maintained on custom segment record.

### Governance Considerations

- **Script governance:** One record load and save per transaction.
- **Search governance:** Uses lookupFields calls.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Line task codes reflect the case revenue stream configuration.
- Retain task code behavior works as expected.

**How we'll measure:**
- Compare line codes to revenue stream values after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_set_codes_item_lines.js | User Event | Populate task codes on item lines | Implemented |

### Development Approach

**Phase 1:** Revenue stream lookup
- [x] Read support case and revenue stream details.

**Phase 2:** Line updates
- [x] Set or copy codes across item lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save a transaction with a case revenue stream that has codes, verify all lines populated.

**Edge Cases:**
1. Revenue stream has no repair/work/group codes, verify retain-flag lines copy prior line values.
2. First line has retain flag and no prior line, verify no crash.

**Error Handling:**
1. Missing support case record, verify script logs error and exits.

### Test Data Requirements
- Support case with revenue stream and code fields populated.

### Sandbox Setup
- Ensure custom segment records include code fields.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to support cases and the transaction type.

### Data Security
- Only task codes are written to the transaction.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Revenue stream custom segment records configured.

### Deployment Steps
1. Deploy User Event to the target transaction type.

### Post-Deployment
- Validate line codes on a new transaction.

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
- Should lines without retain flag be left unchanged when revenue stream codes are empty?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Case revenue stream missing | No codes applied | Validate case data during entry |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Support Case record

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
