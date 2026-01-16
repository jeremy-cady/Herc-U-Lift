# PRD: Create Bin Transfer from CSV

**PRD ID:** PRD-UNKNOWN-CreateBinTransfer
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_mr_hul_create_bintransfer.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Creates Bin Transfer transactions from a CSV file uploaded via Suitelet.

**What problem does it solve?**
Automates bin transfers by converting CSV line data into NetSuite Bin Transfer records.

**Primary Goal:**
Read CSV input, group by warehouse, and create bin transfer records with inventory assignments.

---

## 2. Goals

1. Load CSV file from script parameter custscript_sna_hul_bintransfer.
2. Group CSV rows by warehouse and create one Bin Transfer per warehouse.
3. Notify the user with created record links and delete the CSV file after processing.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** upload a CSV **so that** bin transfers are created in bulk.
2. **As an** admin, **I want to** receive an email with created records **so that** I can verify results.
3. **As a** user, **I want to** avoid leftover files **so that** the file cabinet stays clean.

---

## 4. Functional Requirements

### Core Functionality

1. getInputData must load the CSV file id from custscript_sna_hul_bintransfer and parse each line into warehouse, item, frombins, tobins, and quantity.
2. map must group lines by warehouse and write them keyed by warehouse name.
3. reduce must create a Bin Transfer per warehouse and add inventory lines with from/to bins and quantities.
4. reduce must resolve item internal ids by item name and bin internal ids by bin number and location.
5. summarize must email the current user with created record links and delete the processed CSV file.

### Acceptance Criteria

- [ ] A Bin Transfer is created per warehouse in the CSV.
- [ ] Inventory assignments use the correct from/to bins and quantities.
- [ ] User receives an email with created record links.
- [ ] CSV file is deleted after processing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate CSV headers or enforce schema beyond expected columns.
- Handle invalid item or bin values beyond error email logging.
- Support non-bin transfer record types.

---

## 6. Design Considerations

### User Interface
- Triggered by Suitelet upload (separate script).

### User Experience
- Processing is asynchronous via Map/Reduce.

### Design References
- Suitelet: sna_sl_hul_fileupload.js

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Bin Transfer
- Item
- Bin
- Location

**Script Types:**
- [x] Map/Reduce - CSV-driven bin transfer creation
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- None

**Saved Searches:**
- None

### Integration Points
- Suitelet passes CSV file id in custscript_sna_hul_bintransfer.
- Email notification uses current user id.

### Data Requirements

**Data Volume:**
- One line per CSV row, grouped by warehouse.

**Data Sources:**
- CSV file contents from file cabinet.

**Data Retention:**
- CSV file deleted after processing.

### Technical Constraints
- Item lookup uses item name (formulatext: {name}).
- Bin lookup constrained by location and bin number.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Suitelet upload that supplies CSV file id

### Governance Considerations

- **Script governance:** Record create per warehouse and searches per line.
- **Search governance:** Item, bin, and location searches per line.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Bin Transfer records reflect the CSV input accurately.

**How we'll measure:**
- Compare created transfers to CSV rows.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_mr_hul_create_bintransfer.js | Map/Reduce | Create bin transfers from CSV | Implemented |

### Development Approach

**Phase 1:** Input parsing
- [x] Parse CSV and group by warehouse.

**Phase 2:** Record creation
- [x] Create bin transfer and inventory assignments.

**Phase 3:** Notifications
- [x] Email results and delete CSV.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Upload CSV with valid lines, verify bin transfers created and email sent.

**Edge Cases:**
1. Invalid item or bin, verify error logged and email sent with results.
2. Empty CSV, verify no records created and email reflects zero results.

**Error Handling:**
1. Record save fails, verify error email is sent.

### Test Data Requirements
- CSV with warehouse, item, from bin, to bin, and quantity columns.

### Sandbox Setup
- Ensure bins, items, and locations exist for the CSV values.

---

## 11. Security & Permissions

### Roles & Permissions
- Script deployment role must have permission to create bin transfers and read items/bins/locations.

### Data Security
- Only creates bin transfers and deletes the input CSV.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Confirm Suitelet uploads to the expected file parameter.

### Deployment Steps
1. Deploy Map/Reduce with parameter custscript_sna_hul_bintransfer.

### Post-Deployment
- Validate bin transfers from a test CSV.

### Rollback Plan
- Disable the Map/Reduce deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should item lookup use internal id instead of item name to avoid ambiguity?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Duplicate item names | Wrong item selected | Require unique item names or use internal ids |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- Map/Reduce Script
- Bin Transfer record

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
