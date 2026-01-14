# PRD: Rental Configurator Client Script

**PRD ID:** PRD-UNKNOWN-RentalConfigurator
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_rentalconfigurator.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the Rental Configurator Suitelet that validates selections and updates the Suitelet based on contract, object, and fleet inputs.

**What problem does it solve?**
It ensures rental configuration data is valid and synchronized with the selected Sales Order, contract, and object details.

**Primary Goal:**
Validate rental configuration inputs and manage Suitelet navigation for rental object configuration.

---

## 2. Goals

1. Validate that a valid rental object is selected.
2. Ensure configuration lines match the selected contract and object.
3. Refresh Suitelet data when contract, SO, or fleet number changes.

---

## 3. User Stories

1. **As a** user, **I want** rental configuration validated **so that** I do not save inconsistent data.

---

## 4. Functional Requirements

### Core Functionality

1. On save, the script must validate that an actual rental object is provided and not a dummy object.
2. The script must require at least one configuration line in `custpage_configsublist`.
3. The script must validate that configuration line object and contract values match the header selections.
4. When `custpage_contractid` changes, the script must fetch object data from a Suitelet endpoint and update object and comments fields.
5. When `custpage_soid` changes, the script must fetch available contract IDs and update the contract field options.
6. When `custpage_fleetnofld` changes, the script must reload the Suitelet with updated fleet filters.
7. The script must validate sublist field value formats for date, checkbox, and numeric types.

### Acceptance Criteria

- [ ] Invalid or dummy rental objects are blocked.
- [ ] Configuration lines are required and must match selected contract and object.
- [ ] Suitelet refreshes when SO, contract, or fleet number changes.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create rental objects or contracts.
- Persist configuration changes outside the Suitelet process.

---

## 6. Design Considerations

### User Interface
- Uses alerts for validation errors.
- Reloads Suitelet when filters change.

### User Experience
- Users must click Search when requested to refresh line data.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Rental configurator Suitelet
- Sales Order
- Rental contract records (custom record type not specified)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Rental configurator UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Configurator validation

**Custom Fields:**
- Suitelet | `custpage_soid`
- Suitelet | `custpage_contractid`
- Suitelet | `custpage_objid`
- Suitelet | `custpage_actualobjfld`
- Suitelet | `custpage_configcommentsfld`
- Suitelet | `custpage_fleetnofld`
- Suitelet | `custpage_configsublist`
- Suitelet | `custpage_actualsubfld`
- Suitelet | `custpage_tempactualsubfld`
- Suitelet | `custpage_fieldtypesubfld`
- Suitelet | `custpage_actualobjsubfld`
- Suitelet | `custpage_rentalidsubfld`

**Saved Searches:**
- None.

### Integration Points
- External Suitelet URL from parameters `custscript_sn_so_externalurl` and `custscript_sn_rental_externalurl`.

### Data Requirements

**Data Volume:**
- Suitelet refreshes and configuration line validation.

**Data Sources:**
- Suitelet fields and external Suitelet responses.

**Data Retention:**
- Suitelet updates only.

### Technical Constraints
- Uses HTTP GET to Suitelet endpoints for object and contract data.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/search, N/record, N/https, N/runtime, N/xml.
- **External dependencies:** None.
- **Other features:** Rental configurator Suitelet endpoints.

### Governance Considerations
- Client-side HTTP calls and sublist validation.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Rental configuration saves only when object and contract data are consistent.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_rentalconfigurator.js | Client Script | Validate and refresh rental configurator | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Validation of object and contract selection.
- **Phase 2:** Suitelet refresh and sublist field validation.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select contract and object, configure lines, and save.

**Edge Cases:**
1. Dummy object selected; save blocked.
2. Configuration line mismatch; save blocked.
3. Invalid date value in configuration sublist.

**Error Handling:**
1. External Suitelet response empty or invalid.

### Test Data Requirements
- Rental contract and object records available to the Suitelet.

### Sandbox Setup
- Deploy client script to the rental configurator Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users configuring rentals.

**Permissions required:**
- Access to Suitelets and related records.

### Data Security
- Uses internal Suitelet endpoints only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet URLs and parameters are configured.

### Deployment Steps
1. Upload `sna_hul_cs_rentalconfigurator.js`.
2. Deploy to the rental configurator Suitelet.

### Post-Deployment
- Validate contract and object lookups.

### Rollback Plan
- Remove client script deployment from the Suitelet.

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
- [ ] Should the dummy object check be enforced server-side?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| External URL parameter misconfiguration | Med | Med | Validate script parameters |

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
