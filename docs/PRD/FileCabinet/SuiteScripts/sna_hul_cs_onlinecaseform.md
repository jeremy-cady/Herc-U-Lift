# PRD: Online Case Form Client Script

**PRD ID:** PRD-UNKNOWN-OnlineCaseForm
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_onlinecaseform.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_onlinecaseform.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script for the online case form that controls field visibility and auto-populates customer and asset details.

**What problem does it solve?**
It guides users to enter the right information based on case type and request type, and auto-fills related customer and asset data.

**Primary Goal:**
Dynamically show relevant fields and populate customer and asset details for online case submissions.

---

## 2. Goals

1. Show or hide field groups based on case category and request type.
2. Populate customer and company fields from customer lookup.
3. Populate equipment details when a single asset is selected.

---

## 3. User Stories

1. **As a** customer, **I want** the form to show only relevant fields **so that** I can submit quickly.
2. **As a** user, **I want** customer and asset details auto-filled **so that** data entry is minimized.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, if no category is selected, the script must hide parts, rental, complaint, and general field groups.
2. When category or issue changes, the script must toggle field groups based on category and issue values.
3. When a single asset is selected, the script must show general fields and load asset details via Suitelet call.
4. When customer fields change, the script must call the Suitelet to retrieve customer details and populate company, email, and address fields.
5. On save, if category is Complaint or Question and issue is empty, the script must alert and block save.

### Acceptance Criteria

- [ ] Field visibility changes according to category and request type selections.
- [ ] Customer and asset details populate from the Suitelet.
- [ ] Complaint or Question requires a request type.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate address formats.
- Create or update customer records.

---

## 6. Design Considerations

### User Interface
- Field groups are hidden or shown based on category and issue.

### User Experience
- Users receive a validation alert for missing request type.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Online case form (case record context)
- Customer
- Custom Record | object asset (via Suitelet)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Online case form lookup
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Form behavior

**Custom Fields:**
- Case | `category`
- Case | `issue`
- Case | `custevent_sna_hul_casefleetcode`
- Case | `custevent_sna_hul_caseserialno`
- Case | `custevent_sna_hul_manufcode`
- Case | `custevent_sna_hul_eqptmodel`
- Case | `custevent_sna_hul_caseframenum`
- Case | `custevent_sna_hul_casepower`
- Case | `custevent_sna_hul_casecapacity`
- Case | `custevent_sna_hul_casetires`
- Case | `custevent_sna_hul_caseheight`
- Case | `custevent_sna_hul_casewarrantytype`
- Case | `custevent_sna_hul_caseassetsite`
- Case | `custevent_sna_hul_caseobjectasset`
- Case | `custevent_nx_case_asset`
- Case | `custevent_nxc_case_assets`
- Case | `custevent_sna_hul_service_type`
- Case | `custevent_sna_hul_customer`
- Case | `custevent_sna_customer_id`
- Case | `companyname`
- Case | `email`
- Case | `address1`
- Case | `address2`
- Case | `city`
- Case | `state`
- Case | `zipcode`

**Saved Searches:**
- None.

### Integration Points
- Suitelet `customscript_sna_hul_sl_onlinecaseform` for customer and asset lookups.

### Data Requirements

**Data Volume:**
- One Suitelet call per customer or asset change.

**Data Sources:**
- Customer and asset data returned from Suitelet.

**Data Retention:**
- Writes values into case form fields only.

### Technical Constraints
- Uses external Suitelet URL calls from the client.

### Dependencies
- **Libraries needed:** N/currentRecord, N/url, N/https.
- **External dependencies:** None.
- **Other features:** Online case form Suitelet.

### Governance Considerations
- Client-side HTTP calls to Suitelet.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Online case forms show correct fields and auto-fill customer/asset data.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_onlinecaseform.js | Client Script | Online case form field control and lookups | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Field visibility logic.
- **Phase 2:** Customer and asset lookup integration.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select a category and verify correct fields appear.
2. Select a customer and confirm address and company fields populate.
3. Select a single asset and confirm equipment fields populate.

**Edge Cases:**
1. Multiple assets selected; equipment fields remain hidden.
2. Customer lookup returns empty; fields cleared and default customer set.

**Error Handling:**
1. Suitelet response is empty or invalid JSON.

### Test Data Requirements
- Customer records and asset records accessible to the Suitelet.

### Sandbox Setup
- Deploy client script to online case form with Suitelet active.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users submitting online cases.

**Permissions required:**
- Access to customer and asset data via Suitelet.

### Data Security
- Uses customer and asset data already available to the Suitelet.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm Suitelet URL is accessible and returns JSON.

### Deployment Steps
1. Upload `sna_hul_cs_onlinecaseform.js`.
2. Deploy to the online case form.

### Post-Deployment
- Validate field visibility and lookup behavior.

### Rollback Plan
- Remove client script deployment from the online case form.

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
- [ ] Should the default customer ID (810) be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Suitelet response empty or slow | Med | Med | Add error handling and retries |

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
