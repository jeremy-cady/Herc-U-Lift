# PRD: Stock Order Report CSV Generator

**PRD ID:** PRD-UNKNOWN-StockOrderReportCsv
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_stockorderreport_csv.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that generates a Stock Order Report CSV and emails it to the requesting user.

**What problem does it solve?**
Automates report generation from the Stock Order Report Suitelet filters without manual exports.

**Primary Goal:**
Produce a CSV from a saved search and deliver it via email (attachment or URL based on size).

---

## 2. Goals

1. Load a saved search and apply UI filter parameters.
2. Build a CSV file in the File Cabinet.
3. Email the report to the requesting user.

---

## 3. User Stories

1. **As a** purchasing user, **I want** a CSV report generated from my filters **so that** I can review stock order needs.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read filter parameters from `custscript_sna_form_filters`.
2. The script must load the base saved search from `custscript_sna_hul_mr_ss` and append filter expressions.
3. The script must output CSV lines during processing and aggregate them in summarize.
4. The script must create a CSV file in the folder from `custscript_sna_hul_folder_id`.
5. The script must append data in chunks to the file to avoid size limits.
6. The script must email the requesting user from `custscript_sna_form_currentuser_id` with attachment or URL depending on file size.

### Acceptance Criteria

- [ ] CSV is generated with headers and data rows.
- [ ] File is saved in the configured folder.
- [ ] Email is sent with attachment or URL based on size.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update inventory or transaction records.
- Validate filter values beyond basic checks.

---

## 6. Design Considerations

### User Interface
- Triggered by Suitelet action; no direct UI in the script.

### User Experience
- Users receive a CSV or download link shortly after request.

### Design References
- Suitelet: SNA HUL SL Stock Order Report.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item and Inventory data via saved search
- Transactions (Sales Orders, Purchase Orders, Work Orders) via saved search

**Script Types:**
- [x] Map/Reduce - CSV generation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Item | `custitem_sna_hul_itemcategory`
- Item | `custrecord_sna_hul_vendor`

**Saved Searches:**
- Search from parameter `custscript_sna_hul_mr_ss`.

### Integration Points
- Email delivery using `N/email`.

### Data Requirements

**Data Volume:**
- Dependent on search results and filter scope.

**Data Sources:**
- Saved search results with inventory and transaction data.

**Data Retention:**
- CSV saved to File Cabinet until manually removed.

### Technical Constraints
- File attachments larger than 10 MB are sent as URLs.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Suitelet passes filter JSON.

### Governance Considerations
- File creation and email send consume usage in summarize stage.

---

## 8. Success Metrics

- Users receive Stock Order Report CSVs without manual export.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_stockorderreport_csv.js | Map/Reduce | Generate and email stock order CSV | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Apply filters and gather data for CSV output.
- **Phase 2:** Create file and email to requester.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Valid filter set produces a CSV and email attachment.

**Edge Cases:**
1. Large result set produces an email with download link.

**Error Handling:**
1. Invalid folder ID or file creation failure is logged.

### Test Data Requirements
- Search results with inventory and transaction data.

### Sandbox Setup
- Configure File Cabinet folder ID and Suitelet filter JSON.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Purchasing or admin roles.

**Permissions required:**
- Run saved searches and access File Cabinet folders.

### Data Security
- Report content follows saved search permissions.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure saved search ID and File Cabinet folder ID.

### Deployment Steps
1. Upload `sna_hul_mr_stockorderreport_csv.js`.
2. Deploy Map/Reduce with parameters.

### Post-Deployment
- Validate email delivery and file storage.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Should CSV files be auto-deleted after delivery?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large CSV generation timeouts | Med | Med | Use filtered searches and chunked appends |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- N/file, N/email

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
