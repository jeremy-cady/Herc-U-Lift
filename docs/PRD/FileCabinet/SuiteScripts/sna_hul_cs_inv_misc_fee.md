# PRD: Invoice MISC Fee Client Script

**PRD ID:** PRD-UNKNOWN-InvMiscFee
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_inv_misc_fee.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that adds MISC fee lines to invoices on save based on service code type and revenue stream.

**What problem does it solve?**
It calculates and inserts other charge fees without manual line entry.

**Primary Goal:**
Generate MISC fee line items during invoice save when enabled.

---

## 2. Goals

1. Aggregate invoice amounts by service code type and revenue stream.
2. Calculate MISC fees based on configured shop fee percent and min/max.
3. Insert other charge lines for calculated fees.

---

## 3. User Stories

1. **As a** billing user, **I want** MISC fees added automatically **so that** invoices are complete.

---

## 4. Functional Requirements

### Core Functionality

1. On save, if `custbody_sna_misc_fee_allowed` is false, the script must do nothing.
2. If `custbody_sna_misc_fee_generated` is true, the script must do nothing.
3. The script must group invoice lines by `custcol_sna_so_service_code_type` and `cseg_sna_revenue_st` and sum amounts.
4. For each group, the script must calculate a fee using the shop fee percent and min/max from `customrecord_sna_service_code_type`.
5. The script must add a new line with the calculated fee, service code type, revenue stream, quantity 1, and header location.

### Acceptance Criteria

- [ ] MISC fee lines are added when allowed and not already generated.
- [ ] Fee amounts respect configured min and max limits.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Mark the invoice as MISC fee generated.
- Validate configuration record completeness.

---

## 6. Design Considerations

### User Interface
- No UI changes; runs on save.

### User Experience
- Users see additional fee lines added automatically.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Invoice
- Custom Record | `customrecord_sna_service_code_type`

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Fee calculation on save

**Custom Fields:**
- Invoice | `custbody_sna_misc_fee_allowed`
- Invoice | `custbody_sna_misc_fee_generated`
- Line | `cseg_sna_revenue_st`
- Line | `custcol_sna_so_service_code_type`
- Line | `amount`
- Line | `location`
- Service Code Type | `custrecord_sna_serv_code`
- Service Code Type | `custrecord_sna_ser_code_type`
- Service Code Type | `custrecord_sna_shop_fee_code_item`
- Service Code Type | `custrecord_sna_shop_fee_percent`
- Service Code Type | `custrecord_sna_min_shop_fee`
- Service Code Type | `custrecord_sna_max_shop_fee`

**Saved Searches:**
- None (scripted searches only).

### Integration Points
- Uses service code type configuration to determine other charge item and fee percent.

### Data Requirements

**Data Volume:**
- Aggregated line data per invoice.

**Data Sources:**
- Invoice line items and service code configuration.

**Data Retention:**
- Adds fee lines only on the invoice.

### Technical Constraints
- Client-side save may be impacted by large line counts.

### Dependencies
- **Libraries needed:** N/search.
- **External dependencies:** None.
- **Other features:** Service code type configuration records.

### Governance Considerations
- Client-side searches for each service type and revenue stream group.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Invoices automatically include correct MISC fee lines.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_inv_misc_fee.js | Client Script | Add MISC fee lines on save | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Group lines and compute fee.
- **Phase 2:** Insert fee lines on save.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save an invoice with service code type and revenue stream lines; fee lines added.

**Edge Cases:**
1. No eligible lines; no fee lines added.
2. Multiple service code and revenue stream combinations.

**Error Handling:**
1. Missing configuration record should skip fee line.

### Test Data Requirements
- Service code type configuration records with min/max values.

### Sandbox Setup
- Deploy client script to invoice form.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Billing users.

**Permissions required:**
- Edit invoices and view service code type records.

### Data Security
- Uses internal configuration data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Verify service code configuration records exist.

### Deployment Steps
1. Upload `sna_hul_cs_inv_misc_fee.js`.
2. Deploy to invoice forms with MISC fee processing.

### Post-Deployment
- Validate fee lines on save.

### Rollback Plan
- Remove the client script deployment from invoice forms.

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
- [ ] Should the script set `custbody_sna_misc_fee_generated` after inserting lines?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate fees if header flag not updated elsewhere | Med | Med | Add UE or client update to set flag |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Client Script

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
