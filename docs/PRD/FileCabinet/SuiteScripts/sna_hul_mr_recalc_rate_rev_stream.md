# PRD: Recalculate Rates by Revenue Stream

**PRD ID:** PRD-UNKNOWN-RecalcRateRevStream
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_recalc_rate_rev_stream.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that recalculates Sales Order line rates and pricing based on the selected Revenue Stream and pricing tables, with planned maintenance handling.

**What problem does it solve?**
Ensures Sales Order pricing and taxes stay consistent with Revenue Stream rules, item categories, and location markup logic.

**Primary Goal:**
Recompute line pricing, update Revenue Stream values, and track processing status on a custom record.

---

## 2. Goals

1. Load a Sales Order and update line pricing based on Revenue Stream configuration.
2. Add or update planned maintenance line items when required.
3. Track progress and completion status in a processing custom record.

---

## 3. User Stories

1. **As a** service coordinator, **I want** Sales Order pricing to update when the Revenue Stream changes **so that** billing is accurate.
2. **As an** operations user, **I want** planned maintenance lines auto-added **so that** required charges are not missed.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load the target Sales Order from parameter `custscript_sna_hul_so_id`.
2. The script must use parameters (item categories, service items, planned maintenance) to control pricing logic.
3. The script must read Revenue Stream from `cseg_sna_revenue_st` or fallback to the linked Support Case.
4. The script must add or update a planned maintenance line when the Revenue Stream indicates it.
5. The script must recalculate item line pricing, markup, and price levels using custom pricing tables.
6. The script must update line Revenue Stream values when the action type is `updateRevStreamRecalcRate`.
7. The script must update the processing tracker record (`customrecord_sna_hul_so_lines_processed`) every 5 lines and on completion/failure.
8. The script must apply internal tax handling via `sna_hul_mod_sales_tax.updateLines` and set tax overrides accordingly.

### Acceptance Criteria

- [ ] Sales Order lines show recalculated rates and amounts based on Revenue Stream.
- [ ] Planned maintenance line is added or updated when required.
- [ ] Processing tracker record shows completed or failed status.
- [ ] Tax overrides are set when internal tax is detected.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create new Sales Orders.
- Replace pricing logic in other scripts or workflows.
- Modify historical transactions beyond the target Sales Order.

---

## 6. Design Considerations

### User Interface
- None; backend pricing recalculation.

### User Experience
- Users see updated pricing and planned maintenance lines after the script completes.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)
- Support Case (`supportcase`)
- Custom Record | `customrecord_cseg_sna_revenue_st`
- Custom Record | `customrecord_cseg_sna_hul_eq_seg`
- Custom Record | `customrecord_sna_hul_so_lines_processed`
- Custom Record | `customrecord_sna_hul_locationmarkup`
- Custom Record | `customrecord_sna_hul_vendorprice`
- Custom Record | `customrecord_sna_hul_itempricelevel`
- Custom Record | `customrecord_sna_service_code_type`
- Custom Record | `customrecord_sna_hul_resrcpricetable`
- Custom Record | `customrecord_sna_sales_zone`

