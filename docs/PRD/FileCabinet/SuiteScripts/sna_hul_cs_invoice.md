# PRD: Invoice OT Charges Client Script

**PRD ID:** PRD-UNKNOWN-InvoiceOtCharges
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_invoice.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that inserts overtime or damage lines onto an invoice when the invoice is created in copy mode.

**What problem does it solve?**
It carries stored OT charge line data onto new invoices without manual re-entry.

**Primary Goal:**
Recreate OT charge lines from a stored JSON payload when invoices are copied.

---

## 2. Goals

1. Read OT charge data from the invoice header.
2. Add item lines for each OT charge entry.
3. Preserve quantity and rate values from the payload.

---

## 3. User Stories

1. **As a** billing user, **I want** OT charge lines recreated on copied invoices **so that** I do not manually add them.

---

## 4. Functional Requirements

### Core Functionality

1. On page init in copy mode, the script must read `custbody_sna_rent_otcharges`.
2. If the OT charges JSON is present, the script must parse it and add item lines with item, quantity, and rate.
3. Each parsed line must be committed to the invoice item sublist.

### Acceptance Criteria

- [ ] Copied invoices add OT charge lines from `custbody_sna_rent_otcharges`.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate OT charge data structure.
- Add lines on create or edit modes other than copy.

---

## 6. Design Considerations

### User Interface
- No UI changes; lines are added on load during copy.

### User Experience
- Users see lines appear automatically after copy.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Invoice line insert

**Custom Fields:**
- Invoice | `custbody_sna_rent_otcharges`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One line per OT charge entry.

**Data Sources:**
- JSON stored in `custbody_sna_rent_otcharges`.

**Data Retention:**
- Adds lines to the invoice only.

### Technical Constraints
- Only runs in copy mode.

### Dependencies
- **Libraries needed:** N/currentRecord.
- **External dependencies:** None.
- **Other features:** OT charge JSON population by upstream processes.

### Governance Considerations
- Client-side only; no server governance usage.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- OT charge lines reliably appear on copied invoices.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_invoice.js | Client Script | Insert OT charge lines on copy | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Parse OT charge JSON on copy.
- **Phase 2:** Insert item lines with quantity and rate.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Copy an invoice with `custbody_sna_rent_otcharges` populated and verify lines are added.

**Edge Cases:**
1. `custbody_sna_rent_otcharges` is empty or invalid JSON.

**Error Handling:**
1. Invalid JSON should not block load.

### Test Data Requirements
- Invoice with stored OT charge JSON.

### Sandbox Setup
- Deploy client script to invoice form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing users.

**Permissions required:**
- Edit invoices.

### Data Security
- Uses internal invoice data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm the OT charge JSON field is populated by upstream process.

### Deployment Steps
1. Upload `sna_hul_cs_invoice.js`.
2. Deploy to invoice form where copy is used.

### Post-Deployment
- Verify OT charge lines appear on copy.

### Rollback Plan
- Remove the client script deployment from invoice form.

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
- [ ] Should the script also run on transform mode if different from copy?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid JSON causes parse error | Low | Med | Add try/catch around JSON.parse |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
