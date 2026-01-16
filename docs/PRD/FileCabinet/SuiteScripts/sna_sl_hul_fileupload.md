# PRD: CSV Upload Suitelet for Bin Transfers and Put-Away

**PRD ID:** PRD-UNKNOWN-FileUpload
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_sl_hul_fileupload.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that accepts CSV uploads and schedules Map/Reduce scripts to create Bin Transfers or Bin Put-Away Worksheets.

**What problem does it solve?**
Provides a UI for uploading CSV files and initiating background processing without manual script scheduling.

**Primary Goal:**
Collect CSV files, save them to the file cabinet, and schedule the appropriate Map/Reduce job.

---

## 2. Goals

1. Allow users to select a record type (Bin Transfer or Bin Put-Away Worksheet).
2. Save the uploaded CSV to a known folder.
3. Schedule the correct Map/Reduce script with the file id parameter.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** upload a CSV **so that** bin transfers are created.
2. **As a** user, **I want to** select the type of import **so that** the correct process runs.
3. **As an** admin, **I want to** view MR status **so that** I can monitor processing.

---

## 4. Functional Requirements

### Core Functionality

1. On GET, the system must render a form with a record type select and CSV file field.
2. On POST, the system must save the uploaded file to folder 10896 (Bin Transfer) or 11608 (Bin Put-Away Worksheet).
3. The system must schedule the MR script customscript_sna_mr_hul_create_bintransf or customscript_sna_hul_mr_create_bpw based on selection.
4. The system must pass the CSV file id via custscript_sna_hul_bintransfer or custscript_sna_hul_bin_putaway_worksheet.
5. The system must select an active deployment (status NOTSCHEDULED) and show a link to the Map/Reduce status page.

### Acceptance Criteria

- [ ] Form displays record type selector and CSV upload field.
- [ ] Uploaded file is saved and MR is scheduled with correct parameters.
- [ ] Response page includes a link to MR status.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Parse CSV contents directly (handled by MR).
- Validate CSV format on upload.
- Schedule MR when no file is provided.

---

## 6. Design Considerations

### User Interface
- Simple form titled "SNA CSV Import" with select and file fields.

### User Experience
- User receives a status page with a link to MR execution status.

### Design References
- MR scripts: customscript_sna_mr_hul_create_bintransf, customscript_sna_hul_mr_create_bpw

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- File
- Script Deployment

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - CSV upload and MR scheduling
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None

**Saved Searches:**
- Script deployment search for active deployments

### Integration Points
- Map/Reduce scripts triggered by this suitelet

### Data Requirements

**Data Volume:**
- One CSV file per request.

**Data Sources:**
- User-uploaded CSV file.

**Data Retention:**
- CSV file stored in file cabinet folder 10896 or 11608.

### Technical Constraints
- Uses active deployments with status NOTSCHEDULED only.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** MR scripts for bin transfer and put-away worksheet creation

### Governance Considerations

- **Script governance:** Schedules MR tasks and searches deployments.
- **Search governance:** Uses scriptdeployment search by script id.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- CSV uploads trigger the correct MR script and provide a status link.

**How we'll measure:**
- Verify MR scheduling and file cabinet storage.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_sl_hul_fileupload.js | Suitelet | Upload CSV and schedule MR | Implemented |

### Development Approach

**Phase 1:** UI
- [x] Render select and file fields.

**Phase 2:** Scheduling
- [x] Save file and schedule MR by type.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Upload CSV as Bin Transfer, verify MR is scheduled and status link shown.
2. Upload CSV as Bin Put-Away Worksheet, verify correct MR is scheduled.

**Edge Cases:**
1. No file uploaded, verify no scheduling occurs.

**Error Handling:**
1. No active deployment found, verify error logged and no schedule.

### Test Data Requirements
- Sample CSV files for both types.

### Sandbox Setup
- Ensure MR deployments are active and NOTSCHEDULED.

---

## 11. Security & Permissions

### Roles & Permissions
- Users must have permission to upload files and schedule MR tasks.

### Data Security
- Uploaded files stored in file cabinet; access controlled by folder permissions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] MR deployments active with script ids customscript_sna_mr_hul_create_bintransf and customscript_sna_hul_mr_create_bpw.

### Deployment Steps
1. Deploy Suitelet and ensure it is accessible.

### Post-Deployment
- Upload test files and confirm MR scheduling.

### Rollback Plan
- Disable the Suitelet deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should folder ids be parameterized instead of hard-coded?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| No available deployment | Upload cannot schedule MR | Add more deployments or allow queued status |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- Suitelet Script
- Map/Reduce task scheduling

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
