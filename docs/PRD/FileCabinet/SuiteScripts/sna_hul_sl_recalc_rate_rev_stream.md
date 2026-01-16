# PRD: Recalculate Rate and Revenue Stream

**PRD ID:** PRD-UNKNOWN-RecalcRateRevStream
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_recalc_rate_rev_stream.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that triggers a Map/Reduce to recalculate sales order line rates and/or revenue streams, and displays progress.

**What problem does it solve?**
Provides a UI to run recalculation jobs and monitor processed line counts.

**Primary Goal:**
Start recalculation jobs and show progress for a sales order.

---

## 2. Goals

1. Create or reuse a process-tracking custom record.
2. Trigger the Map/Reduce recalculation job.
3. Display progress with a refreshable UI.

---

## 3. User Stories

1. **As a** user, **I want to** recalculate rates **so that** line values are updated.
2. **As an** admin, **I want to** see progress **so that** I know when processing is complete.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `custparam_actionType` and `custparam_soId` parameters.
2. The Suitelet must create or locate a `customrecord_sna_hul_so_lines_processed` record.
3. The Suitelet must submit the Map/Reduce script `customscript_sna_hul_mr_recalc_rate_revs` with parameters.
4. The Suitelet must show a refreshable status page with processed line count.
5. When `custparam_actionType=refreshSuitelet`, the Suitelet must display current process status and line counts.

### Acceptance Criteria

- [ ] Map/Reduce is submitted once per sales order process.
- [ ] Status page shows sales order, status, and lines processed.
- [ ] Refresh button reloads the status.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Recalculate rates directly in the Suitelet.
- Allow manual edits to processed counts.
- Provide a full progress bar.

---

## 6. Design Considerations

### User Interface
- Form titled "Recalculating Rate" with status fields and a Refresh button.

### User Experience
- Refresh to check status while MR job runs.

### Design References
- Client script `sna_hul_cs_recalculate_rate_rev_stream.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_so_lines_processed
- salesorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Trigger and monitor recalculation
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_sales_order | Sales order
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_so_lines_processed | Lines processed
- customrecord_sna_hul_so_lines_processed | custrecord_sna_hul_process_status | Process status

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Map/Reduce `customscript_sna_hul_mr_recalc_rate_revs`.

### Data Requirements

**Data Volume:**
- One tracking record per sales order run.

**Data Sources:**
- Tracking custom record

**Data Retention:**
- Tracking records persist for audit.

### Technical Constraints
- Only one in-progress record per sales order is allowed.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** MR recalculation script

### Governance Considerations

- **Script governance:** Custom record create/load and MR submit.
- **Search governance:** Search for existing in-progress record.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Recalculation jobs start and progress is tracked.

**How we'll measure:**
- Tracking record counts and MR logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_recalc_rate_rev_stream.js | Suitelet | Trigger and monitor recalculation | Implemented |

### Development Approach

**Phase 1:** Tracking record setup
- [ ] Confirm custom record fields

**Phase 2:** MR invocation
- [ ] Test MR submission and refresh flow

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Suitelet submits MR and shows progress fields.

**Edge Cases:**
1. Existing in-progress record redirects to refresh view.

**Error Handling:**
1. MR submission failure logs error and does not crash UI.

### Test Data Requirements
- Sales order with lines eligible for recalculation

### Sandbox Setup
- Deploy Suitelet and MR script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales ops or admin roles

**Permissions required:**
- Create custom records
- Execute Map/Reduce scripts

### Data Security
- Access to sales order identifiers only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] MR script deployed
- [ ] Client script available

### Deployment Steps

1. Deploy Suitelet.
2. Add link/button on sales order.

### Post-Deployment

- [ ] Validate progress display

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove link/button.

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

- [ ] Should completed tracking records be archived?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Multiple MR runs for same SO | Low | Med | Enforce in-progress record check |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/task module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
