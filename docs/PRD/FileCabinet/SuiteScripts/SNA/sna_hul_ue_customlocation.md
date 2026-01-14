# PRD: Custom Location and PO Rate Defaults (User Event)

**PRD ID:** PRD-UNKNOWN-CustomLocation
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_customlocation.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that sets transaction and line locations from a custom location field and defaults PO rates on sales orders created from another transaction.

**What problem does it solve?**
Ensures locations are consistent and PO vendor rates are set based on primary vendor pricing when a sales order is created from another record.

**Primary Goal:**
Populate location fields and default PO rate values for sales order lines.

---

## 2. Goals

1. Copy `custbody_sna_hul_location` to the transaction location and line locations.
2. On sales order create with `createdfrom`, default line PO vendor and PO rate from vendor pricing.
3. Skip processing when run by Map/Reduce.

---

## 3. User Stories

1. **As a** sales user, **I want** locations defaulted **so that** I do not update each line manually.
2. **As a** purchasing user, **I want** PO rates filled from vendor pricing **so that** costs are accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must set `location` from `custbody_sna_hul_location` on before submit.
2. The system must set missing line locations to match the header location.
3. On sales order create with `createdfrom`, the system must default `povendor` and `custcol_sna_csi_povendor` from vendor pricing.
4. The system must calculate `porate` based on quantity break price, contract price, or item purchase price.
5. The system must skip before submit logic when executing in Map/Reduce context.

### Acceptance Criteria

- [ ] Header and line locations are set from custom location field.
- [ ] PO vendor and PO rate are populated on created sales orders.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Override existing line locations.
- Change rates for items without vendor pricing data.
- Run during Map/Reduce execution.

---

## 6. Design Considerations

### User Interface
- No UI changes; defaults set during record load and submit.

### User Experience
- Users see consistent location defaults and PO rates on created sales orders.

### Design References
- Custom field `custbody_sna_hul_location`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Item
- Vendor Price (`customrecord_sna_hul_vendorprice`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Location defaults and PO rate logic
- [ ] Client Script - Used for UI population (separate)

**Custom Fields:**
- Transaction | `custbody_sna_hul_location`
- Line | `custcol_sna_csi_povendor`
- Line | `custcol_sna_hul_estimated_po_rate`

**Saved Searches:**
- Item search joined to vendor price records.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Per-line processing on sales order create.

**Data Sources:**
- Item records and vendor price records.

**Data Retention:**
- Updates transaction and line fields only.

### Technical Constraints
- Sales order logic runs only when `createdfrom` is populated.
- Vendor price logic relies on joined custom record data.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Client script that populates location field.

### Governance Considerations
- Item search per create operation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Location fields and PO rates are populated as expected.

**How we'll measure:**
- Review sales order lines for correct location and PO rate defaults.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_customlocation.js | User Event | Location and PO rate defaults | Implemented |

### Development Approach

**Phase 1:** Location defaults
- [x] Set header and line locations.

**Phase 2:** PO rate defaults
- [x] Populate PO vendor and PO rate on create.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create sales order from another record; verify line locations and PO rates.

**Edge Cases:**
1. No `createdfrom` value; PO rate logic should not run.
2. Vendor pricing missing; rate remains unchanged.

**Error Handling:**
1. Search errors are logged without blocking save.

### Test Data Requirements
- Items with vendor pricing and quantity break pricing.

### Sandbox Setup
- Ensure custom location field is present and populated.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and purchasing users.

**Permissions required:**
- Edit sales orders
- View item and vendor price data

### Data Security
- No additional sensitive data exposure.

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

1. Upload `sna_hul_ue_customlocation.js`.
2. Deploy User Event on Sales Order.

### Post-Deployment

- [ ] Verify location and PO rate defaults.
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

- [ ] Should PO rate logic run on edits when quantities change?
- [ ] Should vendor price selection prioritize different fields?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Quantity break JSON is invalid | Med | Med | Validate JSON before parsing |
| Large orders increase load time | Low | Med | Optimize search and line processing |

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
