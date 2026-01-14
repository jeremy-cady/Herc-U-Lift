# PRD: Inventory Reorder Analysis (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-InventoryReorderMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/inventory_reorder_analysis_mr.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that analyzes inventory items daily, calculates reorder recommendations, and emails a CSV report to the purchasing team.

**What problem does it solve?**
Manual reorder analysis is time-consuming and error-prone; this script automates analysis using reorder points, sales velocity, lead time, and backorders.

**Primary Goal:**
Produce a daily reorder recommendation report for inventory items that need attention.

---

## 2. Goals

1. Analyze inventory availability, reorder points, and sales velocity.
2. Compute recommended order quantities and urgency.
3. Deliver a CSV report by email.

---

## 3. User Stories

1. **As a** buyer, **I want** daily reorder recommendations **so that** I can plan purchases.
2. **As an** inventory manager, **I want** urgency indicators **so that** I prioritize critical items.
3. **As an** admin, **I want** automated reporting **so that** manual analysis is reduced.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search active inventory items (`InvtPart`) and analyze them by location.
2. The system must calculate sales velocity over 30 and 90 days.
3. The system must determine reorder need based on:
   - Below reorder point with recent sales
   - Backorders
   - Stockout within vendor lead time
4. The system must compute recommended order quantity:
   - Target preferred stock level (or reorder point * 2 / lead-time fallback)
   - Net available = available + on order - backordered
5. The system must calculate urgency levels (CRITICAL, HIGH, MEDIUM, LOW, OK).
6. The system must group items by vendor in reduce stage.
7. The system must generate a CSV report containing item metrics and recommendations.
8. The system must email the report to `custscript_reorder_email_recipient`.
9. The system must save the CSV file to a configured File Cabinet folder.

### Acceptance Criteria

- [ ] Items below reorder thresholds are flagged with reasons.
- [ ] Recommended order quantities are calculated and included in the report.
- [ ] CSV file is created and saved to File Cabinet.
- [ ] Email is sent with the CSV attachment.
- [ ] Urgency counts and totals appear in the email summary.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Automatically create purchase orders.
- Analyze non-inventory item types.
- Resolve data issues like missing reorder points.

---

## 6. Design Considerations

### User Interface
- None (scheduled backend process).

### User Experience
- Purchasing receives a daily email with urgency summaries and a CSV attachment.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Inventory Item
- Vendor
- Sales Order (transaction search)

**Script Types:**
- [x] Map/Reduce - Inventory analysis and reporting
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- None (standard inventory and vendor fields used).

**Saved Searches:**
- None (searches created in script).

### Integration Points
- Email delivery to purchasing team.

### Data Requirements

**Data Volume:**
- Potentially thousands of inventory items across locations.

**Data Sources:**
- Item records, vendor records, and sales transactions.

**Data Retention:**
- CSV report files in File Cabinet; no custom record storage.

### Technical Constraints
- Current script contains a test filter on `itemid = 91B6100912`.
- Folder ID in `getFolderId()` must be updated to a valid folder.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Email recipient parameter `custscript_reorder_email_recipient`.

### Governance Considerations
- Map/Reduce handles large searches and processing.
- Vendor lookup fields and transaction searches run per item.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Purchasing receives a daily report with accurate recommendations.
- Critical and high urgency items are highlighted.

**How we'll measure:**
- Email delivery logs and spot checks on CSV output.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| inventory_reorder_analysis_mr.js | Map/Reduce | Daily reorder analysis and reporting | Implemented |

### Development Approach

**Phase 1:** Data collection
- [x] Item search with location inventory metrics
- [x] Vendor and sales velocity lookups

**Phase 2:** Recommendations + reporting
- [x] Reorder logic and urgency
- [x] CSV creation and email delivery

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Items below reorder point with sales velocity appear in the report.
2. CSV file is created and emailed.

**Edge Cases:**
1. Items with no vendor return “No Vendor”.
2. Items with no recent sales do not reorder unless backordered.
3. Lead time missing defaults to 14 days.

**Error Handling:**
1. Map/reduce errors are logged in summarize.
2. CSV file creation failures are logged.

### Test Data Requirements
- Inventory items with reorder points, preferred stock levels, and sales history.

### Sandbox Setup
- Ensure `custscript_reorder_email_recipient` is set and folder ID is valid.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with item, vendor, and transaction access.

**Permissions required:**
- View access to items, transactions, vendors.
- Create access for File Cabinet files.
- Send email permission.

### Data Security
- Email distribution should be limited to purchasing roles.

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

1. Update `getFolderId()` with a valid File Cabinet folder ID.
2. Remove test filter on `itemid` before production.
3. Create the Map/Reduce script record.
4. Set `custscript_reorder_email_recipient`.
5. Schedule daily at 6:00 AM.

### Post-Deployment

- [ ] Confirm CSV files are generated in the target folder.
- [ ] Confirm email delivery to purchasing.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.
2. Remove scheduled execution.

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

- [ ] What is the correct File Cabinet folder ID for reports?
- [ ] Should reorder rules be configurable by location?
- [ ] Should zero-velocity items be excluded even if below reorder point?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Test filter left in place | Med | High | Remove before production |
| Invalid folder ID | Med | High | Validate folder ID in sandbox |
| High per-item lookups | Med | Med | Monitor governance usage |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- Search API
- Email and File APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
