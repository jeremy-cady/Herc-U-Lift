# PRD: Spee-Dee Manifest Report Suitelet

**PRD ID:** PRD-UNKNOWN-SpeeDeeManifestReport
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_speedeemanifestreport.js (Suitelet)
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_speedeemanifestreport.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Suitelet that renders a shipment manifest form and parcel list for Spee-Dee shipments based on item fulfillments.

**What problem does it solve?**
Provides a UI to review parcel details and print parcel labels or manifests using stored parcel JSON data.

**Primary Goal:**
List parcel data from item fulfillments and provide print actions.

---

## 2. Goals

1. Allow users to filter item fulfillments by date range or specific ID.
2. Parse parcel JSON and display parcel details in a sublist.
3. Provide buttons for printing parcels and manifests.

---

## 3. User Stories

1. **As a** shipping user, **I want** to view parcels by date **so that** I can print manifests.
2. **As a** shipping user, **I want** to print parcel labels **so that** shipments can be processed.
3. **As an** admin, **I want** parcel JSON displayed **so that** data can be reviewed.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept optional `dateFrom`, `dateTo`, and `ifId` parameters.
2. The system must render a form with date filters when `ifId` is not provided.
3. The system must search item fulfillments with `custbody_sna_parceljson` populated.
4. The system must parse parcel JSON and display parcel details in a sublist.
5. The system must attach client script `sna_hul_cs_speedeemanifestreport.js`.
6. The system must provide buttons for "Print Parcel(s)" and "Print Manifest".

### Acceptance Criteria

- [ ] Form renders with date filters and parcel list.
- [ ] Parcel data is displayed correctly from JSON.
- [ ] Print buttons trigger client script functions.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Generate or update parcel JSON data.
- Create new item fulfillments.
- Store manifest output in the File Cabinet.

---

## 6. Design Considerations

### User Interface
- Suitelet form with date filter fields, buttons, and parcel sublist.

### User Experience
- Users can quickly find parcels and print labels or manifests.

### Design References
- Client script `sna_hul_cs_speedeemanifestreport.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Fulfillment (transaction)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Spee-Dee manifest report
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Used for print actions

**Custom Fields:**
- Item Fulfillment | `custbody_sna_parceljson`

**Saved Searches:**
- Transaction search for item fulfillments with parcel JSON.

### Integration Points
- Client-side printing actions (implementation in client script).

### Data Requirements

**Data Volume:**
- Multiple parcels per item fulfillment.

**Data Sources:**
- Item fulfillment parcel JSON.

**Data Retention:**
- No storage changes.

### Technical Constraints
- Parcel JSON must be valid and parseable.
- Search uses created date or specific internal ID.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Client script for printing.

### Governance Considerations
- Search usage per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Parcel data displays and print actions are available.

**How we'll measure:**
- Verify parcel listing and print actions for a test fulfillment.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_speedeemanifestreport.js | Suitelet | Display parcel list and print actions | Implemented |

### Development Approach

**Phase 1:** Data retrieval
- [x] Search fulfillments with parcel JSON.

**Phase 2:** UI rendering
- [x] Build form and sublist, attach client script.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open Suitelet with date range and verify parcel sublist.

**Edge Cases:**
1. Item fulfillment ID provided directly; verify specific record loads.
2. No parcel JSON found; sublist remains empty.

**Error Handling:**
1. JSON parse failure logs error and skips entry.

### Test Data Requirements
- Item fulfillment with `custbody_sna_parceljson` data.

### Sandbox Setup
- Ensure client script deployment is available.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Shipping users.

**Permissions required:**
- View item fulfillment records
- Access to client script

### Data Security
- Parcel details are visible to authorized roles only.

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

1. Upload `sna_hul_sl_speedeemanifestreport.js` and `sna_hul_cs_speedeemanifestreport.js`.
2. Deploy Suitelet and confirm access.
3. Validate parcel list and print actions.

### Post-Deployment

- [ ] Verify output for sample fulfillments.
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

- [ ] Should manifest output be stored for audit purposes?
- [ ] Should date filter default to last 7 days instead of today?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid parcel JSON breaks parsing | Med | Med | Add validation or try-catch per record |
| Large date ranges may slow search | Med | Med | Add date range limits or paging |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Suitelet
- N/ui/serverWidget module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
