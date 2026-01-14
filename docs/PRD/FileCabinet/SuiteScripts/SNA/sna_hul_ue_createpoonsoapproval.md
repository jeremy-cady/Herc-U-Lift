# PRD: Purchase Order Vendor Pricing and SO Linking (User Event)

**PRD ID:** PRD-UNKNOWN-CreatePOOnSOApproval
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/SNA/sna_hul_ue_createpoonsoapproval.js (User Event)
- FileCabinet/SuiteScripts/SNA/sna_hul_sl_createvendorprice.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that updates purchase orders created from sales orders, applies vendor pricing logic, sets buy-from vendor, and links POs back to SO lines.

**What problem does it solve?**
Ensures PO pricing and vendor linkage are set correctly for dropship/special order scenarios and updates related sales order lines.

**Primary Goal:**
Adjust PO rates and vendor fields based on vendor pricing and PO type, and link created POs to the originating sales order.

---

## 2. Goals

1. Set buy-from vendor and parent vendor logic for POs.
2. Apply vendor pricing and discount/markup by PO type.
3. Link created POs back to sales order lines.

---

## 3. User Stories

1. **As a** purchasing user, **I want** PO rates to reflect vendor pricing **so that** costs are correct.
2. **As a** sales user, **I want** linked POs on sales orders **so that** I can trace fulfillment.
3. **As an** admin, **I want** vendor pricing records created when missing **so that** pricing data stays complete.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on PO creation and on dropship/special order events.
2. The system must set the PO employee to the current user (or order taker when created by system).
3. The system must set buy-from vendor and parent vendor fields when missing.
4. The system must adjust line rates based on vendor pricing and PO type discount/markup.
5. The system must create vendor pricing records via a Suitelet if none exist for item/vendor.
6. The system must update originating sales order lines with `povendor`, `custcol_sna_linked_po`, and `custcol_sna_csi_povendor`.
7. The system must respect the "created from requisition worksheet" flag to avoid updates.

### Acceptance Criteria

- [ ] PO buy-from vendor and pricing fields are set correctly.
- [ ] Sales order lines show the linked PO and vendor.
- [ ] Vendor price records are created when missing.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Handle non-inventory items for vendor pricing when not supported.
- Update POs created from requisition worksheets.
- Perform real-time validations in the UI.

---

## 6. Design Considerations

### User Interface
- No UI; afterSubmit logic only.

### User Experience
- POs are adjusted automatically after creation without manual steps.

### Design References
- Script parameters:
  - `custscript_param_popartsform`
  - `custscript_param_popartsformdept`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Purchase Order
- Sales Order
- Vendor
- Vendor Price (`customrecord_sna_hul_vendorprice`)
- Item

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Used to create vendor pricing records
- [ ] RESTlet - Not used
- [x] User Event - PO adjustments and SO linking
- [ ] Client Script - Not used

**Custom Fields:**
- Purchase Order | `custbody_sna_buy_from`
- Purchase Order | `custbody_sna_created_from_reqworksheet`
- Purchase Order | `custbody_po_type`
- Sales Order line | `povendor`
- Sales Order line | `custcol_sna_linked_po`
- Sales Order line | `custcol_sna_csi_povendor`
- PO line | `custcol_sna_original_item_rate`

**Saved Searches:**
- Vendor price search for item/vendor combination.

### Integration Points
- Suitelet call to `customscript_sna_hul_sl_createvendprice` via HTTPS.

### Data Requirements

**Data Volume:**
- Per-PO line updates and related SO lines.

**Data Sources:**
- PO lines, vendor records, vendor price records, sales order lines.

**Data Retention:**
- Updates PO and SO fields; creates vendor price records as needed.

### Technical Constraints
- Vendor pricing logic skips certain item types and may require inventory items.
- Discount/markup depends on PO type and vendor fields.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Vendor price Suitelet for record creation.

### Governance Considerations
- Multiple record loads and updates per PO; consider usage limits.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- POs and linked SO lines reflect correct vendor and pricing data.

**How we'll measure:**
- Validate updated PO rates and linked SO fields in sandbox.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_createpoonsoapproval.js | User Event | PO pricing and SO linking | Implemented |

### Development Approach

**Phase 1:** Vendor and pricing logic
- [x] Set buy-from vendor and apply vendor pricing.

**Phase 2:** Linking to sales order
- [x] Update SO lines with PO references.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create dropship PO and verify pricing and SO linkage.

**Edge Cases:**
1. PO created from requisition worksheet; script skips updates.
2. Missing vendor price record triggers create vendor price Suitelet.

**Error Handling:**
1. Record load or search error is logged and does not block save.

### Test Data Requirements
- Sales order with items and vendor pricing records.

### Sandbox Setup
- Configure PO parameters and deploy vendor price Suitelet.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Purchasing and sales operations.

**Permissions required:**
- Edit purchase orders and sales orders
- View vendor price records
- Execute Suitelet

### Data Security
- Ensure only authorized roles can trigger PO updates.

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

1. Upload `sna_hul_ue_createpoonsoapproval.js`.
2. Set script parameters for default PO form and department.
3. Ensure `customscript_sna_hul_sl_createvendprice` is deployed.

### Post-Deployment

- [ ] Verify PO pricing updates and SO linkage.
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

- [ ] Should pricing updates be skipped for additional PO statuses?
- [ ] Should vendor price creation be batched instead of per-line calls?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Multiple record loads increase governance usage | Med | Med | Reduce loads or limit processing to needed events |
| Vendor price Suitelet fails and leaves rates unchanged | Med | Med | Add retry or error notification |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x User Event
- N/search module

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