**Script Types:**
- [x] Map/Reduce - Pricing recalculation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `cseg_sna_revenue_st`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_task`
- Sales Order | `custbody_ava_disable_tax_calculation`
- Sales Order | `taxamountoverride`
- Sales Order | `custbody_sna_hul_location`
- Sales Order Item | `cseg_sna_revenue_st`
- Sales Order Item | `custcol_ava_taxamount`
- Sales Order Item | `taxcode`
- Sales Order Item | `custcol_sna_hul_dollar_disc`
- Sales Order Item | `custcol_sna_hul_perc_disc`
- Sales Order Item | `custcol_sna_hul_itemcategory`
- Sales Order Item | `custcol_sna_hul_gen_prodpost_grp`
- Sales Order Item | `custcol_sna_service_itemcode`
- Sales Order Item | `custcol_sna_hul_loc_markup`
- Sales Order Item | `custcol_sna_hul_list_price`
- Sales Order Item | `custcol_sna_hul_replacementcost`
- Sales Order Item | `custcol_sna_hul_item_pricelevel`
- Sales Order Item | `custcol_sna_hul_cumulative_markup`
- Sales Order Item | `custcol_sna_hul_newunitcost`
- Sales Order Item | `custcolsna_hul_newunitcost_wodisc`
- Sales Order Item | `custcol_sna_hul_list_price_prev`
- Sales Order Item | `custcol_sna_hul_replacementcost_prev`
- Sales Order Item | `custcol_sna_work_code`
- Sales Order Item | `custcol_sna_repair_code`
- Sales Order Item | `custcol_sna_group_code`
- Sales Order Item | `custcol_nxc_case`
- Sales Order Item | `custcol_nx_task`
- Sales Order Item | `custcol_nx_asset`
- Sales Order Item | `custcol_nxc_equip_asset`
- Sales Order Item | `custcol_sna_sales_description`
- Sales Order Item | `custcol_sna_so_service_code_type`
- Sales Order Item | `custcol_sna_hul_fleet_no`
- Revenue Stream | `custrecord_sna_hul_pnrevstream`
- Revenue Stream | `custrecord_sna_hul_flatrate`
- Revenue Stream | `custrecord_sna_price_calculation`
- Revenue Stream | `custrecord_sna_surcharge`
- SO Processing Tracker | `custrecord_sna_hul_so_lines_processed`
- SO Processing Tracker | `custrecord_sna_hul_process_status`

**Saved Searches:**
- None (searches are created in script).

### Integration Points
- `./sna_hul_ue_pm_pricing_matrix`
- `./sna_hul_mod_sales_tax.js`

### Data Requirements

**Data Volume:**
- Processes one Sales Order at a time; iterates all item lines.

**Data Sources:**
- Sales Order, Support Case, Revenue Stream custom records, pricing tables.

**Data Retention:**
- No data retention beyond normal record updates.

### Technical Constraints
- Requires dynamic record loading for line-level updates.

### Dependencies

**Libraries needed:**
- `sna_hul_ue_pm_pricing_matrix`
- `sna_hul_mod_sales_tax.js`

**External dependencies:**
- None.

**Other features:**
- Depends on Revenue Stream and pricing custom record configuration.

### Governance Considerations
- Updates progress every 5 lines to reduce reprocessing risk.

---

## 8. Success Metrics

- Sales Orders show correct line pricing based on Revenue Stream.
- Planned maintenance lines are consistently applied when required.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_recalc_rate_rev_stream.js | Map/Reduce | Recalculate SO line pricing by Revenue Stream | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Load Sales Order and determine Revenue Stream and pricing inputs.
- **Phase 2:** Update line pricing, taxes, and processing tracker status.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales Order with Revenue Stream updates all line rates and amounts.
2. Planned maintenance line is added with correct quantity and rate.

**Edge Cases:**
1. Sales Order without Revenue Stream falls back to Support Case Revenue Stream.
2. Lines with missing pricing data are handled without script failure.

**Error Handling:**
1. Invalid Sales Order ID marks processing status as failed.

### Test Data Requirements
- Sales Orders with Revenue Stream, case, and multiple item lines.

### Sandbox Setup
- Ensure pricing tables and Revenue Stream configurations are available.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or pricing operations role.

**Permissions required:**
- Edit Sales Orders and related custom records.

### Data Security
- Internal pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure script parameters for item categories and planned maintenance item.

### Deployment Steps
1. Upload `sna_hul_mr_recalc_rate_rev_stream.js`.
2. Deploy Map/Reduce with required parameters.

### Post-Deployment
- Validate pricing updates on a sample Sales Order.

### Rollback Plan
- Disable the script deployment.

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
- [ ] Which pricing tables are authoritative when multiple matches exist?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect pricing due to missing configuration | Med | High | Validate pricing tables before execution |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x Map/Reduce

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
