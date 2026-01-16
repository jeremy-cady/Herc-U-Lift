# PRD: Rental Configurator

**PRD ID:** PRD-UNKNOWN-RentalConfigurator
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_rentalconfigurator.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that manages rental object configuration and updates sales order lines and object status.

**What problem does it solve?**
Enables users to configure rental objects, select actual objects, and push configuration data back to sales orders.

**Primary Goal:**
Provide a configuration workflow for rental contracts tied to sales order lines.

---

## 2. Goals

1. Display rental contract IDs and configuration data for a sales order.
2. Allow selection of actual rental objects and configuration values.
3. Update object status and sales order line configuration JSON.

---

## 3. User Stories

1. **As a** rental coordinator, **I want to** configure rental objects **so that** orders reflect actual equipment.
2. **As an** admin, **I want to** enforce configuration completion **so that** only configured items are delivered.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must display sales order, rental contract ID, and object data.
2. The Suitelet must load configuration rules from object config rules and populate a configuration sublist.
3. The Suitelet must allow selecting actual objects, including filtering non-dummy objects by fleet number.
4. The Suitelet must write configuration JSON to sales order lines.
5. The Suitelet must update object status and rental status based on configuration completeness.
6. The Suitelet must update inventory assignment for new/used equipment items.

### Acceptance Criteria

- [ ] Configuration sublist displays requested and actual values.
- [ ] Object statuses update based on configured vs. unconfigured fields.
- [ ] Sales order line configuration fields are updated.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create new object records.
- Modify rental contract IDs.
- Validate configuration rules beyond existing rule records.

---

## 6. Design Considerations

### User Interface
- Form titled "Rental Configurator" with filters, actual object selection, and configuration sublist.

### User Experience
- Search and submit flow with confirmation message.

### Design References
- Client script `sna_hul_cs_rentalconfigurator.js`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_sna_objects
- customrecord_sna_object_config_rule

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Rental configuration UI
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- Sales Order Line | custcol_sna_hul_rent_contractidd | Rental contract ID
- Sales Order Line | custcol_sna_hul_object_configurator | Config JSON
- Sales Order Line | custcol_sna_hul_object_configurator_2 | Config JSON overflow
- Sales Order Line | custcol_sna_hul_fleet_no | Object
- Sales Order Line | custcol_sna_object | Object
- Sales Order Line | custcol_sna_hul_obj_model | Object model
- Sales Order Line | custcol_sna_hul_dummy | Dummy flag
- Sales Order Line | custcol_sna_hul_rental_config_comment | Comments
- Object | custrecord_sna_hul_rent_dummy | Dummy flag
- Object | custrecord_sna_equipment_model | Equipment model
- Object | custrecord_sna_status | Status
- Object | custrecord_sna_rental_status | Rental status

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Suitelet `sna_hul_sl_rentalconfigurator_select` for select lists.

### Data Requirements

**Data Volume:**
- Configuration data per contract line.

**Data Sources:**
- Sales order line configuration JSON
- Object configuration rules

**Data Retention:**
- Updates sales order lines and object records.

### Technical Constraints
- Configuration JSON split when over 4000 characters.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Rental contract configuration fields

### Governance Considerations

- **Script governance:** Record loads, searches, and saves.
- **Search governance:** Configuration rule lookups and line filters.
- **API limits:** Moderate for large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Configuration data is saved and object status is updated correctly.

**How we'll measure:**
- Validate sales order line fields and object statuses.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_rentalconfigurator.js | Suitelet | Configure rental objects | Implemented |

### Development Approach

**Phase 1:** Rule validation
- [ ] Confirm configuration rules and segments

**Phase 2:** Line updates
- [ ] Test configuration write-back and status updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Configured values update the SO line and object status.

**Edge Cases:**
1. Dummy object requires actual object selection.
2. Long configuration JSON splits into two fields.

**Error Handling:**
1. Missing contract ID results in no updates.

### Test Data Requirements
- Sales order with rental contract lines
- Dummy and non-dummy object records

### Sandbox Setup
- Deploy Suitelet and client script

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Rental operations roles

**Permissions required:**
- Edit access to sales orders and object records

### Data Security
- Configuration and status data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm status and item parameter IDs

### Deployment Steps

1. Deploy Suitelet.
2. Provide access from rental workflow.

### Post-Deployment

- [ ] Validate updates on sample orders

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Remove entry point from workflow.

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

- [ ] Should configuration enforce required fields before submit?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect status updates on object records | Med | Med | Validate status parameter IDs before use |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Suitelet
- N/record and N/search modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
