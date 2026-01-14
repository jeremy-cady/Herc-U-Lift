# PRD: SpeeDee Manifest Report Client Script

**PRD ID:** PRD-UNKNOWN-SpeeDeeManifestCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_speedeemanifestreport.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script used on the SpeeDee manifest report page to filter data by date range and print parcel labels or manifests.

**What problem does it solve?**
Enables users to filter the manifest report and generate parcel labels and scan forms via EasyPost.

**Primary Goal:**
Provide client-side filtering and printing actions for SpeeDee shipping manifests.

---

## 2. Goals

1. Filter report results by date range.
2. Print parcel labels for listed shipments.
3. Generate and print a manifest (scan form) for multiple shipments.

---

## 3. User Stories

1. **As a** shipping user, **I want** to filter manifests by date **so that** I only see relevant shipments.
2. **As a** warehouse user, **I want** to print labels quickly **so that** packages can be shipped.
3. **As a** dispatcher, **I want** a scan form **so that** carrier pickup is efficient.

---

## 4. Functional Requirements

### Core Functionality

1. The system must validate that both date-from and date-to are set before filtering.
2. The system must block filtering when date-to is earlier than date-from.
3. The system must refresh the Suitelet URL with date parameters to filter results.
4. The system must print parcel labels from `custpage_sublist_parcel` by opening label URLs.
5. The system must collect shipment IDs from the parcel sublist and request a scan form via EasyPost.
6. The system must open the scan form PDF URL returned by EasyPost.

### Acceptance Criteria

- [ ] Filtering requires valid date range and reloads the Suitelet.
- [ ] Parcel labels open for each line in the parcel sublist.
- [ ] Scan form PDF opens when EasyPost returns a URL.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate shipment contents or weights.
- Create or update shipment records.
- Provide server-side filtering.

---

## 6. Design Considerations

### User Interface
- Uses client-side buttons/actions on the manifest report page.

### User Experience
- Quick filtering and printing without leaving the report page.

### Design References
- EasyPost scan form API (`/scan_forms`).

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- None directly (Suitelet page with custom sublist).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Host page
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Report filtering and printing

**Custom Fields:**
- Page fields: `custpage_datefrom`, `custpage_dateto`
- Sublist fields: `custpage_sl_postagelabel`, `custpage_sl_shipmentid`

**Saved Searches:**
- None (Suitelet handles data).

### Integration Points
- EasyPost API via `https.post` to `/scan_forms`.

### Data Requirements

**Data Volume:**
- One scan form request per manifest print.

**Data Sources:**
- Sublist shipment IDs and labels.

**Data Retention:**
- No data retained client-side.

### Technical Constraints
- Requires script parameters `custscript_param_speedeetoken` and `custscript_param_speedeecarrieraccount`.
- Uses client-side HTTPS calls.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** EasyPost API.
- **Other features:** Suitelet must provide `custpage_sublist_parcel` data.

### Governance Considerations
- Client-side API calls may impact UI responsiveness.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users can filter reports and print labels/manifest successfully.

**How we'll measure:**
- Verify correct PDF URLs open and filtering works.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_speedeemanifestreport.js | Client Script | SpeeDee manifest filtering and printing | Implemented |

### Development Approach

**Phase 1:** Filtering
- [x] Validate date range and reload Suitelet with parameters.

**Phase 2:** Printing
- [x] Open parcel labels and scan form PDFs.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Enter valid date range and filter.
2. Print parcel labels from list.
3. Print manifest for multiple shipments.

**Edge Cases:**
1. Date-to before date-from.
2. No parcel lines present.

**Error Handling:**
1. EasyPost returns error; alert shown with status code.

### Test Data Requirements
- Manifest data with parcel lines.

### Sandbox Setup
- Client script deployed on the manifest Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users viewing the manifest report.

**Permissions required:**
- Access to the Suitelet and shipment data.

### Data Security
- EasyPost API token used in client context; ensure controlled access.

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

1. Upload `sna_hul_cs_speedeemanifestreport.js`.
2. Deploy to the manifest Suitelet page.
3. Validate filtering and printing.

### Post-Deployment

- [ ] Verify label and manifest printing.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the Suitelet page.

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

- [ ] Should filtering persist across browser refreshes?
- [ ] Should scan forms be generated server-side instead of client-side?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| EasyPost token exposure in client | Med | High | Move scan form call to Suitelet |
| Large shipment lists slow printing | Med | Med | Batch label opens or add confirmation |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/https and N/url modules

### External Resources
- EasyPost API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
