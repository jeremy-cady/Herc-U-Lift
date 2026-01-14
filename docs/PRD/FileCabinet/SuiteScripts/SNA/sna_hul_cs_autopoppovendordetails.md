# PRD: Auto-Populate PO Vendor Details (Client Script)

**PRD ID:** PRD-UNKNOWN-AutoPopPOVendor
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_autopoppovendordetails.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that automatically populates PO vendor and PO rate fields on item lines based on primary vendor configuration.

**What problem does it solve?**
Reduces manual data entry by pulling vendor and purchase price information when items are selected.

**Primary Goal:**
Auto-fill PO vendor and rate on item lines when item or vendor changes.

---

## 2. Goals

1. Look up the primary vendor for the selected item.
2. Populate `povendor`, `custcol_sna_csi_povendor`, and `porate` on the line.
3. Keep vendor fields in sync when `povendor` changes.

---

## 3. User Stories

1. **As a** buyer, **I want** PO vendor details auto-filled **so that** I can save time.
2. **As an** admin, **I want** consistent vendor data **so that** PO lines are accurate.
3. **As a** developer, **I want** a simple client helper **so that** pricing rules are enforced at entry.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `fieldChanged` for item sublist fields.
2. When `item` changes, the system must search the item vendor custom record for the primary vendor.
3. If a primary vendor is found, the system must set:
   - `povendor`
   - `custcol_sna_csi_povendor`
   - `porate` from `custrecord_sna_hul_itempurchaseprice`
4. When `povendor` changes, the system must sync `custcol_sna_csi_povendor` to the same value.

### Acceptance Criteria

- [ ] Selecting an item with a primary vendor auto-populates PO vendor fields.
- [ ] PO rate is set from the item purchase price.
- [ ] Changing `povendor` updates `custcol_sna_csi_povendor`.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate vendor eligibility beyond primary vendor flags.
- Update non-item sublists.
- Handle server-side pricing logic.

---

## 6. Design Considerations

### User Interface
- Client-side updates to item line fields.

### User Experience
- Vendor fields populate automatically to reduce manual entry.

### Design References
- Custom record `custrecord_sna_hul_item` linking items to vendors.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item
- Custom Item Vendor record (`CUSTRECORD_SNA_HUL_ITEM`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Item line field handling

**Custom Fields:**
- Line | `povendor`
- Line | `custcol_sna_csi_povendor`
- Custom Item Vendor | `custrecord_sna_hul_vendor`
- Custom Item Vendor | `custrecord_sna_hul_itempurchaseprice`
- Custom Item Vendor | `custrecord_sna_hul_primaryvendor`

**Saved Searches:**
- None (search created dynamically).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One search per item selection.

**Data Sources:**
- Item vendor custom record values.

**Data Retention:**
- Updates only current line fields.

### Technical Constraints
- Uses `search.create.promise` for async item vendor lookup.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Item vendor records must be maintained.

### Governance Considerations
- Client-side search per item change; use sparingly on large transactions.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO vendor and rate fields auto-populate correctly on item lines.

**How we'll measure:**
- Manual verification on sales order entry.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_autopoppovendordetails.js | Client Script | Auto-populate PO vendor details | Implemented |

### Development Approach

**Phase 1:** Item vendor lookup
- [x] Search primary vendor by item.

**Phase 2:** Field population
- [x] Set vendor and rate fields on the line.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an item with a primary vendor; fields populate.

**Edge Cases:**
1. Item has no primary vendor record; no fields set.

**Error Handling:**
1. Search promise rejects; log error in console.

### Test Data Requirements
- Items with and without primary vendor records.

### Sandbox Setup
- Client script deployed on transaction forms with item sublist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users entering transactions.

**Permissions required:**
- View access to item vendor custom records.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_cs_autopoppovendordetails.js`.
2. Deploy to transaction forms.
3. Validate vendor auto-population.

### Post-Deployment

- [ ] Verify vendor and rate defaults on item lines.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from forms.

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

- [ ] Should PO rate consider contract pricing or quantity breaks?
- [ ] Should the script run on `postSourcing` as well as `fieldChanged`?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing vendor records cause no defaults | Med | Low | Validate item vendor data |
| Client-side search impacts performance | Low | Med | Cache results per item |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
