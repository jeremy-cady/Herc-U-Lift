# PRD: Rental Configurator SO Helper

**PRD ID:** PRD-UNKNOWN-RentalConfiguratorSo
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator_so.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet helper that returns rental contract IDs or dummy object info for sales order lines.

**What problem does it solve?**
Provides JSON lookups for the rental configurator UI based on changes in sales order or contract selection.

**Primary Goal:**
Return contract IDs or object dummy info for rental configurator logic.

---

## 2. Goals

1. Return rental contract IDs for a sales order.
2. Return object and dummy flags for a rental contract.
3. Check dummy status for a specific object.

---

## 3. User Stories

1. **As a** rental user, **I want to** load contract IDs **so that** I can select the correct rental line.
2. **As a** rental user, **I want to** check dummy status **so that** I can select actual objects when required.

---

## 4. Functional Requirements

### Core Functionality

1. When `changed=so`, the Suitelet must return rental contract IDs for the given sales order.
2. When `changed=rentalcontractid`, the Suitelet must return object ID, dummy flag, and comments for the contract line.
3. When `changed=checkdummy`, the Suitelet must return dummy status for an object.
4. Responses must be JSON.

### Acceptance Criteria

- [ ] Contract ID list returns when a sales order ID is provided.
- [ ] Dummy and object values return for a rental contract ID.
- [ ] Dummy check returns boolean value for object.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update sales order or object records.
- Validate rental contract formats.
- Provide any UI rendering.

---

## 6. Design Considerations

### User Interface
- No UI; JSON responses only.

### User Experience
- Background helper for configurator UI.

### Design References
- Rental configurator suitelet.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - JSON helper service
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order Line | custcol_sna_hul_rent_contractidd | Rental contract ID
- Sales Order Line | custcol_sna_hul_fleet_no | Object
- Sales Order Line | custcol_sna_hul_dummy | Dummy flag
- Sales Order Line | custcol_sna_hul_rental_config_comment | Comments
- Object | custrecord_sna_hul_rent_dummy | Dummy flag

**Saved Searches:**
- None.

### Integration Points
- Rental configurator UI uses this Suitelet.

### Data Requirements

**Data Volume:**
- Single lookup per request.

**Data Sources:**
- Sales order line fields
- Object records

**Data Retention:**
- No data changes.

### Technical Constraints
- Customer lookup is by sales order and contract IDs.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental configurator UI

### Governance Considerations

- **Script governance:** Search and lookup operations.
- **Search governance:** Searches by contract and internal IDs.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- JSON responses populate configurator fields correctly.

**How we'll measure:**
- Verify contract IDs and dummy flags in UI.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_rentalconfigurator_so.js | Suitelet | Helper lookups for configurator | Implemented |

### Development Approach

**Phase 1:** Lookup validation
- [ ] Confirm contract and dummy lookups

**Phase 2:** UI integration
- [ ] Test client-side consumption

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. SO change returns contract IDs.
2. Contract change returns object and dummy info.

**Edge Cases:**
1. Missing contract returns empty JSON.

**Error Handling:**
1. Invalid object ID returns dummy false.

### Test Data Requirements
- Sales order with rental contract lines

### Sandbox Setup
- Deploy Suitelet and update UI endpoints

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental operations roles

**Permissions required:**
- View access to sales orders and object records

### Data Security
- Data limited to rental configuration fields.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm endpoint URL used by UI

### Deployment Steps

1. Deploy Suitelet.
2. Update client script to call it.

### Post-Deployment

- [ ] Validate JSON responses

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Restore previous lookup logic.

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

- [ ] Should contract IDs be sorted or filtered by status?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Contract ID changes cause mismatch in UI | Low | Low | Use internal IDs where possible |

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
