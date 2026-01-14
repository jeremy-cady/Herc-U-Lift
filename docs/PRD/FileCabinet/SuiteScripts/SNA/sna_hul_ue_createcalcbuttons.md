# PRD: Shipping Calculator and Parcel Handling (User Event)

**PRD ID:** PRD-UNKNOWN-CreateCalcButtons
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_createcalcbuttons.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event that adds shipping calculation and parcel management UI, saves parcel details, and integrates with Spee-Dee (via EasyPost) for label buying and retrieval.

**What problem does it solve?**
Allows users to calculate shipping, manage parcel data on item fulfillments, and apply handling fees on sales orders.

**Primary Goal:**
Enable parcel data entry, label retrieval, and shipping cost updates for item fulfillments; apply handling fees for sales orders.

---

## 2. Goals

1. Add a "Calculate Shipping Rate" button and parcel sublist UI.
2. Persist parcel details to a custom parcel record and JSON field.
3. Buy and retrieve shipping labels from EasyPost for Spee-Dee shipments.
4. Apply handling fees based on sales order subtotal.

---

## 3. User Stories

1. **As a** shipping user, **I want** to calculate rates and print labels **so that** shipments are processed quickly.
2. **As a** shipping user, **I want** parcel details saved **so that** they can be reused.
3. **As an** accounting user, **I want** handling fees applied **so that** orders include the correct charges.

---

## 4. Functional Requirements

### Core Functionality

1. The system must add a "Calculate Shipping Rate" button on create/edit for relevant records.
2. The system must add a parcel sublist on item fulfillment forms.
3. The system must read and write `custbody_sna_parceljson` to persist parcel details.
4. The system must create or update `customrecord_sna_parcel` records for each parcel.
5. The system must buy Spee-Dee orders and retrieve label data when fulfillment status indicates shipping.
6. The system must update fulfillment shipping cost and parcel tracking data based on API responses.
7. The system must set handling fees on sales orders using `customrecord_speedee_handlingfeemap`.

### Acceptance Criteria

- [ ] Parcel sublist renders and saves parcel details.
- [ ] Shipping labels and tracking numbers are populated after submit.
- [ ] Handling fees are applied based on subtotal.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Provide a full UI for label printing beyond existing button actions.
- Validate parcel data beyond JSON parsing.
- Handle carriers beyond Spee-Dee/EasyPost configuration.

---

## 6. Design Considerations

### User Interface
- Button for shipping calculation.
- Parcel sublist for item fulfillment records.

### User Experience
- Users can manage parcel data within the fulfillment record.

### Design References
- Script parameters:
  - `custscript_param_speedeeshipmethod`
  - `custscript_param_clientsidescriptid`
  - `custscript_param_speedeetoken`
  - `custscript_param_speedeecarrieraccount`
  - `custscript_param_sm_willcallshoporder`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Item Fulfillment
- Sales Order
- Parcel (`customrecord_sna_parcel`)
- Handling Fee Map (`customrecord_speedee_handlingfeemap`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - UI and parcel processing
- [ ] Client Script - Triggered via button

**Custom Fields:**
- Item Fulfillment | `custbody_sna_parceljson`
- Item Fulfillment | `custbody_sna_speedeeorderid`
- Item Fulfillment | `custbody_sna_speedeeorderreturn`
- Item Fulfillment | `custbody_sna_speedeeorderbought`
- Parcel | `custrecord_sna_pc_*` fields for parcel data

**Saved Searches:**
- Search on `customrecord_speedee_handlingfeemap` for handling fee ranges.

### Integration Points
- EasyPost API (`https://www.easypost.com/api/v2/`) for buying orders and retrieving labels.

### Data Requirements

**Data Volume:**
- Multiple parcels per fulfillment.

**Data Sources:**
- Parcel JSON and EasyPost API responses.

**Data Retention:**
- Parcel data stored in `customrecord_sna_parcel` and JSON on fulfillment.

### Technical Constraints
- External API calls require valid EasyPost token.
- Shipping cost is set to 0 for will-call and per updated logic.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** EasyPost/Spee-Dee APIs.
- **Other features:** Client script referenced by file ID.

### Governance Considerations
- External API calls can add latency.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Parcel data is saved and labels are retrieved without errors.

**How we'll measure:**
- Verify fulfillment parcel JSON and label URLs after submit.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createcalcbuttons.js | User Event | Shipping UI and parcel processing | Implemented |

### Development Approach

**Phase 1:** UI enhancements
- [x] Add shipping calculation button and parcel sublist.

**Phase 2:** Parcel persistence and API integration
- [x] Save parcels and call EasyPost to buy/retrieve labels.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create item fulfillment with parcel data and verify labels/tracking.
2. Create sales order and verify handling fee calculation.

**Edge Cases:**
1. Missing EasyPost token; API calls fail and errors logged.
2. No parcel JSON; sublist remains empty.

**Error Handling:**
1. API error logs and does not block record save.

### Test Data Requirements
- Item fulfillment with parcel info.
- Sales order with subtotal to test handling fee.

### Sandbox Setup
- Configure EasyPost token and Spee-Dee parameters.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Shipping users.

**Permissions required:**
- Edit item fulfillments
- Create custom parcel records
- Access external API via SuiteScript

### Data Security
- API tokens stored as script parameters.

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

1. Upload `sna_hul_ue_createcalcbuttons.js`.
2. Configure script parameters (Spee-Dee/EasyPost settings).
3. Deploy User Event to item fulfillment and sales order records.

### Post-Deployment

- [ ] Verify label generation and handling fees.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should parcel JSON be validated and sanitized before save?
- [ ] Should shipping cost be set to zero for all Spee-Dee shipments?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| EasyPost API outage prevents label retrieval | Med | High | Add retry or fallback process |
| Large parcel lists slow record load | Med | Med | Limit parcel lines in UI |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/https module

### External Resources
- EasyPost API documentation

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
