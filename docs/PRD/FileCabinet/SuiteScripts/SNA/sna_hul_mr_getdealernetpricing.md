# PRD: DealerNet Vendor Price Sync (Map/Reduce)

**PRD ID:** PRD-UNKNOWN-DealerNetPricingMR
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_getdealernetpricing.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that syncs vendor price records with DealerNet pricing and flags records that exceed configured thresholds.

**What problem does it solve?**
Keeps vendor pricing in NetSuite aligned with DealerNet and highlights records that require approval.

**Primary Goal:**
Update vendor price records from DealerNet and report unmatched/superseded items.

---

## 2. Goals

1. Retrieve DealerNet pricing for vendor items.
2. Update staged and live pricing fields based on thresholds.
3. Email a report of unmatched or unsynced items.

---

## 3. User Stories

1. **As a** pricing admin, **I want** DealerNet prices synced **so that** vendor pricing is current.
2. **As an** approver, **I want** over-threshold prices flagged **so that** they can be reviewed.
3. **As an** admin, **I want** a report of unmatched items **so that** I can resolve discrepancies.

---

## 4. Functional Requirements

### Core Functionality

1. The system must search vendor price records based on script parameters and filters.
2. The system must request a DealerNet access token using `custscript_param_dealerkey` and access URL.
3. The system must call DealerNet part detail API using vendor item number and dealer code.
4. The system must update staged price fields:
   - `custrecord_sna_hul_t_itempurchaseprice`
   - `custrecord_sna_hul_t_listprice`
   - `custrecord_sna_hul_t_contractprice`
   - `custrecord_sna_hul_t_qtybreakprices`
5. The system must compare DealerNet prices to current prices using `custscript_param_dealernetpricethreshold`.
6. If within threshold, the system must update live price fields.
7. If outside threshold, the system must set `custrecord_sna_hul_forapproval` and add remarks.
8. The system must flag superseded items and unmatched items with remarks.
9. The system must email a CSV report of unmatched or unsynced records to configured recipients.

### Acceptance Criteria

- [ ] DealerNet pricing updates staged fields on vendor price records.
- [ ] Over-threshold prices are flagged for approval.
- [ ] Superseded/unmatched items are marked and reported.
- [ ] CSV report email is sent after execution.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Perform user approvals of flagged records.
- Modify pricing for items without DealerNet data.
- Handle non-DealerNet vendors.

---

## 6. Design Considerations

### User Interface
- None (batch processing with email report).

### User Experience
- Vendor price updates happen automatically; approvals required only when thresholds exceeded.

### Design References
- DealerNet API endpoints and vendor price custom record.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item
- Vendor

**Script Types:**
- [x] Map/Reduce - DealerNet sync
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- `custrecord_sna_hul_itempurchaseprice`
- `custrecord_sna_hul_listprice`
- `custrecord_sna_hul_contractprice`
- `custrecord_sna_hul_t_itempurchaseprice`
- `custrecord_sna_hul_t_listprice`
- `custrecord_sna_hul_t_contractprice`
- `custrecord_sna_hul_t_qtybreakprices`
- `custrecord_sna_hul_forapproval`
- `custrecord_sna_hul_issynced`
- `custrecord_sna_hul_remarks`
- `custrecordsna_hul_vendoritemnumber`

**Saved Searches:**
- None; dynamic search is created in script.

### Integration Points
- DealerNet API (`GetPartDetailsByOemPartCode`).

### Data Requirements

**Data Volume:**
- One API call per vendor price record.

**Data Sources:**
- Vendor price records and DealerNet responses.

**Data Retention:**
- Updates staged and live pricing fields and remarks.

### Technical Constraints
- Uses external HTTPS calls from Map/Reduce reduce stage.
- Relies on multiple script parameters for DealerNet integration.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** DealerNet API endpoints.
- **Other features:** Email recipients and parameters configured.

### Governance Considerations
- External API calls per record can be heavy; monitor usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor pricing aligns with DealerNet and approvals are flagged appropriately.

**How we'll measure:**
- Review vendor price records and email report.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_getdealernetpricing.js | Map/Reduce | DealerNet vendor price sync | Implemented |

### Development Approach

**Phase 1:** Vendor price retrieval
- [x] Load vendor price records and DealerNet token.

**Phase 2:** Pricing update and reporting
- [x] Update records and send CSV report.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. DealerNet returns pricing; vendor price record updates.

**Edge Cases:**
1. DealerNet returns superseded flag.
2. DealerNet returns no match.

**Error Handling:**
1. API error; record marked as not synced with remarks.

### Test Data Requirements
- Vendor price records with vendor item numbers.

### Sandbox Setup
- Map/Reduce deployment with DealerNet parameters set.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Script deployment role with edit access to vendor price records.

**Permissions required:**
- Edit vendor price custom records
- Send email
- Create files

### Data Security
- DealerNet credentials stored in script parameters; restrict access.

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

1. Upload `sna_hul_mr_getdealernetpricing.js`.
2. Configure DealerNet parameters and recipients.
3. Run in sandbox before production.

### Post-Deployment

- [ ] Verify vendor price updates and email report.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

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

- [ ] Should API calls be throttled to avoid rate limits?
- [ ] Should approvals auto-trigger workflows?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| DealerNet API outage | Med | High | Add retries and error alerts |
| Large vendor price set increases runtime | Med | Med | Batch or limit search scope |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce
- N/https module

### External Resources
- DealerNet API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
