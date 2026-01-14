# PRD: Inactive Address Warning Client Script

**PRD ID:** PRD-UNKNOWN-InactiveAddress
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_inactive_address.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that warns users when selected billing, shipping, or job site addresses are marked inactive.

**What problem does it solve?**
It reduces the risk of sending documents or services to inactive addresses.

**Primary Goal:**
Alert users when an inactive address is selected on transactions or support cases.

---

## 2. Goals

1. Detect inactive billing and shipping addresses on transactions.
2. Detect inactive job site address for support cases.
3. Display warning messages for inactive selections.

---

## 3. User Stories

1. **As a** coordinator, **I want** an alert when an address is inactive **so that** I can choose a valid location.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, the system must check billing and shipping addresses for inactive flags.
2. On field change for billing or shipping address, the system must re-check and warn if inactive.
3. On support cases, the system must check the related asset job site address for inactivity.
4. The system must display warning messages using alerts and UI message notifications.

### Acceptance Criteria

- [ ] Inactive billing or shipping addresses trigger a warning.
- [ ] Inactive job site address on a case triggers a warning.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Prevent record save.
- Automatically switch to a different address.

---

## 6. Design Considerations

### User Interface
- Warning displayed via alert and message banner.

### User Experience
- Warnings appear on page load and after address changes.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transaction records (invoice, sales order, etc.)
- Support Case
- Customer
- Custom Record | `customrecord_nx_asset`
- Address

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Address warning

**Custom Fields:**
- Address | `custrecord_sn_inactive_address`
- Case | `custevent_nx_case_asset`
- Asset | `custrecord_nx_asset_customer`
- Asset | `custrecord_nx_asset_address`
- Transaction | `billingaddress_key`
- Transaction | `shippingaddress_key`

**Saved Searches:**
- None (lookupFields and record load only).

### Integration Points
- Uses customer addressbook to resolve address internal IDs.

### Data Requirements

**Data Volume:**
- Single address lookup per change.

**Data Sources:**
- Address records and asset/customer relationships.

**Data Retention:**
- No data persisted.

### Technical Constraints
- Requires address internal IDs via `billingaddress_key` and `shippingaddress_key`.

### Dependencies
- **Libraries needed:** N/record, N/search, N/currentRecord, N/log, N/ui/message.
- **External dependencies:** None.
- **Other features:** Address inactive flag field.

### Governance Considerations
- Client-side record load for customer addressbook on cases.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Users are warned whenever inactive addresses are selected.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_inactive_address.js | Client Script | Warn on inactive addresses | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Transaction billing/shipping address warnings.
- **Phase 2:** Support case asset address warnings.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Select an inactive billing address and confirm warning.
2. Select an inactive shipping address and confirm warning.
3. Select a case asset linked to an inactive address and confirm warning.

**Edge Cases:**
1. No address selected.
2. Customer addressbook does not contain asset address ID.

**Error Handling:**
1. Address lookup fails; warning should not crash the form.

### Test Data Requirements
- Customer with at least one inactive address and a linked asset.

### Sandbox Setup
- Deploy script to transaction forms and case record.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Users managing transactions and cases.

**Permissions required:**
- View customers, addresses, and assets.

### Data Security
- Only reads address status data.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm address inactive field exists on address records.

### Deployment Steps
1. Upload `sna_hul_cs_inactive_address.js`.
2. Deploy to transaction and case forms.

### Post-Deployment
- Validate warnings on address changes.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should inactive address selection block save instead of warning?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Customer addressbook lookup is slow | Low | Low | Cache addresses if needed |

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
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
