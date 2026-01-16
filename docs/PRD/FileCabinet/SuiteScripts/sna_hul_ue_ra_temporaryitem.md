# PRD: RA Temporary Item Handling

**PRD ID:** PRD-UNKNOWN-RATemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_ra_temporaryitem.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that validates temporary item return authorizations, enforces return handling, and updates Sales Order returned quantities.

**What problem does it solve?**
Ensures temporary item returns include required handling and updates related Sales Orders with returned quantities.

**Primary Goal:**
Validate temporary item RA lines and update returned quantities on Sales Orders.

---

## 2. Goals

1. Filter RA lines to only return items when creating the RA.
2. Enforce returns handling for temporary items.
3. Update Sales Order line returned quantities when RA is completed.

---

## 3. User Stories

1. **As a** returns user, **I want to** enforce handling for temp item returns **so that** returns are processed correctly.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeLoad create, the script must remove non-return lines without temp codes.
2. On beforeSubmit, the script must require `custcol_sna_hul_returns_handling` for temp item categories.
3. The script must validate inventory detail numbers match temp item codes.
4. On afterSubmit when RA status changes to H, the script must update Sales Order `custcol_sna_qty_returned` by line.

### Acceptance Criteria

- [ ] Non-return temp lines are removed on RA create.
- [ ] RA save is blocked if handling is missing for temp items.
- [ ] Sales Order returned quantities update on RA completion.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update inventory numbers.
- Modify RA lines after status H.

---

## 6. Design Considerations

### User Interface
- Replaces default Close button with a suitelet-driven Close button.

### User Experience
- Temp item returns require handling details and update SO quantities automatically.

### Design References
- Suitelet: `customscript_sna_hul_sl_closebutton`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- returnauthorization
- salesorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Close button
- [ ] RESTlet - N/A
- [x] User Event - RA validation and SO update
- [ ] Client Script - N/A

**Custom Fields:**
- returnauthorization line | custcol_sna_hul_temp_item_code | Temp item code
- returnauthorization line | custcol_sna_hul_itemcategory | Item category
- returnauthorization line | custcol_sna_hul_returns_handling | Returns handling
- returnauthorization line | custcol_sna_return_item | Return item flag
- salesorder line | custcol_sna_qty_returned | Returned quantity

**Saved Searches:**
- Search on RA lines to update SO returned quantities.

### Integration Points
- Uses close button suitelet for RA close.

### Data Requirements

**Data Volume:**
- One SO update per RA completion.

**Data Sources:**
- RA lines and Sales Order lines.

**Data Retention:**
- Updates Sales Order returned quantity fields.

### Technical Constraints
- Handling required only for temp item categories.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Suitelet for close button
- **Other features:** Temp item category parameters

### Governance Considerations

- **Script governance:** Multiple searches and record loads on completion.
- **Search governance:** Search on RA lines when status changes to H.
- **API limits:** Moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temp item RA lines enforce handling and SO returned quantities update correctly.

**How we'll measure:**
- Validate SO returned quantities after RA completion.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_ra_temporaryitem.js | User Event | Validate temp item RA and update SO | Implemented |

### Development Approach

**Phase 1:** Line filtering and validation
- [ ] Validate removal and handling checks

**Phase 2:** SO updates
- [ ] Validate returned quantity updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create RA with temp item and handling, then close and update SO returned qty.

**Edge Cases:**
1. Missing handling blocks save for temp items.

**Error Handling:**
1. Search errors are logged.

### Test Data Requirements
- RA created from SO with temp item lines

### Sandbox Setup
- Deploy User Event on Return Authorization.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Returns and sales roles

**Permissions required:**
- Edit Return Authorizations
- Edit Sales Orders

### Data Security
- Return data restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm temp item category parameters

### Deployment Steps

1. Deploy User Event on Return Authorization.
2. Validate return handling and SO updates.

### Post-Deployment

- [ ] Monitor logs for validation errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Update SO returned quantities manually.

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

- [ ] Should handling be required for non-temp categories?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| RA close flow bypasses validation | Low | Med | Validate suitelet close flow |

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
