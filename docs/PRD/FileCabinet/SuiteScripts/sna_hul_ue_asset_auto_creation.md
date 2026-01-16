# PRD: Asset Auto Creation

**PRD ID:** PRD-UNKNOWN-AssetAutoCreation
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_asset_auto_creation.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that auto-creates or links NextService site and equipment assets from Sales Orders, updates shipping/tax details, and adjusts service line pricing for NXC orders.

**What problem does it solve?**
Ensures asset records and shipping/tax details stay aligned with Sales Order fulfillment and configuration state.

**Primary Goal:**
Create or link correct site/equipment assets and keep Sales Order address/tax data consistent.

---

## 2. Goals

1. Create site and equipment assets when configured items are ready for delivery.
2. Sync Sales Order asset references and shipping address to site asset when required.
3. Apply pricing group-based service rates on NXC Sales Orders.

---

## 3. User Stories

1. **As a** fulfillment user, **I want to** auto-create site and equipment assets **so that** Sales Orders are linked to the correct assets.
2. **As a** billing user, **I want to** keep tax codes and shipping address consistent **so that** invoices reflect correct tax treatment.

---

## 4. Functional Requirements

### Core Functionality

1. The script must run on Sales Order create/edit afterSubmit.
2. When the NXC Sales Order form is used, the script must update `shipaddresslist` to the site asset address and recalculate service line rates based on pricing group.
3. For rental/equipment orders, the script must create site assets and equipment assets when the object is configured and ready for delivery.
4. The script must link created assets back to the Sales Order header fields.
5. The script must update tax code and tax flags based on fulfillment method and internal processing rules.
6. The script must use the sales tax helper library to update line tax handling.

### Acceptance Criteria

- [ ] Configured and ready-for-delivery items create or link site/equipment assets.
- [ ] Sales Orders are updated with `custbody_nx_asset` and `custbody_sna_hul_nxc_eq_asset` when assets are created.
- [ ] NXC Sales Orders update service line rates and pricing group fields.
- [ ] Tax codes and tax flags are updated per fulfillment method and internal rules.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create assets for unconfigured or not-ready objects.
- Override address if the user explicitly overrides it.
- Validate data completeness beyond required lookups.

---

## 6. Design Considerations

### User Interface
- No UI changes; runs as backend logic on Sales Orders.

### User Experience
- Assets and tax settings update automatically after save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- customrecord_nx_asset
- customrecord_sna_objects
- customrecord_sna_sales_zone
- customrecord_sna_hul_resrcpricetable

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Asset creation and tax updates
- [ ] Client Script - N/A

**Custom Fields:**
- salesorder | custbody_nx_asset | Site asset reference
- salesorder | custbody_sna_hul_nxc_eq_asset | Equipment asset reference
- salesorder | custbody_sn_override_address | Address override flag
- salesorder | custbody_sna_hul_update_rev_stream | Trigger revenue stream updates
- salesorder | custbody_sna_order_fulfillment_method | Fulfillment method for tax
- salesorder | custbody_sna_tax_processed | Tax processed flag
- salesorder | custbody_ava_disable_tax_calculation | Avatax disable flag
- salesorder | shippingtaxcode | Shipping tax code
- salesorder | taxamountoverride | Tax override amount
- salesorder line | custcol_sna_object | Object reference
- salesorder line | custcol_sna_hul_object_configurator | Configuration JSON
- salesorder line | custcol_sna_hul_object_configurator_2 | Configuration JSON
- salesorder line | custcol_sna_service_itemcode | Service code type
- salesorder line | custcol_sna_hul_dollar_disc | Dollar discount
- salesorder line | custcol_sna_hul_perc_disc | Percent discount
- salesorder line | custcol_sna_cpg_resource | Pricing group resource
- salesorder line | custcol_sna_hul_lock_rate | Lock rate flag
- salesorder line | custcol_sna_hul_fleet_no | Fleet number
- salesorder line | custcol_sna_hul_obj_model | Object model
- salesorder line | cseg_sna_hul_eq_seg_display | Equipment segment display
- salesorder line | cseg_hul_mfg | Manufacturer segment
- salesorder line | taxcode | Line tax code
- salesorder line | custcol_ava_taxamount | Line tax amount
- customrecord_nx_asset | custrecord_nxc_na_asset_type | Asset type
- customrecord_nx_asset | custrecord_nx_asset_customer | Customer
- customrecord_nx_asset | custrecord_nx_asset_address_text | Address text
- customrecord_nx_asset | custrecord_nx_asset_region | Region from zip
- customrecord_nx_asset | parent | Parent asset
- customrecord_nx_asset | custrecord_sna_hul_nxcassetobject | Asset object
- customrecord_sna_objects | custrecord_sna_status | Object status
- customrecord_sna_sales_zone | custrecord_sna_hul_nxc_region | Region mapping

**Saved Searches:**
- Asset and address lookup searches built at runtime.

### Integration Points
- Uses `./sna_hul_mod_sales_tax.js` for tax line updates.
- References script parameters for item IDs and status IDs.

### Data Requirements

**Data Volume:**
- One or more asset lookups per Sales Order line.

**Data Sources:**
- Sales Order line data
- Asset and sales zone records

**Data Retention:**
- Creates/updates asset records; updates Sales Order fields.

### Technical Constraints
- Relies on custom form IDs and script parameters for item/status mapping.

### Dependencies
- **Libraries needed:** `./sna_hul_mod_sales_tax.js`
- **External dependencies:** None
- **Other features:** Asset and pricing group configuration

### Governance Considerations

- **Script governance:** Multiple searches and record loads/saves per order.
- **Search governance:** Asset lookups and pricing table searches.
- **API limits:** Moderate on large line counts.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Sales Orders create or link assets correctly and update tax/shipping fields without manual intervention.

**How we'll measure:**
- Audit Sales Orders and asset records for correct linkage and address/tax values.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_asset_auto_creation.js | User Event | Auto-create/link assets and update tax/address | Implemented |

### Development Approach

**Phase 1:** Asset creation logic
- [ ] Validate asset matching and creation rules

**Phase 2:** Tax/address alignment
- [ ] Verify tax code updates and address sync

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Rental/equipment SO line with configured object creates site and equipment assets.
2. NXC Sales Order updates ship address and service line rates.

**Edge Cases:**
1. Object not configured or not ready for delivery does not create assets.
2. Site address override prevents address sync.

**Error Handling:**
1. Failed asset lookups are logged without blocking save.

### Test Data Requirements
- Sales Orders with rental/equipment lines and object configuration JSON.

### Sandbox Setup
- Deploy UE script and set required script parameters.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Sales and fulfillment roles

**Permissions required:**
- Edit Sales Orders
- Create/Edit customrecord_nx_asset

### Data Security
- Asset records should be restricted to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Configure script parameters for item/status IDs

### Deployment Steps

1. Deploy User Event on Sales Order.
2. Validate asset creation on test orders.

### Post-Deployment

- [ ] Monitor logs for asset creation failures

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Manually correct affected Sales Orders.

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

- [ ] Should asset creation skip if multiple matching site assets exist?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect asset linking due to address mismatch | Med | Med | Normalize addresses before compare |

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
