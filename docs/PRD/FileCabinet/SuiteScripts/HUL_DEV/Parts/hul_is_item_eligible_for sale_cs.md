# PRD: Validate Item Eligibility for Sale (Client Script)

**PRD ID:** PRD-UNKNOWN-ItemEligibleForSaleCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_is_item_eligible_for sale_cs.js (Client Script)
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.js (Library)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that validates inventory items on line entry and blocks non‑eligible items, showing a SweetAlert warning with an alternate part suggestion.

**What problem does it solve?**
Prevents sales of parts that are marked as not eligible and guides users to an alternate part when available.

**Primary Goal:**
Block non‑eligible inventory items at line validation with a clear warning and suggested replacement.

---

## 2. Goals

1. Preload SweetAlert for warnings.
2. Validate item eligibility on line entry.
3. Suggest an alternate part when available.

---

## 3. User Stories

1. **As a** parts user, **I want** ineligible items blocked **so that** I don’t sell the wrong part.
2. **As an** admin, **I want** alternate part suggestions **so that** users can correct quickly.
3. **As a** support user, **I want** a clear warning **so that** I understand why the line is blocked.

---

## 4. Functional Requirements

### Core Functionality

1. The system must preload SweetAlert on `pageInit`.
2. On `validateLine` for the `item` sublist, the system must:
   - Read the current `item` value.
   - Query item type via SuiteQL.
3. If the item type is `InvtPart`, the system must:
   - Query `custitem_hul_eligible_for_sale` and `custitem_hul_alt_part`.
   - If eligibility is false, fetch the alternate part item ID and itemid.
4. When eligibility is false, the system must:
   - Show `sweetAlert.partsIsEligibleSwalMessage(altPartName)`.
   - Return `false` to block the line.
5. When eligibility is true or errors occur, the system must allow the line.

### Acceptance Criteria

- [ ] Ineligible inventory items are blocked on line validation.
- [ ] SweetAlert warning displays with alternate part name when available.
- [ ] Eligible items pass validation.
- [ ] Errors do not block line entry.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate non‑inventory item types.
- Update item records.
- Enforce server‑side validation.

---

## 6. Design Considerations

### User Interface
- SweetAlert warning modal during line validation.

### User Experience
- Immediate feedback during line entry with alternate part guidance.

### Design References
- SweetAlert2 warning modal.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line validation

**Custom Fields:**
- Item | `custitem_hul_eligible_for_sale`
- Item | `custitem_hul_alt_part`

**Saved Searches:**
- None (SuiteQL used).

### Integration Points
- Uses `hul_swal` for modal display.

### Data Requirements

**Data Volume:**
- Per line validation.

**Data Sources:**
- Item record via SuiteQL.

**Data Retention:**
- None.

### Technical Constraints
- Uses SuiteQL client-side; assumes permission to query item data.
- Only checks item type `InvtPart`.

### Dependencies
- **Libraries needed:** `SuiteScripts/HUL_DEV/Global/hul_swal`.
- **External dependencies:** None.
- **Other features:** Item eligibility fields must be populated.

### Governance Considerations
- Multiple SuiteQL calls per line validation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Ineligible inventory items are prevented from being added.

**How we'll measure:**
- Reduced errors and user reports.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_is_item_eligible_for sale_cs.js | Client Script | Block ineligible items on line entry | Implemented |

### Development Approach

**Phase 1:** Item checks
- [x] Identify item type via SuiteQL
- [x] Check eligibility and alternate part

**Phase 2:** User feedback
- [x] Show SweetAlert warning and block line

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add eligible inventory item; line saves.
2. Add ineligible inventory item with alternate part; warning displays and line blocked.

**Edge Cases:**
1. Non-inventory item added; validation does nothing.
2. Alternate part missing; warning still displays.

**Error Handling:**
1. SuiteQL error still allows line to proceed.

### Test Data Requirements
- Items with eligibility flag and alternate part configured.

### Sandbox Setup
- Ensure item fields `custitem_hul_eligible_for_sale` and `custitem_hul_alt_part` exist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users adding items to transactions.

**Permissions required:**
- Item record access and SuiteQL permissions.

### Data Security
- Client-side validation only; not a security control.

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

1. Upload `hul_is_item_eligible_for sale_cs.js`.
2. Deploy as a client script on transaction forms with item sublist.
3. Verify SweetAlert library access.

### Post-Deployment

- [ ] Confirm ineligible items are blocked.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the client script deployment.

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

- [ ] Should eligibility checks move server-side?
- [ ] Should alternate part be required when ineligible?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Client-side SuiteQL latency | Med | Med | Cache or reduce queries |
| Missing alternate part | Low | Low | Show generic warning |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/hul_swal.md

### NetSuite Documentation
- SuiteScript 2.x Client Script
- SuiteQL documentation

### External Resources
- SweetAlert2 documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
