# PRD: VRA Matcher RESTlet

**PRD ID:** PRD-UNKNOWN-VRAMatcherRestlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/vra_matcher_restlet.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that matches vendor credits to Vendor Return Authorizations (VRAs) using a VRA number, PO number, or vendor + item matching logic.

**What problem does it solve?**
Automates matching vendor credits to VRAs for downstream processing and reconciliation workflows.

**Primary Goal:**
Return the best VRA match and its line items based on the provided request data.

---

## 2. Goals

1. Match VRAs by direct VRA number.
2. Match VRAs by related PO number.
3. Match VRAs by vendor and line-item similarity.

---

## 3. User Stories

1. **As an** integration system, **I want to** match a credit to a VRA **so that** reconciliation is automated.
2. **As a** buyer, **I want** PO or VRA matching **so that** I can review return data quickly.
3. **As an** operator, **I want** fallback item matching **so that** I can still match when IDs are missing.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept POST data with:
   - `vraNumber`
   - `poNumber`
   - `vendorId`
   - `vendorName`
   - `lineItems`
   - `processId`
   - `creditTotal`
2. The system must attempt matching in order:
   - Direct VRA number search
   - PO number to VRA search
   - Vendor + line item matching
3. The system must return `matchFound: true` with VRA details when a match is found.
4. The system must return `matchFound: false` with attempted search details when no match is found.
5. Vendor line item matching must:
   - Compare credit item part numbers to VRA item numbers
   - Allow VRA item suffix removal (`-JLG`, `-MIT`, `-MITSU`, `-CAT`, `-HYU`)
   - Compare vendor item name field `custcol_sna_vendor_item_name`
6. The system must choose the best VRA match based on match percentage and require >= 50% threshold.
7. The system must return VRA line items for matched VRAs.
8. Errors must return a response with `matchFound: false` and error details.

### Acceptance Criteria

- [ ] VRA match by `vraNumber` returns a direct match.
- [ ] VRA match by `poNumber` returns a match when available.
- [ ] Vendor matching returns the best match when >= 50% of items match.
- [ ] No-match response includes attempted search parameters.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update any NetSuite records.
- Validate credit totals against VRAs.
- Handle GET requests.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- Deterministic matching order with a clear response payload.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Return Authorization
- Vendor
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - VRA matching
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- VRA Line | `custcol_sna_vendor_item_name`

**Saved Searches:**
- None (searches created in script).

### Integration Points
- External integration (n8n) posts VRA matching requests.

### Data Requirements

**Data Volume:**
- Single matching request with multiple line items.

**Data Sources:**
- Vendor return authorization searches and line-item searches.

**Data Retention:**
- None; read-only.

### Technical Constraints
- Vendor matching uses line-level search (mainline = F).
- Matching threshold fixed at 50%.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** n8n or other integration client.
- **Other features:** VRA line field `custcol_sna_vendor_item_name`.

### Governance Considerations
- Multiple searches per request; large line item lists may add latency.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Matching logic returns correct VRAs for credits.

**How we'll measure:**
- Integration logs and reconciliation outcomes.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| vra_matcher_restlet.js | RESTlet | Match credits to VRAs | Implemented |

### Development Approach

**Phase 1:** Direct matching
- [x] VRA number search
- [x] PO number search

**Phase 2:** Vendor matching
- [x] Vendor ID resolution by name
- [x] Line item matching and scoring

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST with valid `vraNumber` returns a direct match.
2. POST with `poNumber` returns a VRA match.
3. POST with vendor + line items returns a match above 50%.

**Edge Cases:**
1. Vendor name not found returns no match.
2. Line items do not match any VRA lines.
3. Multiple VRAs exist; best match selected by score.

**Error Handling:**
1. Search errors return `matchFound: false` with error text.

### Test Data Requirements
- Vendor returns with known VRA numbers, POs, and line items.

### Sandbox Setup
- Ensure `custcol_sna_vendor_item_name` is populated where needed.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles with RESTlet access.

**Permissions required:**
- View access to vendor return authorizations, vendors, and items.

### Data Security
- Restrict RESTlet access to trusted roles/integration tokens.

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

1. Upload `vra_matcher_restlet.js`.
2. Create RESTlet script record and deploy.
3. Assign integration role permissions.

### Post-Deployment

- [ ] Monitor RESTlet logs for match outcomes.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment.

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

- [ ] Should the match threshold be configurable?
- [ ] Should `creditTotal` be used to validate matches?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Low match accuracy with noisy item numbers | Med | Med | Enhance normalization rules |
| High latency with many line items | Med | Med | Optimize search or limit items |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 RESTlet
- Search API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
