# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-AssetAutoCreation
title: Asset Auto Creation
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_asset_auto_creation.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - salesorder
  - customrecord_nx_asset
  - customrecord_sna_objects
  - customrecord_sna_sales_zone
  - customrecord_sna_hul_resrcpricetable

---

## 1. Overview
User Event that auto-creates or links NextService site and equipment assets from Sales Orders, updates shipping/tax details, and adjusts service line pricing for NXC orders.

---

## 2. Business Goal
Ensures asset records and shipping/tax details stay aligned with Sales Order fulfillment and configuration state.

---

## 3. User Story
- As a fulfillment user, when I auto-create site and equipment assets, I want Sales Orders linked to the correct assets, so that fulfillment is accurate.
- As a billing user, when tax codes and shipping address stay consistent, I want invoices to reflect correct tax treatment, so that billing is accurate.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| User Event afterSubmit | Sales Order create/edit | NXC form or configured rental/equipment lines | Create/link assets, update shipping/tax, update pricing group rates |

---

## 5. Functional Requirements
- Run on Sales Order create/edit afterSubmit.
- When the NXC Sales Order form is used, update `shipaddresslist` to the site asset address and recalculate service line rates based on pricing group.
- For rental/equipment orders, create site assets and equipment assets when the object is configured and ready for delivery.
- Link created assets back to the Sales Order header fields.
- Update tax code and tax flags based on fulfillment method and internal processing rules.
- Use the sales tax helper library to update line tax handling.

---

## 6. Data Contract
### Record Types Involved
- salesorder
- customrecord_nx_asset
- customrecord_sna_objects
- customrecord_sna_sales_zone
- customrecord_sna_hul_resrcpricetable

### Fields Referenced
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

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Object not configured or not ready for delivery does not create assets.
- Site address override prevents address sync.
- Failed asset lookups are logged without blocking save.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Multiple searches and record loads/saves per order.

---

## 9. Acceptance Criteria
- Given configured and ready-for-delivery items, when the User Event runs, then site/equipment assets are created or linked.
- Given assets are created, when the User Event runs, then Sales Orders are updated with `custbody_nx_asset` and `custbody_sna_hul_nxc_eq_asset`.
- Given NXC Sales Orders, when the User Event runs, then service line rates and pricing group fields are updated.
- Given fulfillment method rules, when the User Event runs, then tax codes and tax flags are updated.

---

## 10. Testing Notes
Manual tests:
- Rental/equipment SO line with configured object creates site and equipment assets.
- NXC Sales Order updates ship address and service line rates.
- Object not configured or not ready for delivery does not create assets.
- Site address override prevents address sync.
- Failed asset lookups are logged without blocking save.

---

## 11. Deployment Notes
- Configure script parameters for item/status IDs.
- Deploy User Event on Sales Order.
- Validate asset creation on test orders.

---

## 12. Open Questions / TBDs
- Should asset creation skip if multiple matching site assets exist?

---
