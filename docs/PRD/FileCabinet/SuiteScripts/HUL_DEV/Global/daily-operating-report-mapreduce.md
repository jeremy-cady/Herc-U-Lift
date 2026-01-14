# PRD: Daily Operating Report Map/Reduce

**PRD ID:** PRD-UNKNOWN-DailyOperatingReportMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/daily-operating-report-mapreduce.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce that generates a Daily Operating Report from sales order lines, calculates revenue and COGS by line, and saves summary + detailed files.

**What problem does it solve?**
Provides an automated daily or open-orders report with margin calculations, vendor price enrichment, and chunked file outputs for large datasets.

**Primary Goal:**
Produce a consistent, exportable operating report with revenue, COGS, and margin details.

---

## 2. Goals

1. Pull sales order line data based on date or open-order mode.
2. Compute COGS using fulfillment COGS, time entry costs, or linked PO logic.
3. Save summary and detailed results in JSON/CSV files.

---

## 3. User Stories

1. **As a** manager, **I want to** see daily operating results by line and totals **so that** I can review margins.
2. **As an** analyst, **I want to** export the report to CSV **so that** I can analyze it externally.
3. **As an** admin, **I want to** process open orders **so that** I can review backlog margins.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept script parameters:
   - `custscriptcustscript_report_date` (date mode target date)
   - `custscriptcustscript_dor_open_orders` (open orders mode)
   - `custscript_dor_folder_id` (output folder, default 5661069)
2. The system must search sales order lines with:
   - `type = SalesOrd`, `mainline = F`, `taxline = F`, `numbertext` not starting with `R`.
3. In date mode, filter by `lastmodifieddate` within target date to next day.
4. In open-orders mode, filter status in `SalesOrd:A,B,D,E,F`.
5. The system must enrich each line with:
   - Item category and inventory posting group.
   - Vendor purchase/contract price from `customrecord_sna_hul_vendorprice`.
6. The system must compute COGS per line using:
   - Time entry cost for service items (service code type `2` + linked time entry).
   - Linked PO rate for temp item `98642` with temp item code.
   - Fulfillment transaction COGS when available.
7. The system must compute gross margin and margin percent.
8. The system must group results by COGS source and output summary + detail.
9. The system must write output files:
   - Summary JSON.
   - Chunked JSON + CSV parts (5000 lines per chunk).
   - Full CSV if only one chunk.

### Acceptance Criteria

- [ ] Report runs in date or open-order mode based on parameters.
- [ ] Output files are saved to the target folder.
- [ ] Summary totals and per-source breakdown are included.
- [ ] Large datasets are split into multiple files under size limits.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update any transaction data.
- Provide a UI for viewing results.
- Handle rental orders (explicitly excluded).

---

## 6. Design Considerations

### User Interface
- None (file output only).

### User Experience
- Outputs are stored in File Cabinet for downstream use.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (line data)
- Item
- Time Entry (`timebill`)
- Purchase Order (linked PO lookup)
- Custom Record: `customrecord_sna_hul_vendorprice`

**Script Types:**
- [x] Map/Reduce - Report generation and file output
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order Line | `custcol_sna_linked_time`
- Sales Order Line | `custcol_sna_so_service_code_type`
- Sales Order Line | `custcol_sna_hul_temp_porate`
- Sales Order Line | `custcol_sna_hul_temp_item_code`
- Sales Order Line | `custcol_sna_linked_po`
- Sales Order Line | `custcol_sna_hul_fleet_no`
- Item | `custitem_sna_hul_itemcategory`
- Item | `custitem_sna_inv_posting_grp`

**Saved Searches:**
- None (Search API + lookups used).

### Integration Points
- Output files consumed by reporting workflows.

### Data Requirements

**Data Volume:**
- Potentially large line counts; chunked outputs mitigate size limits.

**Data Sources:**
- Sales order line search, item lookup, vendor price custom records, time entry, and PO lines.

**Data Retention:**
- Stored in File Cabinet with date-stamped filenames.

### Technical Constraints
- Uses search for fulfillment COGS via join.
- Temp item cost logic relies on item ID `98642` and temp item code matching.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Output folder must exist; vendor price records should be populated.

### Governance Considerations
- Item and vendor price lookups per line; heavy datasets may consume usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Report files are generated daily without errors.
- Margin calculations match expectations for sample lines.

**How we'll measure:**
- Audit log review and spot checks of output files.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| daily-operating-report-mapreduce.js | Map/Reduce | Generate daily/open-orders operating report | Implemented |

### Development Approach

**Phase 1:** Data collection
- [x] Sales order line search and parameterized filters
- [x] Item and vendor price enrichment

**Phase 2:** Cost logic
- [x] Time entry cost for service lines
- [x] Temp item linked PO cost
- [x] Fulfillment COGS fallback

**Phase 3:** Output
- [x] Summary aggregation
- [x] Chunked JSON/CSV file creation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Date-based run produces summary and output files.
2. Open-order mode produces output files with correct status filters.

**Edge Cases:**
1. No results -> summary file still created.
2. Lines without fulfillment COGS -> cogsSource "notFulfilled".
3. Temp item without linked PO -> cogsSource "noLinkedPO".

**Error Handling:**
1. Search or file errors are logged and do not crash summarize.

### Test Data Requirements
- Sales orders with service lines, temp items, and fulfillment COGS.

### Sandbox Setup
- Configure folder ID and run Map/Reduce on a known dataset.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admins running scheduled Map/Reduce.

**Permissions required:**
- View Sales Orders, Items, Time Entries, Purchase Orders, and Vendor Price records.
- Create files in File Cabinet.

### Data Security
- Output files contain transactional data; restrict folder access.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy Map/Reduce script with parameters.
2. Schedule or trigger as needed.

### Post-Deployment

- [ ] Verify output files and summary totals.

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the vendor price lookup be cached to reduce usage?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| High governance usage on large datasets | Medium | Medium | Use chunking; optimize lookups |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce docs.
- Search API docs.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
