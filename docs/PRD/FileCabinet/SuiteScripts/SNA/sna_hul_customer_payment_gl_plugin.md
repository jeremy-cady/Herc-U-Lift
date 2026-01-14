# PRD: Customer Payment Custom GL Plugin

**PRD ID:** PRD-UNKNOWN-CustPaymentGL
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_customer_payment_gl_plugin.js (Custom GL Plugin)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Custom GL plugin that reclassifies customer payment GL impact for internal revenue stream transactions.

**What problem does it solve?**
Ensures internal billing customer payments hit internal WIP and expense accounts instead of default accounts.

**Primary Goal:**
Replace standard GL lines with custom lines mapped to internal accounts when revenue stream is internal.

---

## 2. Goals

1. Detect internal revenue stream on customer payments.
2. Map internal WIP and expense accounts from the revenue stream configuration.
3. Create custom GL lines for debit and credit entries.

---

## 3. User Stories

1. **As an** accountant, **I want** internal payment lines reclassified **so that** internal billing is accurate.
2. **As an** admin, **I want** account mappings stored on revenue streams **so that** updates are centralized.
3. **As a** developer, **I want** GL customization only for internal streams **so that** external payments are unaffected.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run only for Customer Payment records.
2. The system must look up revenue stream internal flags and account mappings from `customrecord_cseg_sna_revenue_st`.
3. If the revenue stream is not internal, the system must exit without changes.
4. For each standard GL line, the system must:
   - Create a custom debit line to `custrecord_sna_hul_int_bill_expense` when credit is zero.
   - Create a custom credit line to `custrecord_sna_hul_int_bill_wip` when debit is zero.
5. The system must copy department, entity, location, memo, tax, and segment values to custom lines.
6. The system must log audit details for line counts and debit/credit distributions.

### Acceptance Criteria

- [ ] Internal revenue stream payments generate custom GL lines with mapped accounts.
- [ ] External revenue stream payments do not create custom lines.
- [ ] Custom lines retain segment values from standard lines.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Modify non-customer payment transactions.
- Alter standard lines beyond adding custom lines.
- Validate account mappings beyond lookup presence.

---

## 6. Design Considerations

### User Interface
- None (GL plugin execution).

### User Experience
- GL impact reflects internal billing policies without manual journal entries.

### Design References
- Revenue stream custom record mappings for internal billing accounts.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Customer Payment
- Custom Segment: Revenue Stream (`customrecord_cseg_sna_revenue_st`)

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used
- [x] Custom GL Plugin - GL impact customization

**Custom Fields:**
- Revenue Stream | `custrecord_sna_hul_int_bill_expense`
- Revenue Stream | `custrecord_sna_hul_int_bill_wip`
- Revenue Stream | `custrecord_sna_hul_revstreaminternal`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- One custom line per standard debit/credit line.

**Data Sources:**
- Standard GL lines and revenue stream mappings.

**Data Retention:**
- GL impact adjustments only.

### Technical Constraints
- Requires valid account mappings on the revenue stream record.
- Uses `customLines.addNewLine()` to create GL lines.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Revenue stream setup with internal account mappings.

### Governance Considerations
- GL plugins run during transaction posting; keep logic efficient.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Internal customer payments post to internal WIP and expense accounts.

**How we'll measure:**
- Review GL impact on internal customer payments.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_customer_payment_gl_plugin.js | Custom GL Plugin | Reclassify internal payment GL lines | Implemented |

### Development Approach

**Phase 1:** Revenue stream lookup
- [x] Identify internal streams and account mappings.

**Phase 2:** GL line creation
- [x] Create custom debit/credit lines and copy segments.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Internal revenue stream payment generates custom lines with mapped accounts.

**Edge Cases:**
1. Missing account mapping results in null account; verify error logging.
2. Revenue stream not internal; no custom lines added.

**Error Handling:**
1. Lookup failure logs error and prevents custom line creation.

### Test Data Requirements
- Customer payment with internal revenue stream and account mappings.

### Sandbox Setup
- Custom GL plugin deployed on customer payment record.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- GL plugin execution role with access to revenue stream records.

**Permissions required:**
- View revenue stream custom records.

### Data Security
- No external data transmitted.

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

1. Upload `sna_hul_customer_payment_gl_plugin.js`.
2. Deploy as a Custom GL Plugin for Customer Payment.
3. Validate GL impact on internal payment transactions.

### Post-Deployment

- [ ] Verify GL lines for internal payments.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the Custom GL Plugin deployment.

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

- [ ] Should the plugin validate account mappings before posting?
- [ ] Should the plugin handle split revenue streams per line?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Missing internal account mappings | Med | Med | Add validation and error alerts |
| Custom GL lines increase posting time | Low | Med | Keep line processing minimal |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Custom GL Plugin
- search.lookupFields API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
