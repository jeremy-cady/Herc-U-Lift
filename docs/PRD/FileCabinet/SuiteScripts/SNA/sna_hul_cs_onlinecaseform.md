# PRD: Online Case Form Client Script

**PRD ID:** PRD-UNKNOWN-OnlineCaseFormCS
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_cs_onlinecaseform.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that manages field visibility and auto-populates customer and asset fields on the online case form.

**What problem does it solve?**
Ensures only relevant fields are shown based on case category/issue and automates population of customer and asset details from Suitelet lookups.

**Primary Goal:**
Dynamically show/hide fields and populate customer/asset data on the online case form.

---

## 2. Goals

1. Show or hide fields based on case category and issue type.
2. Populate customer fields using a Suitelet lookup by customer ID.
3. Populate asset fields using a Suitelet lookup by selected asset.

---

## 3. User Stories

1. **As a** customer, **I want** only relevant fields shown **so that** the form is easier to complete.
2. **As a** service agent, **I want** customer details auto-filled **so that** I can reduce data entry.
3. **As a** support admin, **I want** asset details auto-populated **so that** equipment data is accurate.

---

## 4. Functional Requirements

### Core Functionality

1. The system must hide or show groups of fields based on `category` and `issue` selections.
2. The system must hide all related fields when category is empty.
3. For Parts Request categories, the system must show asset site/object fields.
4. For Rental/Delivery/Service categories, the system must show rental asset fields and service type fields (for Service Request).
5. For Complaint/Question categories, the system must show fields based on issue type (rentals/deliveries/maintenance/installations/repair vs equipment/parts sales).
6. When `custevent_sna_hul_customer` or `custevent_sna_customer_id` changes, the system must call a Suitelet and populate:
   - Company name, email, and billing address fields.
7. When asset fields change, the system must call a Suitelet and populate equipment details.
8. On save, the system must require `issue` when category is Complaint or Question.

### Acceptance Criteria

- [ ] Fields hide/show correctly for each category and issue combination.
- [ ] Customer lookup populates company name, email, and address fields.
- [ ] Asset lookup populates equipment detail fields.
- [ ] Save is blocked if issue is missing for Complaint/Question.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate customer or asset data beyond Suitelet responses.
- Create or submit support cases server-side.
- Handle authentication to external systems.

---

## 6. Design Considerations

### User Interface
- Uses client-side field visibility toggles.

### User Experience
- Form fields appear only when relevant; key details are auto-filled.

### Design References
- Suitelet `customscript_sna_hul_sl_onlinecaseform`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Customer
- Asset/Object

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used for lookups
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Online case form behavior

**Custom Fields:**
- Case fields referenced in show/hide logic (e.g., `custevent_sna_hul_casefleetcode`, `custevent_nx_case_asset`, `custevent_sna_hul_service_type`).
- Customer fields: `custevent_sna_hul_customer`, `custevent_sna_customer_id`.

**Saved Searches:**
- None (Suitelet handles lookups).

### Integration Points
- Suitelet `customscript_sna_hul_sl_onlinecaseform` / `customdeploy_sna_hul_sl_onlinecaseform`.

### Data Requirements

**Data Volume:**
- One lookup per customer or asset change.

**Data Sources:**
- Suitelet responses for customer and asset data.

**Data Retention:**
- Updates form fields only.

### Technical Constraints
- Uses `https.get` to call Suitelet.
- Defaults customer to internal ID 810 when lookup returns empty.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Suitelet must return JSON for customer/asset data.

### Governance Considerations
- Client-side Suitelet calls per change; should be monitored for frequency.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Online case form data is accurate and field visibility is correct.

**How we'll measure:**
- Verify form behavior for each category and issue type.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_onlinecaseform.js | Client Script | Online case form field control and lookup | Implemented |

### Development Approach

**Phase 1:** Field visibility
- [x] Implement show/hide logic by category and issue.

**Phase 2:** Data population
- [x] Populate customer and asset fields via Suitelet.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select category and issue combinations; fields show/hide correctly.
2. Enter customer ID; fields populate with customer data.
3. Select an asset; equipment fields populate.

**Edge Cases:**
1. Suitelet returns empty response; fields clear and default customer set.
2. Multiple assets selected; general fields hidden.

**Error Handling:**
1. Suitelet call fails; user should see missing data and logs in console.

### Test Data Requirements
- Customers and assets accessible via Suitelet.

### Sandbox Setup
- Client script deployed on online case form with Suitelet deployed.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Users filling out the online case form.

**Permissions required:**
- Access to Suitelet deployment

### Data Security
- Customer and asset data transmitted via Suitelet; ensure role access is appropriate.

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

1. Upload `sna_hul_cs_onlinecaseform.js`.
2. Deploy to the online case form.
3. Validate lookups and field visibility.

### Post-Deployment

- [ ] Verify field visibility and lookup population.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Remove the client script from the online case form.

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

- [ ] Should the Suitelet responses be cached to reduce calls?
- [ ] Should the default customer ID be configurable?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Suitelet unavailable | Med | Med | Add error messaging or fallback behavior |
| Excessive Suitelet calls degrade UI | Med | Low | Throttle fieldChanged calls |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Client Script
- N/url and N/https modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
