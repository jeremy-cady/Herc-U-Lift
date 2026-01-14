# PRD: Hide PO Fields on Service Sales Orders (User Event)

**PRD ID:** PRD-UNKNOWN-HidePOFieldsServiceSO
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_po_fields_on_service_so.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that hides purchase-order-related columns on service-related sales order forms for specific roles.

**What problem does it solve?**
Prevents certain roles from seeing PO pricing and margin fields on service sales order forms, simplifying the UI and reducing exposure.

**Primary Goal:**
Hide PO-related item sublist fields for designated roles on form IDs 105 and 106.

---

## 2. Goals

1. Run on view/edit only.
2. Apply only to specific custom forms (105, 106).
3. Hide PO-related columns for specific roles.

---

## 3. User Stories

1. **As a** service user, **I want** PO fields hidden **so that** I focus on service data.
2. **As an** admin, **I want** PO pricing hidden from certain roles **so that** sensitive data is protected.
3. **As a** support user, **I want** the behavior consistent across service forms **so that** training is simpler.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad` for `VIEW` and `EDIT`.
2. The system must query `customform` on the transaction record.
3. The system must apply only when `customform` is:
   - 106 (NXC Form)
   - 105 (Service Estimate Form)
4. The system must check the current user role against:
   - 1150, 1154, 1149, 1148, 1147, 1172, 1173
5. When form and role match, the system must hide item sublist columns:
   - For form 106:
     - `porate`
     - `custcol_sna_linked_po`
     - `createpo`
     - `custcol_sna_hul_cust_createpo`
     - `custcol_sna_hul_cumulative_markup`
     - `estgrossprofitpercent`
     - `estgrossprofit`
   - For form 105:
     - `custcol_sna_hul_estimated_po_rate`
     - `custcol_sna_hul_cust_createpo`
     - `custcol_sna_linked_po`
     - `estgrossprofit`
     - `estgrossprofitpercent`
     - `custcol_sna_hul_cumulative_markup`
6. Missing fields must be logged but not block execution.

### Acceptance Criteria

- [ ] Columns are hidden for listed roles on forms 105 and 106.
- [ ] Other roles/forms are unaffected.
- [ ] Missing columns do not throw errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Hide fields outside the item sublist.
- Run on create/copy.
- Enforce security beyond UI hiding.

---

## 6. Design Considerations

### User Interface
- Hides PO-related columns on the item sublist.

### User Experience
- Simplified line item view for service users.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Orders (service forms)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Column hiding
- [ ] Client Script - Not used

**Custom Fields:**
- Item sublist fields listed in Functional Requirements.

**Saved Searches:**
- None (SuiteQL used to fetch `customform`).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- N/A.

**Data Sources:**
- Transaction record and current user role.

**Data Retention:**
- None.

### Technical Constraints
- Applies only to custom forms 105 and 106.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Role IDs and form IDs must remain accurate.

### Governance Considerations
- SuiteQL call per view/edit to fetch form ID.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO-related fields are hidden for targeted roles on service forms.

**How we'll measure:**
- UI verification on forms 105 and 106.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_hide_po_fields_on_service_so.js | User Event | Hide PO columns on service SO forms | Implemented |

### Development Approach

**Phase 1:** Form and role gate
- [x] Fetch form ID and match role list

**Phase 2:** Column hiding
- [x] Hide PO-related columns per form

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open form 106 as a listed role; PO columns are hidden.
2. Open form 105 as a listed role; PO columns are hidden.

**Edge Cases:**
1. Open other forms; no columns hidden.
2. Missing column on a form; no error thrown.

**Error Handling:**
1. SuiteQL failure logs debug and leaves UI unchanged.

### Test Data Requirements
- Transactions using forms 105 and 106.

### Sandbox Setup
- Ensure forms 105/106 exist and include the target columns.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles listed in the script.

**Permissions required:**
- Standard view/edit permissions on sales orders.

### Data Security
- UI-only; not a security control.

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

1. Upload `hul_hide_po_fields_on_service_so.js`.
2. Deploy as a User Event on sales order record type.
3. Verify behavior on forms 105 and 106.

### Post-Deployment

- [ ] Confirm columns are hidden for target roles.
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

- [ ] Should form IDs be configurable?
- [ ] Should the role list be centralized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form IDs change | Med | Med | Validate per environment |
| Role IDs change | Med | Med | Maintain role list |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_columns_ue.md

### NetSuite Documentation
- SuiteScript 2.x User Event
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
