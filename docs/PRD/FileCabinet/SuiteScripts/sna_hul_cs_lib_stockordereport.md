# PRD: Stock Order Report Suitelet Client Library

**PRD ID:** PRD-UNKNOWN-StockOrderReportLib
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_lib_stockordereport.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_stockorderreport.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client-side library for the Stock Order Report Suitelet that manages filter behavior and triggers CSV generation when filters are empty.

**What problem does it solve?**
It prevents timeouts by warning users about unfiltered queries and offers CSV generation via a server-side process.

**Primary Goal:**
Guide users to apply filters or generate CSV output when no filters are set.

---

## 2. Goals

1. Normalize location filter display name.
2. Detect when no filters are applied and warn the user.
3. Trigger CSV generation via Suitelet call when requested.

---

## 3. User Stories

1. **As a** user, **I want** a warning before running an unfiltered report **so that** I avoid timeouts.
2. **As a** user, **I want** a CSV option when data is large **so that** I can still get results.

---

## 4. Functional Requirements

### Core Functionality

1. When `custpage_filter_loc` changes, the script must set `custpage_filter_locname` to the location name extracted from the selected text.
2. On save, the script must detect if all filter fields are empty and show a confirmation dialog.
3. If the user confirms, the script must call the Suitelet with `isCSV=true` and pass query parameters to schedule CSV generation.
4. The script must display a confirmation message and reload the page after triggering CSV generation.

### Acceptance Criteria

- [ ] Unfiltered save prompts a warning and offers CSV generation.
- [ ] CSV generation call uses the Suitelet script and deployment IDs.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate filter values or enforce specific filter combinations.
- Render the CSV directly on the client.

---

## 6. Design Considerations

### User Interface
- Uses dialog confirmation and confirmation message banner.

### User Experience
- Users can proceed with CSV generation when filters are blank.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- None (Suitelet-driven report)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Stock order report
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Suitelet UI logic

**Custom Fields:**
- Suitelet | `custpage_filter_itemcat`
- Suitelet | `custpage_filter_vendor`
- Suitelet | `custpage_filter_loc`
- Suitelet | `custpage_filter_locname`
- Suitelet | `custpage_filter_demper`
- Suitelet | `custpage_filter_demper_end`
- Suitelet | `custpage_filter_poper`
- Suitelet | `custpage_filter_poper_end`
- Suitelet | `custpage_filter_diffmin`
- Suitelet | `custpage_filter_diffmax`
- Suitelet | `custpage_filter_ropqty`

**Saved Searches:**
- None.

### Integration Points
- Calls Suitelet `customscript_sna_hul_sl_stockorderreport` with CSV parameters.

### Data Requirements

**Data Volume:**
- No data processing on the client beyond filter checks.

**Data Sources:**
- Suitelet fields and URL query parameters.

**Data Retention:**
- None.

### Technical Constraints
- Uses HTTPS POST from the client to trigger the Suitelet.

### Dependencies
- **Libraries needed:** N/https, N/runtime, N/search, N/ui/message, N/url, N/ui/dialog, N/currentRecord.
- **External dependencies:** None.
- **Other features:** Suitelet that handles CSV generation.

### Governance Considerations
- Client-side only; server usage depends on Suitelet implementation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users are warned about unfiltered runs and can generate CSVs successfully.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_lib_stockordereport.js | Client Script | Suitelet filter and CSV trigger logic | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Filter handling and location name parsing.
- **Phase 2:** CSV trigger and messaging.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Set a location filter and verify `custpage_filter_locname` is updated.
2. Save with no filters, confirm dialog, and CSV generation message.

**Edge Cases:**
1. Save with at least one filter; no warning shown.

**Error Handling:**
1. Suitelet POST fails; user should see error message if added later.

### Test Data Requirements
- Suitelet deployed with filter fields.

### Sandbox Setup
- Deploy client library to the stock order report Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users running stock order reports.

**Permissions required:**
- Suitelet access.

### Data Security
- No sensitive data exposed in client calls.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet script/deployment IDs.

### Deployment Steps
1. Upload `sna_hul_cs_lib_stockordereport.js`.
2. Deploy on the stock order report Suitelet.

### Post-Deployment
- Verify filter warning and CSV trigger behavior.

### Rollback Plan
- Remove client script deployment from Suitelet.

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
- [ ] Should the client block save entirely when no filters are set?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Unfiltered requests still possible if dialog dismissed | Low | Med | Enforce filters server-side |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
