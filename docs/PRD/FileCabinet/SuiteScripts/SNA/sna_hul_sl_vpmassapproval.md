# PRD: Vendor Price Mass Approval Suitelet

**PRD ID:** PRD-UNKNOWN-VPMassApprovalSuitelet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_vpmassapproval.js (Suitelet)
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_vpmassapproval.js (Client Script)
- FileCabinet/SuiteScripts/SNA/sna_hul_mr_vpmassapproval.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet UI to review vendor price records flagged for approval, select records, and trigger a Map/Reduce approval process.

**What problem does it solve?**
Enables bulk approval of vendor price updates with pagination and optional item category filtering.

**Primary Goal:**
Provide a paged review list of vendor prices and submit them for approval via Map/Reduce.

---

## 2. Goals

1. Display vendor prices flagged for approval in a paged sublist.
2. Allow selection and bulk approval submission.
3. Trigger a Map/Reduce script to perform approvals.

---

## 3. User Stories

1. **As a** pricing admin, **I want** to review vendor prices in a paged list **so that** I can approve updates efficiently.
2. **As a** pricing admin, **I want** to submit selected prices **so that** updates are processed in bulk.
3. **As an** admin, **I want** a threshold parameter **so that** pricing comparisons can be configured.

---

## 4. Functional Requirements

### Core Functionality

1. The system must render a Suitelet form with vendor price records flagged for approval.
2. The system must support pagination using the `param_page` request parameter.
3. The system must support item category filtering via `param_ic`.
4. The system must allow selecting vendor price records using checkboxes.
5. The system must submit selected vendor price IDs to a Map/Reduce script (`customscript_sna_hul_mr_approvevp`).
6. The system must display a notification when the approval process starts or when no records are selected.
7. The system must attach client script `sna_hul_cs_vpmassapproval.js` for UI behavior.

### Acceptance Criteria

- [ ] Vendor prices display with pagination.
- [ ] Selected records are passed to the Map/Reduce approval script.
- [ ] User sees a confirmation message after submission.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Approve vendor prices synchronously in the Suitelet.
- Validate vendor price data beyond search filters.
- Persist selection state between sessions outside request parameters.

---

## 6. Design Considerations

### User Interface
- Suitelet form with filters, sublist, pagination, and submit button.

### User Experience
- Users can page through and approve many records without loading all results at once.

### Design References
- Client script `sna_hul_cs_vpmassapproval.js` for mark/unmark and paging.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item
- Vendor
- Item Category (`customrecord_sna_hul_itemcategory`)

**Script Types:**
- [ ] Map/Reduce - Used for approval processing
- [ ] Scheduled Script - Not used
- [x] Suitelet - Vendor price approval UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Used for UI actions

**Custom Fields:**
- Vendor Price | `custrecord_sna_hul_forapproval`
- Vendor Price | `custrecordsna_hul_vendoritemnumber`
- Vendor Price | `custrecord_sna_hul_t_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_t_listprice`
- Vendor Price | `custrecord_sna_hul_t_contractprice`
- Vendor Price | `custrecord_sna_hul_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_listprice`
- Vendor Price | `custrecord_sna_hul_contractprice`
- Item | `custitem_sna_hul_itemcategory`

**Saved Searches:**
- Dynamic search for vendor price records flagged for approval.

### Integration Points
- Map/Reduce script `customscript_sna_hul_mr_approvevp`.

### Data Requirements

**Data Volume:**
- Paged result set based on `custscript_param_nooflinestoshow`.

**Data Sources:**
- Vendor price records and related item/vendor data.

**Data Retention:**
- No storage changes; approvals handled by Map/Reduce.

### Technical Constraints
- Uses script parameters `custscript_param_nooflinestoshow` and `custscript_param_dealernetpricethreshold`.
- Item category filter is present but filter application is commented out in the search.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Map/Reduce approval script and client script.

### Governance Considerations
- Paged search reduces usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor prices can be selected and approval process starts successfully.

**How we'll measure:**
- Confirm Map/Reduce task submission and completion email.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_vpmassapproval.js | Suitelet | Vendor price approval UI | Implemented |

### Development Approach

**Phase 1:** Data retrieval and paging
- [x] Search vendor prices with paging.

**Phase 2:** Approval execution
- [x] Submit Map/Reduce task with selected IDs.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open Suitelet, select vendor prices, submit, and confirm notification.

**Edge Cases:**
1. No records selected; notification indicates no selection.
2. Large result set; paging works across pages.

**Error Handling:**
1. Task submission fails; error is logged.

### Test Data Requirements
- Vendor price records flagged for approval.

### Sandbox Setup
- Configure script parameters for lines per page and price threshold.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Pricing admins.

**Permissions required:**
- View and edit vendor price records
- Permission to run Map/Reduce scripts

### Data Security
- Access limited to authorized roles.

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

1. Upload `sna_hul_sl_vpmassapproval.js` and `sna_hul_cs_vpmassapproval.js`.
2. Deploy Suitelet and configure parameters.
3. Ensure `customscript_sna_hul_mr_approvevp` is deployed.

### Post-Deployment

- [ ] Verify Map/Reduce task submission for selected records.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Suitelet deployment.

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

- [ ] Should item category filtering be fully enabled in search filters?
- [ ] Should approval run synchronously for small batches?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Map/Reduce task fails silently | Med | Med | Add task status tracking and notification |
| Large result set still slow to page | Med | Med | Optimize filters and page size |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/task module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
