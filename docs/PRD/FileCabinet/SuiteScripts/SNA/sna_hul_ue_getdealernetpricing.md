# PRD: DealerNet Pricing Sync and Approval (User Event)

**PRD ID:** PRD-UNKNOWN-GetDealerNetPricing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_getdealernetpricing.js (User Event)
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_getdealernetpricing.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that syncs vendor pricing from DealerNet after record save and adds approval buttons and quantity break sublist on vendor price records.

**What problem does it solve?**
Keeps vendor price records in sync with DealerNet and allows approvals when changes exceed threshold limits.

**Primary Goal:**
Fetch DealerNet pricing, update vendor price fields, and provide approval actions in the UI.

---

## 2. Goals

1. Retrieve pricing from DealerNet for vendor price records.
2. Compare prices against threshold and set approval flags.
3. Display approval buttons and quantity break prices in the UI.

---

## 3. User Stories

1. **As a** pricing admin, **I want** DealerNet pricing synced automatically **so that** vendor prices are current.
2. **As a** pricing admin, **I want** approval buttons **so that** out-of-range changes are reviewed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run after submit for vendor price records in UI, Suitelet, or CSV contexts.
2. The system must request an access token from DealerNet using `custscript_param_dealernetaccesstokenurl` and `custscript_param_dealerkey`.
3. The system must request part details using the vendor item number and `custscript_param_dealernetcode`.
4. The system must update target fields (`custrecord_sna_hul_t_*`) and sync flags based on response.
5. The system must compare current prices to DealerNet prices using `custscript_param_dealernetpricethreshold`.
6. The system must set `custrecord_sna_hul_forapproval` when values are outside thresholds.
7. The system must add approval buttons and a quantity break price sublist on beforeLoad.
8. The system must attach client script `sna_hul_cs_getdealernetpricing.js` to handle button actions.

### Acceptance Criteria

- [ ] DealerNet pricing fields populate on save.
- [ ] Approval buttons appear when pricing is out of threshold.
- [ ] Quantity break sublist displays values.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Sync pricing for lot items (script exits early).
- Run for xedit context.
- Update pricing during Map/Reduce or other execution contexts.

---

## 6. Design Considerations

### User Interface
- Approval buttons and quantity break sublist appear on vendor price record.

### User Experience
- Users can review and approve DealerNet price updates quickly.

### Design References
- Script parameters:
  - `custscript_param_dealernetdomain`
  - `custscript_param_dealerkey`
  - `custscript_param_dealernetaccesstokenurl`
  - `custscript_param_dealernetpricethreshold`
  - `custscript_param_dealernetcode`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Sync pricing and add buttons
- [ ] Client Script - Used for approval actions

**Custom Fields:**
- Vendor Price | `custrecord_sna_hul_item`
- Vendor Price | `custrecordsna_hul_vendoritemnumber`
- Vendor Price | `custrecord_sna_hul_t_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_t_listprice`
- Vendor Price | `custrecord_sna_hul_t_contractprice`
- Vendor Price | `custrecord_sna_hul_t_qtybreakprices`
- Vendor Price | `custrecord_sna_hul_forapproval`
- Vendor Price | `custrecord_sna_hul_issynced`

**Saved Searches:**
- Item search to check lot items.

### Integration Points
- DealerNet API via HTTPS (access token and part details).

### Data Requirements

**Data Volume:**
- One DealerNet request per vendor price record save.

**Data Sources:**
- Vendor price record and DealerNet API responses.

**Data Retention:**
- Updates vendor price fields.

### Technical Constraints
- Pricing comparison uses percent threshold.
- Approval flags are not set during CSV import.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** DealerNet API availability.
- **Other features:** Client script for approval actions.

### Governance Considerations
- External API calls can add latency and usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor price records sync and approval buttons appear as expected.

**How we'll measure:**
- Verify updated fields and button visibility in UI.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_getdealernetpricing.js | User Event | DealerNet sync and approval UI | Implemented |

### Development Approach

**Phase 1:** DealerNet sync
- [x] Fetch and update DealerNet pricing.

**Phase 2:** UI approvals
- [x] Add approval buttons and quantity break sublist.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save vendor price and verify DealerNet fields update.

**Edge Cases:**
1. DealerNet API returns error; sync flag set to false.
2. Lot item detected; script exits early.

**Error Handling:**
1. API errors are logged and record is saved.

### Test Data Requirements
- Vendor price record with vendor item number.

### Sandbox Setup
- Configure DealerNet credentials and thresholds in script parameters.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Pricing admins.

**Permissions required:**
- Edit vendor price records
- Access to client script

### Data Security
- DealerNet credentials stored in script parameters.

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

1. Upload `sna_hul_ue_getdealernetpricing.js` and `sna_hul_cs_getdealernetpricing.js`.
2. Configure DealerNet parameters on the deployment.
3. Verify sync and approval UI.

### Post-Deployment

- [ ] Verify pricing sync and approval actions.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should the DealerNet sync run asynchronously to avoid save delays?
- [ ] Should approval logic apply during CSV imports?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| DealerNet API downtime blocks sync | Med | Med | Add retry or scheduled sync fallback |
| Threshold misconfiguration triggers approvals unnecessarily | Med | Med | Validate threshold parameters |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/https module

### External Resources
- DealerNet API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
