# PRD: Update Vendor Price from Latest Vendor Bill (User Event)

**PRD ID:** PRD-UNKNOWN-UpdateVPRate
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_upd_vp_rate.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that updates vendor price purchase rates based on the latest vendor bill for a vendor/item combination.

**What problem does it solve?**
Keeps vendor price records aligned with the most recent vendor bill rates.

**Primary Goal:**
Update `customrecord_sna_hul_vendorprice` item purchase price based on latest vendor bill rates.

---

## 2. Goals

1. Detect when a vendor bill is the latest for a vendor/item.
2. Update vendor price purchase rate to match the latest bill rate.
3. Record remarks indicating the source transaction.

---

## 3. User Stories

1. **As a** purchasing user, **I want** vendor prices updated from bills **so that** pricing stays current.
2. **As an** admin, **I want** a note of the source bill **so that** updates are traceable.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run after submit for vendor bills (non-delete).
2. The system must identify the vendor and items on the bill.
3. The system must find the latest vendor bill for the vendor/items using search filters.
4. If the current bill is the latest, the system must update vendor price `custrecord_sna_hul_itempurchaseprice`.
5. The system must set `custrecord_sna_hul_remarks` to note the source transaction.

### Acceptance Criteria

- [ ] Vendor price record updates when latest vendor bill is saved.
- [ ] Remarks indicate the bill transaction number.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update vendor prices for lot items or non-inventory items.
- Update vendor prices for excluded PO types (emergency, truck down, stock order).
- Run on delete events.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Vendor prices update automatically after vendor bill save.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Vendor Bill
- Vendor Price (`customrecord_sna_hul_vendorprice`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Updates vendor price after submit
- [ ] Client Script - Not used

**Custom Fields:**
- Vendor Bill | `custbody_sna_buy_from`
- Vendor Price | `custrecord_sna_hul_itempurchaseprice`
- Vendor Price | `custrecord_sna_hul_remarks`

**Saved Searches:**
- Vendor bill search filtered by vendor and items.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per vendor bill submit.

**Data Sources:**
- Vendor bill items and vendor price records.

**Data Retention:**
- Updates vendor price records.

### Technical Constraints
- Filters exclude certain PO types and item types.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Vendor price records must exist.

### Governance Considerations
- Search and submitFields usage per vendor bill.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Vendor price purchase rates match latest vendor bills.

**How we'll measure:**
- Compare updated vendor prices to the latest bill rates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_upd_vp_rate.js | User Event | Update vendor price from bills | Implemented |

### Development Approach

**Phase 1:** Find latest vendor bill
- [x] Search latest bill for vendor/items.

**Phase 2:** Update vendor price
- [x] Apply rate and remarks.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save latest vendor bill and verify vendor price purchase rate updates.

**Edge Cases:**
1. Bill is not latest; no vendor price update.
2. Vendor price record missing; no update occurs.

**Error Handling:**
1. Search or submitFields error is logged.

### Test Data Requirements
- Vendor bills with inventory items and vendor price records.

### Sandbox Setup
- None.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing users.

**Permissions required:**
- View and edit vendor price records
- View vendor bills

### Data Security
- No additional data exposure.

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

1. Upload `sna_hul_ue_upd_vp_rate.js`.
2. Deploy User Event on Vendor Bill.

### Post-Deployment

- [ ] Verify vendor price updates on latest bill.
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

- [ ] Should updates include list price or contract price fields?
- [ ] Should updates run for additional item types?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Latest bill selection per vendor/item is inaccurate | Low | Med | Refine search filters or use line-level logic |
| Vendor price missing prevents update | Med | Low | Create vendor price record if missing |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
