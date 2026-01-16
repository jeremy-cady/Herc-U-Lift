# PRD: Purchase Equipment Button

**PRD ID:** PRD-UNKNOWN-PurchaseOrder
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_purchaseorder.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that adds a "Purchase Equipment" button to a specific Purchase Order form.

**What problem does it solve?**
Provides a UI action to trigger purchase equipment logic via a client script on equipment PO forms.

**Primary Goal:**
Expose the Purchase Equipment button on the HUL Equipment Purchase Order form.

---

## 2. Goals

1. Add the Purchase Equipment button on the specified PO form.
2. Attach the client script that handles the button action.

---

## 3. User Stories

1. **As a** purchasing user, **I want to** click a Purchase Equipment button **so that** I can trigger equipment purchasing actions.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run beforeLoad on Purchase Orders.
2. When the custom form ID is 130, the script must attach `SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js`.
3. The script must add a button labeled "Purchase Equipment" that runs `purchaseEquipmentFxn`.

### Acceptance Criteria

- [ ] Purchase Equipment button appears on form 130.
- [ ] Client script is attached on form 130.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Execute purchase logic on the server.
- Add the button on other forms.

---

## 6. Design Considerations

### User Interface
- Adds a button to the PO form when custom form is 130.

### User Experience
- Users see a dedicated action for equipment purchase POs.

### Design References
- Client script: `SuiteScripts/SNA/sna_hul_cs_source_vendor_item_name.js`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- purchaseorder

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Add button
- [ ] Client Script - Purchase action

**Custom Fields:**
- purchaseorder | customform | Custom form ID

**Saved Searches:**
- None.

### Integration Points
- Client script provides the purchase action.

### Data Requirements

**Data Volume:**
- None.

**Data Sources:**
- Purchase Order form ID.

**Data Retention:**
- No record updates.

### Technical Constraints
- Form-specific behavior based on custom form ID 130.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** Client script module
- **Other features:** None

### Governance Considerations

- **Script governance:** Low.
- **Search governance:** None.
- **API limits:** Low.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- The Purchase Equipment button appears on the equipment PO form.

**How we'll measure:**
- UI verification on form 130.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_purchaseorder.js | User Event | Add Purchase Equipment button | Implemented |

### Development Approach

**Phase 1:** Button display
- [ ] Validate button appears on form 130

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open PO with form 130 and verify Purchase Equipment button.

**Edge Cases:**
1. Other forms do not show the button.

**Error Handling:**
1. Button add errors are logged.

### Test Data Requirements
- Purchase Order using custom form 130

### Sandbox Setup
- Deploy User Event on Purchase Order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing roles

**Permissions required:**
- View Purchase Orders

### Data Security
- No sensitive data changes.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm form ID 130 and client script path

### Deployment Steps

1. Deploy User Event on Purchase Order.
2. Validate button on form 130.

### Post-Deployment

- [ ] Monitor logs for beforeLoad errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Remove button from form.

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

- [ ] Should the form ID be parameterized?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form ID changes break button display | Low | Med | Review form ID after custom form changes |

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
