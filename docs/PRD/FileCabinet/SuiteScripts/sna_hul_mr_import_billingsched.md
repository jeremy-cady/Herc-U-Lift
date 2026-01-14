# PRD: Billing Schedule Import from CSV

**PRD ID:** PRD-UNKNOWN-ImportBillingSched
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_import_billingsched.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that creates custom billing schedules by importing a CSV file.

**What problem does it solve?**
It automates the creation of billing schedules and recurrence lines from CSV data.

**Primary Goal:**
Parse CSV lines, group by primary key, and create billing schedules with custom recurrence dates and amounts.

---

## 2. Goals

1. Load and parse a CSV file from the File Cabinet.
2. Group CSV lines by billing schedule name (primary key).
3. Create a billing schedule record with custom recurrence lines.

---

## 3. User Stories

1. **As a** billing admin, **I want** to import schedules from CSV **so that** I can avoid manual setup.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read the CSV file referenced by `custscript_sna_file_id`.
2. The script must parse invoice date and amount-per-period for each line.
3. The script must group CSV rows by primary key and create one billing schedule per group.
4. The script must set billing schedule fields: `name`, `initialamount`, `frequency=Custom`, and `ispublic=true`.
5. The script must create a recurrence line for each CSV row with date and amount.

### Acceptance Criteria

- [ ] Billing schedules are created with recurrence lines matching CSV data.
- [ ] Schedule names match the CSV primary key.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate CSV data beyond basic parsing.
- Update existing billing schedules.

---

## 6. Design Considerations

### User Interface
- None; backend import.

### User Experience
- Bulk schedules created via CSV upload.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Billing Schedule (`billingschedule`)

**Script Types:**
- [x] Map/Reduce - CSV import processing
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None.

**Saved Searches:**
- None.

### Integration Points
- CSV file provided via script parameter.

### Data Requirements

**Data Volume:**
- CSV line items grouped by primary key.

**Data Sources:**
- File Cabinet CSV file.

**Data Retention:**
- Creates new billing schedule records.

### Technical Constraints
- Assumes CSV contains invoice date and amount per period.

### Dependencies
- **Libraries needed:** N/file, N/record, N/runtime, N/error.
- **External dependencies:** None.

### Governance Considerations
- One billing schedule created per group of CSV rows.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Billing schedules match the CSV data with correct recurrence lines.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_import_billingsched.js | Map/Reduce | Import billing schedules from CSV | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Parse CSV and group rows.
- **Phase 2:** Create billing schedules and recurrence lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. CSV with two schedules creates two billing schedule records with correct lines.

**Edge Cases:**
1. Empty CSV lines are skipped.

**Error Handling:**
1. Invalid date values should be logged.

### Test Data Requirements
- CSV file containing primary key and invoice dates.

### Sandbox Setup
- Ensure billing schedules can be created by the deployment role.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing admin.

**Permissions required:**
- Create billing schedules; read files.

### Data Security
- Uses internal billing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm `custscript_sna_file_id` parameter is set to a CSV file.

### Deployment Steps
1. Upload `sna_hul_mr_import_billingsched.js`.
2. Deploy Map/Reduce with file parameter.

### Post-Deployment
- Validate new billing schedules.

### Rollback Plan
- Disable script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should duplicate schedule names be prevented?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| CSV formatting errors | Med | Med | Validate CSV before upload |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
