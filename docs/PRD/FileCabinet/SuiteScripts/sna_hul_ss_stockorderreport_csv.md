# PRD: Stock Order Report CSV

**PRD ID:** PRD-UNKNOWN-StockOrderReportCsv
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ss_stockorderreport_csv.js (Scheduled)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Scheduled script that generates a stock order report CSV and emails it to the requesting user.

**What problem does it solve?**
Handles heavy report generation outside the Suitelet and delivers a CSV via email.

**Primary Goal:**
Build and email the stock order report CSV based on filter parameters.

---

## 2. Goals

1. Load saved searches and apply filter parameters.
2. Generate a CSV report with item and transaction data.
3. Save the CSV to the file cabinet and email it to the user.

---

## 3. User Stories

1. **As a** planner, **I want to** receive a stock order CSV **so that** I can analyze demand and reorder quantities.

---

## 4. Functional Requirements

### Core Functionality

1. The script must read JSON parameters from `custscript_sna_ss_params`.
2. The script must load the transaction and item saved searches using script parameters.
3. The script must apply filters for item category, vendor, location, demand period, PO period, and ROP quantities.
4. The script must generate CSV content from search results and item details.
5. The script must save the CSV to the folder defined by `custscript_sna_ss_folder_id`.
6. The script must email the CSV to the current user.

### Acceptance Criteria

- [ ] CSV file is generated and saved.
- [ ] Email is sent with the CSV attachment.
- [ ] Filters reflect Suitelet input parameters.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Display data in the UI.
- Update items or transactions.
- Validate search definitions beyond loading them.

---

## 6. Design Considerations

### User Interface
- No UI; triggered by Suitelet via scheduled script.

### User Experience
- User receives a CSV via email after submission.

### Design References
- Stock Order Report Suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- item
- transaction
- file

**Script Types:**
- [ ] Map/Reduce - N/A
- [x] Scheduled Script - CSV generation
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Item | custitem_sna_hul_itemcategory | Item category
- Item | custitem8 | ROP quantity (used in filter)

**Saved Searches:**
- `custscript_sna__ss_stockorderrep_so_po` (transaction search)
- `custscript_sna__ss_stockorderrep_item` (item search)

### Integration Points
- Triggered by `sna_hul_sl_stockorderreport` via MR/Scheduled.

### Data Requirements

**Data Volume:**
- Large result sets processed in batches.

**Data Sources:**
- Saved search results for transactions and items

**Data Retention:**
- CSV stored in file cabinet; email sent to user.

### Technical Constraints
- CSV generation uses summary columns and custom labels.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Suitelet filter collection

### Governance Considerations

- **Script governance:** Heavy search processing and file operations.
- **Search governance:** Filter expression manipulation.
- **API limits:** Use paging for large datasets.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- CSV is generated and emailed to the requesting user.

**How we'll measure:**
- Verify file cabinet output and email delivery.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ss_stockorderreport_csv.js | Scheduled | Generate and email CSV report | Implemented |

### Development Approach

**Phase 1:** Search validation
- [ ] Confirm saved searches and column labels

**Phase 2:** Output validation
- [ ] Generate sample CSV and email

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Filtered CSV is generated and emailed.

**Edge Cases:**
1. No results still generates CSV header only.

**Error Handling:**
1. Search load failure throws an error with log details.

### Test Data Requirements
- Items and transactions matching filters

### Sandbox Setup
- Deploy scheduled script and set parameters

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Inventory planning roles

**Permissions required:**
- Access to item, transaction, and file records
- Email send permissions

### Data Security
- Report data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Saved searches configured
- [ ] Output folder parameter set

### Deployment Steps

1. Deploy scheduled script.
2. Trigger from Suitelet.

### Post-Deployment

- [ ] Verify email delivery and file output

### Rollback Plan

**If deployment fails:**
1. Disable scheduled script.
2. Revert to manual report generation.

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

- [ ] Should the CSV be attached in the UI as well as email?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large CSV sizes may exceed email limits | Med | Med | Provide download link instead of attachment |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Scheduled Script
- N/file and N/email modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
