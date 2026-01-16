# PRD: Sales Order Temporary Item Handling

**PRD ID:** PRD-UNKNOWN-SoTemporaryItem
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_temporaryitem.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Assigns unique temporary item codes, validates required fields, and orchestrates vendor and PO creation for temporary items on Sales Orders and Estimates.

**What problem does it solve?**
Prevents incomplete temporary item lines, ensures consistent temp code generation, and initiates PO creation workflows.

**Primary Goal:**
Automate temporary item setup and related vendor/PO preparation on Sales Orders and Estimates.

---

## 2. Goals

1. Clear temp codes on create/copy and regenerate as needed.
2. Enforce required line fields for temporary items.
3. Create or assign vendors and initiate PO creation when required.

---

## 3. User Stories

1. **As a** buyer, **I want to** have unique temp item codes generated **so that** temporary items are trackable.
2. **As a** sales user, **I want to** be warned about missing temp item fields **so that** I can fix them before save.
3. **As a** purchasing user, **I want to** trigger PO creation for temp items **so that** procurement is streamlined.

---

## 4. Functional Requirements

### Core Functionality

1. On CREATE/COPY, the system must clear custcol_sna_hul_temp_item_code and custcol_sna_hul_createpo on all item lines.
2. On VIEW, the system must populate custcol_sna_hul_cust_createpo with Drop Ship and Spec Ord PO links when createpo is Drop Ship and povendor is present.
3. On beforeSubmit, the system must generate temp item codes based on item category and prefix mappings using the customsearch_sna_hul_tempcode_index search.
4. On beforeSubmit, the system must validate required temp item fields and throw UI errors when missing.
5. On beforeSubmit, the system must create or set PO vendor details when vendor info is provided.
6. On afterSubmit, the system must backfill temp item codes for any missing lines and trigger PO creation via Suitelet when needed.

### Acceptance Criteria

- [ ] Temporary item lines receive a unique code with the configured prefix and sequence.
- [ ] Missing required fields block save in UI with a clear error message.
- [ ] PO creation triggers when createpo is set and vendor data exists.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create item records for temporary items.
- Perform PO creation directly (delegated to Suitelet).
- Validate vendor data beyond presence checks.

---

## 6. Design Considerations

### User Interface
- VIEW mode shows links to create Drop Ship or Spec Ord PO.

### User Experience
- Errors are thrown during UI save to force required fields.

### Design References
- Suitelet: customscript_sna_hul_sl_so_tempitem

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate
- Vendor
- Purchase Order
- Item

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - PO creation
- [ ] RESTlet - N/A
- [x] User Event - Temporary item logic
- [ ] Client Script - N/A

**Custom Fields:**
- Item line | custcol_sna_hul_temp_item_code | Temporary item code
- Item line | custcol_sna_hul_createpo | Create PO indicator (script)
- Item line | custcol_sna_hul_cust_createpo | PO link HTML
- Item line | custcol_sna_hul_itemcategory | Item category
- Item line | custcol_sna_hul_item_vendor | Temporary vendor
- Item line | custcol_sna_hul_vendor_name | Vendor name
- Item line | custcol_sna_hul_vendor_item_code | Vendor item code
- Item line | custcol_sna_hul_temp_porate | Temp PO rate
- Item line | custcol_sna_hul_estimated_po_rate | Estimated PO rate
- Item line | custcol_sna_hul_company_or_indv | Vendor is person flag
- Item line | custcol_sna_hul_vendor_phone_no | Vendor phone
- Item line | custcol_sna_hul_vendor_city | Vendor city
- Item line | custcol_sna_hul_vendor_state | Vendor state
- Item line | custcol_sna_hul_vendor_country | Vendor country
- Item line | custcol_sna_hul_vendor_zipcode | Vendor zip
- Item line | custcol_sna_hul_vendor_address1 | Vendor address 1
- Item line | custcol_sna_hul_vendor_address2 | Vendor address 2
- Item line | custcol_sna_hul_vendor_sub | Vendor subsidiary
- Item line | custcol_sna_linked_po | Linked PO
- Item line | custcol_sna_hul_ship_meth_vendor | Vendor ship method

**Saved Searches:**
- customsearch_sna_hul_tempcode_index | Find latest temp code index by item category/prefix

### Integration Points
- Suitelet: customscript_sna_hul_sl_so_tempitem

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- Item records for item category.
- Saved search for temp code indexing.

**Data Retention:**
- Temp codes stored on item lines.

### Technical Constraints
- Temp code generation depends on saved search results.
- Vendor creation only when vendor name is provided and temp vendor is blank.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Suitelet for PO creation

### Governance Considerations

- **Script governance:** Uses record.load and multiple searches.
- **Search governance:** Saved search and item searches per order.
- **API limits:** HTTPS call to Suitelet per qualifying save.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Temporary item codes are consistently generated.
- Required fields are enforced for temp items.
- PO creation Suitelet is invoked as expected.

**How we'll measure:**
- Review temp item lines after save.
- Confirm Suitelet receives PO creation calls.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_temporaryitem.js | User Event | Temp item codes, validation, PO prep | Implemented |

### Development Approach

**Phase 1:** Validation and code generation
- [x] Clear temp codes on create/copy.
- [x] Generate codes from saved search index.

**Phase 2:** Vendor and PO integration
- [x] Create vendors when needed.
- [x] Trigger PO Suitelet when required.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add a temp item line with required fields, save, verify temp code and vendor assigned.
2. Save a Sales Order with createpo set, verify Suitelet is called.

**Edge Cases:**
1. Missing required fields on temp item line, verify UI error prevents save.
2. Create/copy Sales Order, verify temp codes are cleared and regenerated.

**Error Handling:**
1. Suitelet call fails, verify error logged and save completes.

### Test Data Requirements
- Items with temp item categories and prefixes configured.
- Vendors or vendor details for creation.

### Sandbox Setup
- Deploy the temp item Suitelet and saved search.

---

## 11. Security & Permissions

### Roles & Permissions
- Users must have access to create vendors and view purchase orders.

### Data Security
- Vendor data is created from line-level details only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Saved search customsearch_sna_hul_tempcode_index is available.
- [ ] Suitelet deployment exists and is active.

### Deployment Steps
1. Deploy User Event to Sales Order and Estimate.
2. Configure script parameters for item categories and prefixes.

### Post-Deployment
- Validate temp code generation and PO creation links.

### Rollback Plan
- Disable the User Event deployment.

---

## 13. Timeline (table)

| Phase | Owner | Duration | Target Date |
|------|-------|----------|-------------|
| Implementation | Jeremy Cady | Unknown | Unknown |
| Validation | Jeremy Cady | Unknown | Unknown |

---

## 14. Open Questions & Risks

### Open Questions
- Should temp codes be regenerated on edit when a code already exists?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Saved search misconfigured | Duplicate or missing codes | Validate search filters and prefixes |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script
- Vendor record creation

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
