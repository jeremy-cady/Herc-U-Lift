# PRD: Create Inventory Transfer on Receipt

**PRD ID:** PRD-UNKNOWN-CreateInvTransferOnReceipt
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_create_inv_transfer_on_receipt.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that creates Inventory Transfers from Item Receipts and provides a PDF print option for Inventory Transfers.

**What problem does it solve?**
Automates moving received inventory to the SO location and supports printable transfer documentation.

**Primary Goal:**
Create inventory transfers on receipt and attach transfer references back to the receipt lines.

---

## 2. Goals

1. Create Inventory Transfers per location pair on Item Receipt.
2. Copy inventory detail (bins/pallets) into created transfers.
3. Provide a print button on Inventory Transfer records.

---

## 3. User Stories

1. **As a** warehouse user, **I want to** auto-create inventory transfers from receipts **so that** stock moves to the correct location.
2. **As a** warehouse user, **I want to** print transfer documents **so that** I can attach them to shipments.

---

## 4. Functional Requirements

### Core Functionality

1. On Item Receipt create/copy, the script must group lines by `location` and `custcol_sna_hul_so_location` and create Inventory Transfers when they differ.
2. The script must copy inventory detail assignments (receipt inventory number, bin, quantity) to the transfer.
3. The script must set transfer references on Item Receipt lines and header.
4. On Inventory Transfer beforeLoad, the script must add a Print button that generates a PDF using a template.

### Acceptance Criteria

- [ ] Inventory Transfers are created per unique location pair.
- [ ] Item Receipt lines reference the created Inventory Transfer IDs.
- [ ] Print button generates and serves a PDF for Inventory Transfer records.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate inventory availability beyond standard transfer validation.
- Modify Item Receipt quantities or items.

---

## 6. Design Considerations

### User Interface
- Adds a Print button to Inventory Transfer records.

### User Experience
- Transfers are created automatically on receipt, and printable PDFs are available.

### Design References
- Template: `FileCabinet/SuiteScripts/TEMPLATES/sna_hul_inventory_transfer_template.xml`

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- itemreceipt
- inventorytransfer
- subsidiary

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Create transfers and render PDFs
- [ ] Client Script - N/A

**Custom Fields:**
- itemreceipt | custbody_sna_inventory_transfers | Inventory transfer references
- itemreceipt line | custcol_sna_hul_it | Inventory transfer ID
- itemreceipt line | custcol_sna_hul_so_location | SO location
- inventorytransfer | custbody_sna_item_receipt | Source item receipt
- inventorytransfer | custbody_sna_hul_created_from_so | Created from SO label

**Saved Searches:**
- None (loads records directly).

### Integration Points
- PDF rendering uses XML template in File Cabinet.

### Data Requirements

**Data Volume:**
- One transfer per location pair in an item receipt.

**Data Sources:**
- Item Receipt lines and inventory detail subrecords.

**Data Retention:**
- Creates Inventory Transfer records; updates Item Receipt fields.

### Technical Constraints
- Transfer PDF saved to folder defined by `custscript_inv_transfer_folder` parameter.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** XML PDF template

### Governance Considerations

- **Script governance:** Record loads and saves per transfer; inventory detail handling per line.
- **Search governance:** Minimal.
- **API limits:** Moderate for receipts with many lines.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Inventory Transfers are created and linked to Item Receipts, and PDFs render correctly.

**How we'll measure:**
- Verify Item Receipt fields and transfer PDFs for a sample receipt.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_create_inv_transfer_on_receipt.js | User Event | Create transfers and render PDFs | Implemented |

### Development Approach

**Phase 1:** Transfer creation
- [ ] Validate transfer creation and line mapping

**Phase 2:** PDF rendering
- [ ] Validate print button and PDF output

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Item Receipt with different SO location creates transfer and sets line references.
2. Inventory Transfer print button generates PDF.

**Edge Cases:**
1. Lines without SO location or same location do not create transfers.
2. Inventory detail missing still creates transfer without assignments.

**Error Handling:**
1. Inventory detail errors are logged without stopping transfer creation.

### Test Data Requirements
- Item Receipt with multiple locations and inventory detail assignments

### Sandbox Setup
- Deploy User Event on Item Receipt and Inventory Transfer.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Warehouse roles

**Permissions required:**
- Create Inventory Transfers
- Edit Item Receipts
- Access file cabinet for templates

### Data Security
- Transfer PDFs stored in configured folder with proper access control.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm template file and output folder ID

### Deployment Steps

1. Deploy User Event on Item Receipt and Inventory Transfer.
2. Validate transfer creation and print button behavior.

### Post-Deployment

- [ ] Monitor logs for transfer creation issues

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Create transfers manually if required.

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

- [ ] Should transfers be batched if many location pairs exist?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| PDF template changes break rendering | Low | Med | Validate template updates in sandbox |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event
- PDF rendering in SuiteScript

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
