# PRD: Item Pricing Details

**PRD ID:** PRD-UNKNOWN-ItemPricingDetails
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_itempricingdetails.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that displays pricing-related line fields for a sales order line.

**What problem does it solve?**
Provides visibility into pricing details stored on the line without opening the full record.

**Primary Goal:**
Render a read-only form with pricing fields for a specific line.

---

## 2. Goals

1. Accept a line unique key and locate the sales order line.
2. Display item category, price level, markup, discounts, and cost fields.
3. Provide a quick view for users without editing.

---

## 3. User Stories

1. **As a** sales user, **I want to** view line pricing details **so that** I can confirm pricing setup.
2. **As a** support user, **I want to** see discount group and basis **so that** I can answer questions quickly.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `lineid` as a request parameter.
2. The Suitelet must search the Sales Order line by `lineuniquekey`.
3. The Suitelet must populate read-only fields with line-level pricing values.

### Acceptance Criteria

- [ ] Pricing fields display values for the specified line.
- [ ] Form is read-only and hides navigation.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update pricing fields.
- Validate line values beyond display.
- Display non-pricing fields.

---

## 6. Design Considerations

### User Interface
- Form titled "Other Details" with inline fields.

### User Experience
- Quick read-only detail view.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Display line pricing details
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order Line | custcol_sna_hul_itemcategory | Item category
- Sales Order Line | custcol_sna_hul_item_pricelevel | Item price level
- Sales Order Line | custcol_sna_hul_markup | Markup percent
- Sales Order Line | custcol_item_discount_grp | Discount group
- Sales Order Line | custcol_sna_hul_markupchange | Markup change
- Sales Order Line | custcol_sna_hul_loc_markup | Location markup
- Sales Order Line | custcol_sna_hul_loc_markupchange | Location markup change
- Sales Order Line | custcol_sna_hul_replacementcost | Replacement cost
- Sales Order Line | custcol_sna_hul_list_price | List price
- Sales Order Line | custcol_sna_hul_basis | Basis

**Saved Searches:**
- None (script builds search at runtime).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single line lookup per request.

**Data Sources:**
- Sales order line fields

**Data Retention:**
- No data changes.

### Technical Constraints
- Requires line unique key in request.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Line pricing fields on sales order

### Governance Considerations

- **Script governance:** One search per request.
- **Search governance:** Search filtered by line unique key.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Pricing fields display correctly for the selected line.

**How we'll measure:**
- Spot checks against the sales order line.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_itempricingdetails.js | Suitelet | Display pricing detail fields | Implemented |

### Development Approach

**Phase 1:** Validate search
- [ ] Confirm line unique key input

**Phase 2:** UI validation
- [ ] Compare displayed values to the line

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Line with pricing values displays all fields.

**Edge Cases:**
1. Missing `lineid` returns empty form.

**Error Handling:**
1. Invalid line key results in no values.

### Test Data Requirements
- Sales order line with pricing fields populated

### Sandbox Setup
- Deploy Suitelet and call with a line unique key

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales or pricing support roles

**Permissions required:**
- View access to sales orders

### Data Security
- Pricing data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Validate line fields exist

### Deployment Steps

1. Deploy Suitelet.
2. Provide access from line-level UI.

### Post-Deployment

- [ ] Validate read-only output

### Rollback Plan

**If deployment fails:**
1. Remove link/button to Suitelet.
2. Disable deployment.

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

- [ ] Should the Suitelet show calculated rate or margin fields?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing line fields leads to empty display | Low | Low | Ensure fields are deployed on line |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
