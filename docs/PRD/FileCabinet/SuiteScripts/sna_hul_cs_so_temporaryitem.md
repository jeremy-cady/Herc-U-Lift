# PRD: Sales Order Temporary Item Validation Client Script

**PRD ID:** PRD-UNKNOWN-SOTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_so_temporaryitem.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that validates required fields for temporary item lines on Sales Orders.

**What problem does it solve?**
It enforces required vendor and pricing information for temporary items to prevent incomplete line entries.

**Primary Goal:**
Block line commit or save when temporary item fields are missing.

---

## 2. Goals

1. Require vendor or vendor name for temporary items.
2. Require vendor item code, description, quantity, PO rate, and rate.
3. Validate both line commit and record save.

---

## 3. User Stories

1. **As a** sales user, **I want** temporary item lines validated **so that** required data is complete.

---

## 4. Functional Requirements

### Core Functionality

1. On line validation, if the item category is the temp item category, the script must ensure required fields are populated.
2. Required fields include:
   - `custcol_sna_hul_item_vendor` or `custcol_sna_hul_vendor_name`
   - `custcol_sna_hul_vendor_item_code`
   - `description`
   - `quantity`
   - `porate`
   - `rate`
3. On save, the script must validate all temp item lines with the same rules.

### Acceptance Criteria

- [ ] Temp item lines cannot be committed or saved with missing required fields.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create vendor records.
- Validate non-temp item lines.

---

## 6. Design Considerations

### User Interface
- Uses alerts for missing field warnings.

### User Experience
- Users see clear messages listing missing fields.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Temp item validation

**Custom Fields:**
- Line | `custcol_sna_hul_itemcategory`
- Line | `custcol_sna_hul_item_vendor`
- Line | `custcol_sna_hul_vendor_item_code`
- Line | `custcol_sna_hul_vendor_name`
- Line | `description`
- Line | `quantity`
- Line | `porate`
- Line | `rate`

**Saved Searches:**
- None.

### Integration Points
- Uses script parameter `custscript_sna_hul_tempitemcat`.

### Data Requirements

**Data Volume:**
- Validation per line and on save.

**Data Sources:**
- Sales Order line fields.

**Data Retention:**
- No data persisted.

### Technical Constraints
- Temp category ID is provided via script parameter.

### Dependencies
- **Libraries needed:** N/runtime.
- **External dependencies:** None.
- **Other features:** Temp item category configuration.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temporary item lines are blocked when required fields are missing.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_so_temporaryitem.js | Client Script | Validate temporary item fields on SO lines | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Line validation.
- **Phase 2:** Save validation across all lines.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Temp item line with all required fields saves successfully.

**Edge Cases:**
1. Temp vendor missing and vendor name empty; alert shown.
2. Missing PO rate or rate; line blocked.

**Error Handling:**
1. Missing temp category parameter should skip validation.

### Test Data Requirements
- Temp item category configuration and sample temp items.

### Sandbox Setup
- Deploy client script to Sales Order form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit Sales Orders.

### Data Security
- Uses line data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm temp item category parameter.

### Deployment Steps
1. Upload `sna_hul_cs_so_temporaryitem.js`.
2. Deploy to Sales Order form.

### Post-Deployment
- Validate temp item line entry.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should a missing vendor name trigger auto-creation rules?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Users bypass validation by changing category after entry | Low | Med | Revalidate on save |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
