# PRD: Item Price Level Validation Client Script

**PRD ID:** PRD-UNKNOWN-ItemPriceLevel
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_itempricelevel.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that enforces item category and customer pricing group rules on Item Price Level records.

**What problem does it solve?**
It ensures unique category-pricing group combinations and manages min/max cost field behavior based on pricing group rules.

**Primary Goal:**
Prevent duplicate pricing combinations and enforce min/max cost rules for pricing group List.

---

## 2. Goals

1. Enforce unique item category and pricing group combinations.
2. Control min and max cost fields based on pricing group type.
3. Prevent changing key fields when it would break pricing sequences.

---

## 3. User Stories

1. **As an** admin, **I want** item pricing records to be unique **so that** pricing rules stay consistent.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the script must store the current item category and pricing group values.
2. When item category or pricing group changes, the script must toggle min and max cost field states based on pricing group ID 155 (List).
3. For pricing group ID 155, the first combination must set min cost to 0 and disable editing; max cost is disabled when only one record exists.
4. When pricing group is not 155, the script must disable min and max cost and clear values.
5. On save, the script must block duplicate item category and pricing group combinations (except pricing group 155).
6. On save, the script must block changes that alter pricing group or item category in a way that breaks the max cost sequence for pricing group 155.

### Acceptance Criteria

- [ ] Duplicate item category and pricing group combinations are blocked.
- [ ] Min and max cost fields behave according to pricing group rules.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Automatically reorder or recalculate cost sequences.
- Validate pricing group IDs other than 155.

---

## 6. Design Considerations

### User Interface
- Min and max cost fields enable/disable dynamically.

### User Experience
- Users are alerted when attempting invalid changes.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Price Level (custom record)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Item pricing validation

**Custom Fields:**
- `custrecord_sna_hul_itemcategory`
- `custrecord_sna_hul_customerpricinggroup`
- `custrecord_sna_hul_mincost`
- `custrecord_sna_hul_maxcost`

**Saved Searches:**
- None (scripted search only).

### Integration Points
- Uses search queries to enforce uniqueness.

### Data Requirements

**Data Volume:**
- One search on field change and save.

**Data Sources:**
- Item price level records and search results.

**Data Retention:**
- No data persisted beyond record updates.

### Technical Constraints
- Pricing group ID 155 is hard-coded.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Item price level custom record.

### Governance Considerations
- Client-side searches for duplicate checks.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Item price level records follow uniqueness and min/max cost rules.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_itempricelevel.js | Client Script | Validate item price level rules | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Field behavior and defaults.
- **Phase 2:** Save-time uniqueness validation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a pricing group 155 record for a category; min cost set to 0.
2. Create a non-155 record and verify min/max are disabled.

**Edge Cases:**
1. Attempt duplicate non-155 combination; save blocked.
2. Attempt to change pricing group or item category that affects sequence; save blocked.

**Error Handling:**
1. Search failures should not allow duplicates.

### Test Data Requirements
- Existing item price level records for a category.

### Sandbox Setup
- Deploy client script to item price level record.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Pricing administrators.

**Permissions required:**
- Create and edit item price level records.

### Data Security
- Uses internal pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm pricing group ID 155 is correct.

### Deployment Steps
1. Upload `sna_hul_cs_itempricelevel.js`.
2. Deploy to item price level record forms.

### Post-Deployment
- Verify field behavior and duplicate checks.

### Rollback Plan
- Remove the client script deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| PRD Approval | | | |
| Development Complete | | | |
| Production Deploy | | | |

---

## 14. Open Questions & Risks

### Open Questions
- [ ] Should the pricing group ID be parameterized instead of hard-coded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Pricing group ID changes | Low | Med | Externalize ID to script parameter |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
