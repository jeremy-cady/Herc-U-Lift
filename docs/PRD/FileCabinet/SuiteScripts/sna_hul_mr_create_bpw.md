# PRD: Bin Put-Away Worksheet Import (CSV)

**PRD ID:** PRD-UNKNOWN-CreateBPW
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_create_bpw.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that builds Bin Put-Away Worksheet records from a CSV file uploaded by a Suitelet.

**What problem does it solve?**
It automates creation of bin put-away worksheets from bulk CSV input, reducing manual entry.

**Primary Goal:**
Parse CSV lines, group by location, and create bin worksheet lines with inventory detail assignments.

---

## 2. Goals

1. Load and parse a CSV file from the File Cabinet.
2. Group items by location and create a worksheet per location.
3. Assign bin numbers and quantities to inventory detail.

---

## 3. User Stories

1. **As a** warehouse user, **I want** to upload a CSV of bin put-away lines **so that** worksheets are created automatically.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read the CSV file referenced by script parameter `custscript_sna_hul_bin_putaway_worksheet`.
2. The script must parse item, location, bin number, and quantity from each CSV line.
3. The script must group lines by location and create one Bin Put-Away Worksheet per location.
4. For each worksheet line, the script must set inventory detail quantity and bin assignment.
5. The script must resolve bin internal IDs per location before setting inventory detail.

### Acceptance Criteria

- [ ] Worksheets are created per unique location in the CSV.
- [ ] Each worksheet line has the correct item, bin, and quantity.
- [ ] Bin lookups are scoped to the worksheet location.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate CSV header formats beyond basic parsing.
- Handle updates to existing worksheets.

---

## 6. Design Considerations

### User Interface
- None; back-end processing only.

### User Experience
- Users upload CSV via Suitelet and receive worksheets.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Bin Put-Away Worksheet (`record.Type.BIN_WORKSHEET`)
- Bin (`bin` search)

**Script Types:**
- [x] Map/Reduce - CSV to worksheet creation
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
- CSV file passed by a Suitelet (not in this script).

### Data Requirements

**Data Volume:**
- CSV lines grouped by location.

**Data Sources:**
- File Cabinet CSV file.

**Data Retention:**
- Persists new Bin Put-Away Worksheet records.

### Technical Constraints
- CSV parsing relies on comma separation with quoted values.

### Dependencies
- **Libraries needed:** N/file, N/record, N/search, N/runtime.
- **External dependencies:** None.

### Governance Considerations
- Bin lookup executed per unique bin per location.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- All valid CSV lines generate matching worksheet lines without manual edits.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_create_bpw.js | Map/Reduce | Create bin worksheets from CSV | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** CSV parsing and grouping.
- **Phase 2:** Worksheet creation and bin assignment.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Upload CSV with multiple locations; verify multiple worksheets created.

**Edge Cases:**
1. Bin number not found for location; line is skipped.

**Error Handling:**
1. Missing CSV file parameter should result in no output records.

### Test Data Requirements
- CSV file with item, location, bin, and quantity columns.

### Sandbox Setup
- Ensure bin numbers exist for target locations.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Warehouse/admin users with create access to Bin Put-Away Worksheet.

**Permissions required:**
- Create Bin Put-Away Worksheet records; read bins.

### Data Security
- Uses internal inventory data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm script parameter `custscript_sna_hul_bin_putaway_worksheet` is populated by Suitelet.

### Deployment Steps
1. Upload `sna_hul_mr_create_bpw.js`.
2. Deploy Map/Reduce with required parameter.

### Post-Deployment
- Validate worksheet creation from a sample CSV.

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
- [ ] What CSV column order is enforced by the Suitelet?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid bin numbers | Med | Med | Validate bins before upload |

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
