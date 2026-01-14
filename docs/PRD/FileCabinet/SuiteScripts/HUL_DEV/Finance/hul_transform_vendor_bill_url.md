# PRD: Transform Vendor Bill TrinDocs URL

**PRD ID:** PRD-20241010-TransformVendorBillUrl
**Created:** October 10, 2024
**Last Updated:** October 10, 2024
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Finance/hul_transform_vendor_bill_url.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that scans Vendor Bills and upgrades TrinDocs URLs from `http` to `https`.

**What problem does it solve?**
Vendor Bill TrinDocs links stored with `http` need to be normalized to `https` for secure access.

**Primary Goal:**
Normalize all stored TrinDocs URLs on Vendor Bills to `https`.

---

## 2. Goals

1. Find Vendor Bills with a TrinDocs URL present.
2. Replace `http` with `https` in the URL.
3. Update the Vendor Bill with the corrected URL.

---

## 3. User Stories

1. **As an** AP user, **I want to** open Vendor Bill TrinDocs links securely **so that** I can access documents without browser warnings.
2. **As an** admin, **I want to** standardize stored URLs **so that** document links are consistent.
3. **As a** developer, **I want to** batch‑update Vendor Bills **so that** I avoid manual edits.

---

## 4. Functional Requirements

### Core Functionality

1. The system must query Vendor Bills where `custbody_sna_hul_trindocs_url` is not `'null'`.
2. The system must emit each Vendor Bill ID with its URL.
3. The system must replace the first `http` prefix with `https`.
4. The system must update `custbody_sna_hul_trindocs_url` with the new URL.

### Acceptance Criteria

- [ ] Vendor Bills with `http` URLs are updated to `https`.
- [ ] Vendor Bills with already‑`https` URLs remain unchanged.
- [ ] Script runs without unhandled errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate URL reachability.
- Update other URL fields.
- Process non‑Vendor Bill transactions.

---

## 6. Design Considerations

### User Interface
- None (background processing).

### User Experience
- No user interaction required.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Bill (transaction)

**Script Types:**
- [x] Map/Reduce - Batch URL update
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Transaction | `custbody_sna_hul_trindocs_url` | TrinDocs URL

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- TrinDocs URL usage on Vendor Bills.

### Data Requirements

**Data Volume:**
- All Vendor Bills with a non‑null TrinDocs URL.

**Data Sources:**
- SuiteQL query on `transaction`.

**Data Retention:**
- N/A.

### Technical Constraints
- Uses string replacement on the first `http` occurrence.
- Query filters on `custbody_sna_hul_trindocs_url != 'null'`.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** TrinDocs integration consuming the URL.

### Governance Considerations
- record.submitFields per Vendor Bill.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- TrinDocs URLs are consistently `https` on Vendor Bills.

**How we'll measure:**
- Spot checks of Vendor Bills after script run.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_transform_vendor_bill_url.js | Map/Reduce | Upgrade TrinDocs URLs to https | Implemented |

### Development Approach

**Phase 1:** Batch update
- [x] SuiteQL query for Vendor Bill URLs
- [x] Map/Reduce update with https replacement

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Vendor Bill with `http` URL → updated to `https`.

**Edge Cases:**
1. URL already `https` → unchanged.
2. URL field blank or `'null'` → not included.

**Error Handling:**
1. Update failures are logged.

### Test Data Requirements
- Vendor Bills with `http` and `https` TrinDocs URLs.

### Sandbox Setup
- Deploy Map/Reduce and run on sample data.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Admin or AP roles running the script.

**Permissions required:**
- Edit Vendor Bills.

### Data Security
- URLs only; no sensitive data added.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy the Map/Reduce script.
2. Run on production data set.

### Post-Deployment

- [ ] Verify URL updates on sample Vendor Bills.

### Rollback Plan

**If deployment fails:**
1. Disable the Map/Reduce deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | 2024-10-10 | 2024-10-10 | Done |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should the query exclude inactive Vendor Bills?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| URL value contains unexpected protocol format | Low | Low | Review regex if needed |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce docs.
- SuiteQL reference.

### External Resources
- TrinDocs documentation (internal).

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2024-10-10 | Jeremy Cady | 1.0 | Initial implementation |
