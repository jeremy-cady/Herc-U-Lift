# PRD: Item Price Level Validation

**PRD ID:** PRD-UNKNOWN-ItemPriceLevel
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_itempricelevel.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that enforces uniqueness and UI rules for Item Price Level records, and adjusts min/max cost ranges for List pricing.

**What problem does it solve?**
Prevents duplicate item category/pricing group combinations and maintains consistent min/max cost ranges for List pricing.

**Primary Goal:**
Validate Item Price Level records and maintain proper min/max cost boundaries.

---

## 2. Goals

1. Enforce unique Item Category + Customer Pricing Group combinations (except List).
2. Control min/max cost field behavior based on pricing group.
3. Update max cost boundaries for List pricing records.

---

## 3. User Stories

1. **As an** admin, **I want to** prevent duplicate price level records **so that** pricing data stays consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeLoad, the script must enable/disable min/max cost fields based on pricing group.
2. For pricing group List (ID 155), the script must set min cost and adjust max cost behavior based on record order.
3. On beforeSubmit, the script must block duplicates for non-List pricing groups.
4. On afterSubmit, the script must update max cost of prior List records and ensure current max cost equals next record min cost.

### Acceptance Criteria

- [ ] Duplicate Item Category + Pricing Group combinations are blocked.
- [ ] Min/max cost fields are set/disabled correctly in the UI.
- [ ] Max cost ranges adjust correctly for List pricing records.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate pricing amounts beyond min/max boundaries.
- Enforce uniqueness for List pricing groups.

---

## 6. Design Considerations

### User Interface
- Adjusts display type and required status of min/max cost fields.

### User Experience
- Users see correct field behavior based on pricing group.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_hul_itempricelevel

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Validation and field behavior
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_itemcategory | Item category
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_customerpricinggroup | Pricing group
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_mincost | Min unit cost
- customrecord_sna_hul_itempricelevel | custrecord_sna_hul_maxcost | Max unit cost

**Saved Searches:**
- Searches on Item Price Level records to enforce uniqueness and sequencing.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per submit; additional search to update max cost.

**Data Sources:**
- Item Price Level records.

**Data Retention:**
- Updates max cost fields on related records.

### Technical Constraints
- Pricing group List is hard-coded as internal ID 155.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** None

### Governance Considerations

- **Script governance:** Multiple searches and submitFields per save.
- **Search governance:** Moderate for large price level lists.
- **API limits:** Low to moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item price levels remain unique and min/max ranges are consistent.

**How we'll measure:**
- Review price level records for correct ranges after updates.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_itempricelevel.js | User Event | Price level validation and range updates | Implemented |

### Development Approach

**Phase 1:** UI behavior
- [ ] Validate min/max field behavior

**Phase 2:** Range updates
- [ ] Validate max cost updates for List pricing

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create List pricing records and verify max cost updates.

**Edge Cases:**
1. Duplicate record for non-List pricing is blocked.

**Error Handling:**
1. Search errors are logged.

### Test Data Requirements
- Item price level records with multiple List entries

### Sandbox Setup
- Deploy User Event on Item Price Level custom record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Pricing admins

**Permissions required:**
- Edit Item Price Level records

### Data Security
- Pricing data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm List pricing group internal ID (155)

### Deployment Steps

1. Deploy User Event on Item Price Level custom record.
2. Validate UI and range updates.

### Post-Deployment

- [ ] Monitor logs for duplicate errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update ranges manually if needed.

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

- [ ] Should the List pricing group ID be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect ordering affects max cost ranges | Low | Med | Review record ordering and ranges periodically |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
