# PRD: Set Vendor Defaults on Purchase Orders Client Script

**PRD ID:** PRD-UNKNOWN-SetVendor
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_setvendor.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that sets default vendor, buy-from vendor, employee, location, and department values on Purchase Orders.

**What problem does it solve?**
It standardizes PO header and line defaults based on form, user, and vendor configuration.

**Primary Goal:**
Apply vendor and header defaults consistently on PO creation and sourcing.

---

## 2. Goals

1. Set employee and PO type defaults on create.
2. Default Buy From Vendor and Pay To Vendor logic using parent vendor.
3. Set department and location defaults based on form and employee.

---

## 3. User Stories

1. **As a** buyer, **I want** PO defaults set automatically **so that** I can create POs faster.

---

## 4. Functional Requirements

### Core Functionality

1. On create, the script must set `employee` to the current user.
2. On create, the script must set `custbody_po_type` based on special order or dropship context.
3. If a parent vendor exists, the script must set `entity` to the parent vendor and `custbody_sna_buy_from` to the original vendor.
4. When `custbody_sna_buy_from` changes, the script must update `entity` to the parent vendor or the same vendor.
5. On item line selection, the script must set line `location` and `department` based on header values and form rules.
6. On post sourcing (create only), the script must set department and location defaults based on the PO form and employee location.

### Acceptance Criteria

- [ ] PO header fields default correctly on create.
- [ ] Vendor relationship updates Pay To Vendor and Buy From Vendor fields.
- [ ] Line location and department defaults apply on item selection.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate vendor pricing (handled elsewhere).
- Validate vendor or department permissions.

---

## 6. Design Considerations

### User Interface
- Header and line fields are set automatically.

### User Experience
- Users create POs with fewer manual steps.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Vendor
- Employee

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - PO defaults

**Custom Fields:**
- Header | `employee`
- Header | `custbody_po_type`
- Header | `custbody_sna_buy_from`
- Header | `custbody_sna_hul_orderid`
- Header | `specord`
- Header | `dropshipso`
- Header | `customform`
- Header | `department`
- Header | `location`
- Vendor | `custentity_sna_parent_vendor`
- Line | `item`
- Line | `department`
- Line | `location`

**Saved Searches:**
- None.

### Integration Points
- Reads vendor parent relationship to set Buy From Vendor and Pay To Vendor.

### Data Requirements

**Data Volume:**
- Header and line default updates during create and sourcing.

**Data Sources:**
- Vendor and employee records.

**Data Retention:**
- Updates PO header and line fields only.

### Technical Constraints
- Uses form IDs 108 and 130 to set department rules.

### Dependencies
- **Libraries needed:** N/search, N/currentRecord, N/runtime.
- **External dependencies:** None.
- **Other features:** PO form configuration and vendor parent field.

### Governance Considerations
- Client-side lookups for vendor parent and employee location.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- PO defaults are applied consistently on create and line entry.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_setvendor.js | Client Script | Set vendor and header defaults on POs | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Header defaults on create.
- **Phase 2:** Line defaults and vendor parent handling.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a PO and verify employee, PO type, and vendor defaults.
2. Add an item line and verify line location and department.

**Edge Cases:**
1. Vendor has no parent; `entity` stays as vendor.
2. PO created from Sales Order link; ignore pricing trigger logic.

**Error Handling:**
1. Vendor lookup fails; retain original vendor values.

### Test Data Requirements
- Vendors with and without parent vendor.
- PO forms 108 and 130.

### Sandbox Setup
- Deploy client script to Purchase Order form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Purchasing users.

**Permissions required:**
- Create and edit Purchase Orders, view vendor and employee records.

### Data Security
- Uses internal vendor and employee data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm form IDs and department defaults.

### Deployment Steps
1. Upload `sna_hul_cs_setvendor.js`.
2. Deploy to Purchase Order forms.

### Post-Deployment
- Validate defaults on create and line entry.

### Rollback Plan
- Remove client script deployment from PO forms.

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
- [ ] Should form IDs be parameterized instead of hard-coded?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form IDs change across environments | Med | Med | Move IDs to script parameters |

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
