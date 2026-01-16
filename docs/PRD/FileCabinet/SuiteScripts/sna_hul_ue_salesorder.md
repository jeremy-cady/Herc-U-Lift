# PRD: Sales Order Numbering and Transfer Button

**PRD ID:** PRD-UNKNOWN-SalesOrder
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_salesorder.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that assigns sales order document numbers, sets blanket PO values, controls VersaPay sync, and adds a transfer button.

**What problem does it solve?**
Ensures sales orders follow numbering rules, inherit PO values when needed, avoid syncing internal revenue streams, and allow transfer processing.

**Primary Goal:**
Automate sales order numbering and operational controls at create/view time.

---

## 2. Goals

1. Generate unique sales order document numbers using configuration records.
2. Populate `otherrefnum` from case or customer blanket PO values.
3. Prevent VersaPay sync for internal revenue streams.
4. Provide a Transfer button when eligible lines need transfer processing.

---

## 3. User Stories

1. **As a** sales user, **I want to** auto-generate order numbers **so that** orders follow numbering rules.
2. **As an** operations user, **I want to** launch transfers from eligible orders **so that** transfers are created consistently.

---

## 4. Functional Requirements

### Core Functionality

1. On sales order create, the script must assign a document number from the document numbering custom record.
2. On sales order create, the script must set `otherrefnum` from the case PO or customer blanket PO when missing.
3. On create/edit/xedit, the script must prevent VersaPay sync for internal revenue stream orders.
4. On view, the script must add a Transfer button when status and line conditions are met.

### Acceptance Criteria

- [ ] Sales orders receive a generated `tranid` on create.
- [ ] Blanket PO values populate when missing.
- [ ] Internal revenue stream orders skip VersaPay sync.
- [ ] Transfer button appears only for eligible orders.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Renumber existing orders after create.
- Create transfer orders directly; it only launches the suitelet.

---

## 6. Design Considerations

### User Interface
- Transfer button opens a suitelet in a new window.

### User Experience
- Users see the assigned document number after save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_sna_hul_document_numbering
- supportcase
- customer

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [x] Suitelet - Transfer process
- [ ] RESTlet - N/A
- [x] User Event - Sales order automation
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder | otherrefnum | PO number
- salesorder | custbody_nx_case | Linked case
- supportcase | custevent_nx_case_purchaseorder | Case PO number
- customer | custentity_sna_blanket_po | Blanket PO
- customer | custentity_sna_hul_po_required | PO required flag
- salesorder | custcol_sna_hul_ship_meth_vendor | Line ship method
- salesorder | custcol_sna_hul_so_linked_transfer | Transfer link

**Saved Searches:**
- Search for existing sales order `tranid` values.

### Integration Points
- Suitelet: customscript_sna_hul_sl_so_transfer_proc
- Module: SuiteScripts/SNA/shared/sna_hul_mod_versapay_sync

### Data Requirements

**Data Volume:**
- Single document numbering lookup per order.

**Data Sources:**
- Document numbering custom record and support case/customer PO fields.

**Data Retention:**
- Updates sales order `tranid` and PO fields.

### Technical Constraints
- Transfer button logic depends on line shipping method and fulfillment quantities.

### Dependencies
- **Libraries needed:** sna_hul_mod_utils, sna_hul_mod_versapay_sync
- **External dependencies:** None
- **Other features:** Document numbering configuration and transfer suitelet

### Governance Considerations

- **Script governance:** Moderate due to searches and submitFields.
- **Search governance:** Document numbering and duplicate check searches.
- **API limits:** Low to moderate.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales orders receive unique numbers and valid transfer access.

**How we'll measure:**
- Validate numbering increments and transfer button availability.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_salesorder.js | User Event | Sales order numbering and transfer controls | Implemented |

### Development Approach

**Phase 1:** Numbering and PO population
- [ ] Validate numbering config and PO fallback logic

**Phase 2:** Transfer button logic
- [ ] Validate button display conditions

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create sales order and verify `tranid` and PO values.
2. View eligible order and verify Transfer button appears.

**Edge Cases:**
1. Missing document numbering record should log an error.

**Error Handling:**
1. Duplicate `tranid` should retry or log without breaking save.

### Test Data Requirements
- Document numbering record for sales order custom form.
- Sales order with transfer ship method and unfulfilled lines.

### Sandbox Setup
- Deploy User Event on sales order.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and operations roles

**Permissions required:**
- Edit sales orders
- Edit document numbering records

### Data Security
- Numbering configuration access restricted to admins.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm document numbering records per sales order form
- [ ] Confirm transfer suitelet deployment

### Deployment Steps

1. Deploy User Event on sales order.
2. Validate numbering and transfer button behavior.

### Post-Deployment

- [ ] Monitor logs for numbering and PO lookup errors

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Assign numbers and transfers manually.

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

- [ ] Should numbering reset by subsidiary or year?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Duplicate numbering from concurrent saves | Low | Med | Monitor and adjust numbering logic |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
