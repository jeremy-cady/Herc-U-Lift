# PRD: Online Case Form Data

**PRD ID:** PRD-UNKNOWN-OnlineCaseForm
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_sl_onlinecaseform.js (Suitelet)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Suitelet that returns object or customer data as JSON for an online case form.

**What problem does it solve?**
Provides lookup data for case forms based on asset or customer input.

**Primary Goal:**
Return object or customer field values in JSON for client-side consumption.

---

## 2. Goals

1. Return object values when an asset reference is provided.
2. Return customer values when a customer identifier is provided.
3. Keep responses lightweight and JSON formatted.

---

## 3. User Stories

1. **As a** case form user, **I want to** auto-fill object data **so that** I can submit cases faster.
2. **As a** support user, **I want to** look up customer billing details **so that** contact info is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The Suitelet must accept `assetobj` and/or `cust` request parameters.
2. When `assetobj` is provided, the Suitelet must lookup `customrecord_nx_asset` to find the related object ID.
3. The Suitelet must return object fields from `customrecord_sna_objects`.
4. When `cust` is provided, the Suitelet must lookup customer data by `entityid`.
5. The Suitelet must return JSON responses for object or customer requests.

### Acceptance Criteria

- [ ] JSON response includes object fields when `assetobj` is passed.
- [ ] JSON response includes customer billing fields when `cust` is passed.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update object or customer records.
- Validate asset or customer input beyond lookup.
- Support POST requests or UI rendering.

---

## 6. Design Considerations

### User Interface
- No UI; JSON response only.

### User Experience
- Fast lookups for online forms.

### Design References
- Online case form integration.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_nx_asset
- customrecord_sna_objects
- customer

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - JSON lookup service
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_nx_asset | custrecord_sna_hul_nxcassetobject | Related object
- customrecord_sna_objects | custrecord_sna_fleet_code | Fleet code
- customrecord_sna_objects | custrecord_sna_serial_no | Serial number
- customrecord_sna_objects | custrecord_sna_man_code | Manufacturer code
- customrecord_sna_objects | custrecord_sna_equipment_model | Equipment model
- customrecord_sna_objects | custrecord_sna_frame_no | Frame no
- customrecord_sna_objects | custrecord_sna_power_new | Power
- customrecord_sna_objects | custrecord_sna_capacity_new | Capacity
- customrecord_sna_objects | custrecord_sna_tires_new | Tires
- customrecord_sna_objects | custrecord_sna_work_height | Work height
- customrecord_sna_objects | custrecord_sna_warranty_type | Warranty type
- Customer | billaddress1 | Billing address line 1
- Customer | billaddress2 | Billing address line 2
- Customer | billcity | Billing city
- Customer | billzipcode | Billing zip
- Customer | statedisplayname | Billing state
- Customer | companyname | Company name
- Customer | email | Email

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Online case form client-side usage.

### Data Requirements

**Data Volume:**
- Single lookup per request.

**Data Sources:**
- Asset and object records
- Customer records

**Data Retention:**
- No data changes.

### Technical Constraints
- Customer lookup uses `entityid` rather than internal ID.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Online case form UI

### Governance Considerations

- **Script governance:** Two lookups at most per request.
- **Search governance:** Minimal search usage.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- JSON responses populate case form fields correctly.

**How we'll measure:**
- Validate case form auto-fill results.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_sl_onlinecaseform.js | Suitelet | Provide object/customer JSON data | Implemented |

### Development Approach

**Phase 1:** Lookup validation
- [ ] Confirm asset-to-object reference field

**Phase 2:** Form integration
- [ ] Verify client-side consumption of JSON

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Asset ID returns object values.
2. Customer entity ID returns billing details.

**Edge Cases:**
1. Unknown asset returns empty object.
2. Unknown customer returns empty response.

**Error Handling:**
1. Missing parameters returns no data.

### Test Data Requirements
- Asset with related object
- Customer with billing address

### Sandbox Setup
- Deploy Suitelet and update case form to call it

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Case form users

**Permissions required:**
- View access to assets, objects, and customers

### Data Security
- Limit access to customer data and object details.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm field IDs for asset-object relationship

### Deployment Steps

1. Deploy Suitelet.
2. Update case form to request data.

### Post-Deployment

- [ ] Validate JSON responses

### Rollback Plan

**If deployment fails:**
1. Disable Suitelet.
2. Revert form to manual entry.

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

- [ ] Should customer lookup support internal ID as well as entity ID?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Entity ID changes cause lookup failures | Med | Low | Consider supporting internal ID inputs |

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
