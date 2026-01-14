# PRD: Sales Order Bill Button and eSignature Controls (User Event)

**PRD ID:** PRD-UNKNOWN-SOHideButton
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_so_hide_button.js (User Event)
- FileCabinet/SuiteScripts/SNA/PandaDocs/sna_hul_cs_pd_esign_button.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event on Sales Orders that hides billing buttons unless billing status is approved and adds a PandaDoc eSignature button for rental transactions.

**What problem does it solve?**
Prevents billing until approval and streamlines eSignature requests for rental orders.

**Primary Goal:**
Control billing UI buttons and enable eSignature request when applicable.

---

## 2. Goals

1. Hide billing buttons when billing status is not approved.
2. Add a "Request eSignature" button for rental transactions without a PandaDoc document.

---

## 3. User Stories

1. **As a** billing user, **I want** billing buttons hidden until approval **so that** billing is controlled.
2. **As a** sales user, **I want** an eSignature button for rentals **so that** documents are sent quickly.

---

## 4. Functional Requirements

### Core Functionality

1. The system must remove `nextbill`, `billremaining`, and `bill` buttons when `custbody_sna_hul_billing_status` is not `2`.
2. On view mode, the system must detect rental transactions by item name containing "Rental".
3. If no `custbody_sna_pd_doc_id` exists and the transaction is rental, the system must add a "Request eSignature" button.
4. The system must set `PandaDocs/sna_hul_cs_pd_esign_button` as the client script for the button.

### Acceptance Criteria

- [ ] Billing buttons are hidden when billing status is not approved.
- [ ] eSignature button appears for rental transactions without PandaDoc document ID.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate billing status beyond the status field.
- Send eSignature requests without user action.
- Add the eSignature button outside view mode.

---

## 6. Design Considerations

### User Interface
- Buttons are added/removed on Sales Order view.

### User Experience
- Users see only relevant actions based on billing status and PandaDoc state.

### Design References
- Script parameter `custscript_sna_pd_adv_pdf_temp`.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - UI controls
- [ ] Client Script - PandaDoc eSignature action

**Custom Fields:**
- Sales Order | `custbody_sna_hul_billing_status`
- Sales Order | `custbody_sna_pd_doc_id`

**Saved Searches:**
- None.

### Integration Points
- PandaDoc via client script action.

### Data Requirements

**Data Volume:**
- One Sales Order per view.

**Data Sources:**
- Sales Order items and PandaDoc fields.

**Data Retention:**
- No data updates.

### Technical Constraints
- Rental detection relies on item name containing "Rental".

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** PandaDoc integration via client script.
- **Other features:** PandaDoc template parameter.

### Governance Considerations
- Minimal.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Billing buttons are hidden appropriately and eSignature button appears for rentals.

**How we'll measure:**
- Verify button visibility on Sales Order view.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_hide_button.js | User Event | Hide billing buttons and add eSignature | Implemented |

### Development Approach

**Phase 1:** Billing button control
- [x] Remove billing buttons when status not approved.

**Phase 2:** eSignature button
- [x] Add PandaDoc button for rental transactions.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Billing status approved; billing buttons visible.
2. Billing status not approved; billing buttons hidden.
3. Rental transaction without PandaDoc ID; eSignature button appears.

**Edge Cases:**
1. Item names do not include "Rental"; eSignature button not shown.

**Error Handling:**
1. Missing template parameter; client script still loads but button may fail.

### Test Data Requirements
- Sales orders with rental and non-rental items.

### Sandbox Setup
- Configure `custscript_sna_pd_adv_pdf_temp` parameter.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Billing and sales users.

**Permissions required:**
- View sales orders

### Data Security
- No additional data exposure.

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

1. Upload `sna_hul_ue_so_hide_button.js`.
2. Deploy User Event on Sales Order.
3. Configure PandaDoc template parameter.

### Post-Deployment

- [ ] Verify button behavior on Sales Order view.
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

- [ ] Should rental detection use item type instead of name matching?
- [ ] Should eSignature button appear in edit mode?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Item names change and break rental detection | Med | Med | Use item category or field flag |
| PandaDoc client script missing breaks button | Med | Med | Add validation or fallback message |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event

### External Resources
- PandaDoc integration docs

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
