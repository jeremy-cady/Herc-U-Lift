# PRD: Consumable Lookups

**PRD ID:** PRD-UNKNOWN-ConsumableLookups
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_consumable_lookups.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that sources fields from NX Consumable records to Sales Order lines created or edited by NX.

**What problem does it solve?**
Populates Sales Order line and header fields with consumable metadata without manual entry.

**Primary Goal:**
Copy consumable attributes to Sales Order lines and related header fields when consumables are added.

---

## 2. Goals

1. Detect new Sales Order lines with consumable references.
2. Map consumable fields to Sales Order line fields.
3. Update header task and equipment fields when available.

---

## 3. User Stories

1. **As an** order processor, **I want to** auto-populate consumable details **so that** orders include correct vendor and service data.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeSubmit on Sales Order create/edit.
2. The script must identify unprocessed lines with `custcol_nx_consumable`.
3. The script must source mapped fields from `customrecord_nx_consumable` to line fields.
4. The script must set `custcol_sn_hul_nx_consum_src_done` to prevent reprocessing.
5. The script must update Sales Order header fields for task and equipment when provided.
6. The script must clear equipment asset values if the consumable asset does not match the native asset.

### Acceptance Criteria

- [ ] Consumable fields are copied to Sales Order lines for new consumables.
- [ ] Header task/equipment fields are updated when available.
- [ ] Lines are flagged as processed to prevent repeat updates.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update lines without a consumable reference.
- Override existing line values if no new data is provided.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Consumable fields appear automatically after save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_nx_consumable
- customrecord_nx_asset

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Consumable field sourcing
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder line | custcol_nx_consumable | Consumable reference
- salesorder line | custcol_sn_hul_nx_consum_src_done | Processing flag
- salesorder line | custcol_sna_work_code | Work code
- salesorder line | custcol_sna_repair_code | Repair code
- salesorder line | custcol_sna_group_code | Group code
- salesorder line | custcol_sna_hul_act_service_hours | Service hours
- salesorder line | custcol_nxc_equip_asset | Equipment asset
- salesorder line | custcol_sna_hul_nxc_retain_task_codes | Retain task codes
- salesorder line | custcol_sna_hul_item_vendor | Vendor
- salesorder line | custcol_sna_hul_vendor_item_code | Vendor item code
- salesorder line | custcol_sna_hul_vendor_name | Vendor name
- salesorder line | custcol_sna_hul_vendor_sub | Vendor subsidiary
- salesorder line | custcol_sna_hul_vendor_address1 | Vendor address 1
- salesorder line | custcol_sna_hul_vendor_address2 | Vendor address 2
- salesorder line | custcol_sna_hul_vendor_zipcode | Vendor zip
- salesorder line | custcol_sna_hul_vendor_phone_no | Vendor phone
- salesorder line | porate | PO rate
- salesorder line | description | Description
- salesorder | custbody_nx_task | Task
- salesorder | custbody_sna_hul_nxc_eq_asset | Equipment asset
- salesorder | custbody_sna_equipment_object | Asset object
- customrecord_nx_consumable | custrecord_sna_cons_eq_asset | Equipment asset
- customrecord_nx_consumable | custrecord_nx_constask | Task

**Saved Searches:**
- Searches on customrecord_nx_consumable to retrieve mapped fields.

### Integration Points
- Sales Order line processing when NX creates/edits orders.

### Data Requirements

**Data Volume:**
- One consumable lookup per new line.

**Data Sources:**
- Consumable records

**Data Retention:**
- Updates Sales Order lines and header fields.

### Technical Constraints
- Equipment asset values are cleared if consumable asset parent does not match native asset.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** NX consumable integration

### Governance Considerations

- **Script governance:** Moderate for orders with many lines.
- **Search governance:** One consumable search per batch of lines.
- **API limits:** Moderate based on line count.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Consumable fields are consistently populated on Sales Order lines.

**How we'll measure:**
- Compare line fields to consumable records after save.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_consumable_lookups.js | User Event | Source consumable fields | Implemented |

### Development Approach

**Phase 1:** Line detection
- [ ] Validate detection of unprocessed consumable lines

**Phase 2:** Field mapping
- [ ] Validate field mapping and header updates

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add consumable line and verify mapped fields are populated.

**Edge Cases:**
1. Consumable with mismatched asset parent clears equipment asset.
2. Line already processed does not update.

**Error Handling:**
1. Missing consumable values are handled without errors.

### Test Data Requirements
- Sales Order with consumable lines referencing customrecord_nx_consumable

### Sandbox Setup
- Deploy User Event on Sales Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Order processing roles

**Permissions required:**
- View customrecord_nx_consumable
- Edit Sales Orders

### Data Security
- Vendor data should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm consumable field mappings match record definitions

### Deployment Steps

1. Deploy User Event on Sales Order.
2. Validate consumable field sourcing.

### Post-Deployment

- [ ] Monitor logs for missing consumable data

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually source consumable fields if needed.

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

- [ ] Should lines be re-sourced if consumable data changes after save?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Field mapping drifts from consumable record design | Med | Med | Review mappings on schema changes |

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
