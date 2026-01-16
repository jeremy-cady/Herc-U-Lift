# PRD: Requisition Worksheet

**PRD ID:** PRD-UNKNOWN-RequisitionWorksheet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_requisition_worksheet.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that provides a requisition worksheet UI to create purchasing data and vendor pricing context.

**What problem does it solve?**
Centralizes item, vendor, and location data so users can build requisitions with accurate pricing and vendor info.

**Primary Goal:**
Display requisition worksheet data and supporting vendor pricing details.

---

## 2. Goals

1. Load vendor pricing data for items and vendors.
2. Provide vendor and item context for requisition lines.
3. Support temporary items and related SO line ID handling.

---

## 3. User Stories

1. **As a** buyer, **I want to** view vendor pricing **so that** I can choose the best supplier.
2. **As a** buyer, **I want to** build requisitions based on SO demand **so that** ordering is aligned.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must load vendor pricing records from `customrecord_sna_hul_vendorprice`.
2. The Suitelet must parse quantity break pricing JSON when present.
3. The Suitelet must provide vendor lists and primary vendor data for items.
4. The Suitelet must check whether SO lines already created POs.
5. The Suitelet must support shipping method handling for transfer items.

### Acceptance Criteria

- [ ] Vendor pricing data is loaded and parsed correctly.
- [ ] Vendor lists include primary vendor flags.
- [ ] SO created PO checks return line details.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create POs directly within the Suitelet.
- Validate vendor pricing beyond data lookup.
- Enforce requisition approvals.

---

## 6. Design Considerations

### User Interface
- Requisition worksheet UI with vendor/item context.

### User Experience
- Users can review pricing and vendor data while preparing requisitions.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_vendorprice
- transaction
- location

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Requisition worksheet UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_item | Item
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_vendor | Vendor
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_itempurchaseprice | Purchase price
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_contractprice | Contract price
- customrecord_sna_hul_vendorprice | custrecord_sna_hul_qtybreakprices | Quantity break prices
- customrecord_sna_hul_vendorprice | custrecord_sna_vendor_item_name2 | Vendor item name

**Saved Searches:**
- None (script builds searches and SuiteQL at runtime).

### Integration Points
- Uses SuiteQL to identify SO lines with created POs.

### Data Requirements

**Data Volume:**
- Vendor price records per item.

**Data Sources:**
- Vendor price custom records
- Transaction lines for SO/PO data

**Data Retention:**
- No new records created.

### Technical Constraints
- Quantity break pricing parsing expects JSON-like data.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Requisition worksheet UI client logic

### Governance Considerations

- **Script governance:** Multiple searches and SuiteQL.
- **Search governance:** Potentially large vendor price searches.
- **API limits:** Moderate depending on data volume.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Requisition worksheet displays accurate vendor pricing data.

**How we'll measure:**
- Compare UI results to vendor price records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_requisition_worksheet.js | Suitelet | Requisition worksheet UI | Implemented |

### Development Approach

**Phase 1:** Data loading
- [ ] Validate vendor price search data

**Phase 2:** UI validation
- [ ] Test pricing display and SO line checks

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Items display vendor pricing and primary vendor data.

**Edge Cases:**
1. Missing quantity price JSON returns empty array.
2. No vendor records returns empty lists.

**Error Handling:**
1. SuiteQL query failures are logged.

### Test Data Requirements
- Vendor price records with quantity break data

### Sandbox Setup
- Deploy Suitelet and verify vendor price records

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- View access to vendor price records and transactions

### Data Security
- Vendor pricing data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm vendor price records are populated

### Deployment Steps

1. Deploy Suitelet.
2. Provide access to purchasing users.

### Post-Deployment

- [ ] Validate worksheet output

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert to prior requisition process.

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

- [ ] Should vendor pricing be cached for performance?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Vendor pricing data quality issues | Med | Med | Validate records and input formats |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/query module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
