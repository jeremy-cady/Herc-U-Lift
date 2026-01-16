# PRD: Sales Order Update Lines

**PRD ID:** PRD-UNKNOWN-SoUpdateLines
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_so_update_lines.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Updates sales order and estimate line fields using NextService asset data, pricing group, revenue stream, and resource price tables.

**What problem does it solve?**
Keeps line-level equipment/manufacturer segments, resource pricing, and quantities consistent with NextService asset context and pricing rules.

**Primary Goal:**
Synchronize revenue stream, equipment segments, resource rates, and quantities after transaction save.

---

## 2. Goals

1. Source manufacturer, fleet, and equipment category from NextService assets.
2. Set or retain revenue stream on header and lines based on context.
3. Calculate resource line rates and amounts from pricing tables and discounts.

---

## 3. User Stories

1. **As a** service coordinator, **I want to** auto-fill equipment segments **so that** line data matches the asset context.
2. **As a** pricing admin, **I want to** apply resource pricing tables **so that** labor rates are consistent.
3. **As a** user, **I want to** retain revenue streams on edit **so that** pricing stays aligned.

---

## 4. Functional Requirements

### Core Functionality

1. On create (non-UI context) when created from another record, the system must copy quantity into custcol_sna_quoted_qty for each line.
2. On beforeSubmit, the system must call pmPricingBeforeSubmit in the pricing matrix library.
3. On afterSubmit for create/edit/xedit, the system must load the transaction and evaluate NextService asset and case data.
4. When revenue stream is empty on sales orders, the system must source it from the NextService case and set it on the header.
5. On afterSubmit, the system must set line-level revenue stream based on context (suitelet/scheduled/mapreduce or update flag).
6. For resource service code type lines, the system must compute rate using customrecord_sna_hul_resrcpricetable and apply dollar/percent discounts.
7. For resource lines, the system must set quantity to finalQty (actual vs quoted logic) and lock the rate.
8. After updates, the system must clear custbody_sna_hul_update_rev_stream and save the transaction.
9. On afterSubmit, the system must call pmPricingAfterSubmit in the pricing matrix library.

### Acceptance Criteria

- [ ] Resource lines have rate and amount updated from the price table when not locked or overridden.
- [ ] Line revenue stream is set based on context or update flag.
- [ ] Header revenue stream is set from the NextService case when missing.
- [ ] custcol_sna_quoted_qty is populated on create-from in supported contexts.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update responsibility center (logic removed/commented).
- Apply pricing for non-resource service code types.
- Modify rental or equipment order forms for fleet assignment.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Updates are applied after submit to cover non-UI entry contexts.

### Design References
- Pricing matrix library: sna_hul_ue_pm_pricing_matrix.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Estimate
- Support Case
- Custom record: customrecord_nx_asset
- Custom record: customrecord_sna_hul_resrcpricetable
- Custom segment: customrecord_cseg_sna_revenue_st

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Line updates
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction header | cseg_sna_revenue_st | Header revenue stream
- Transaction header | custbody_nx_asset | NextService asset
- Transaction header | custbody_nx_case | NextService case
- Transaction header | custbody_sna_equipment_object | Equipment object (estimate)
- Transaction header | custbody_sna_hul_update_rev_stream | Update flag
- Item line | cseg_sna_revenue_st | Line revenue stream
- Item line | cseg_hul_mfg | Manufacturer segment
- Item line | cseg_sna_hul_eq_seg | Equipment segment
- Item line | custcol_sna_hul_fleet_no | Fleet number
- Item line | custcol_sna_quoted_qty | Quoted quantity
- Item line | custcol_sna_hul_act_service_hours | Actual service hours
- Item line | custcol_sna_used_qty_exc | Used qty exception flag
- Item line | custcol_sna_time_posted | Time posted flag
- Item line | custcol_sna_amt_manual | Override rate flag
- Item line | custcol_sna_service_itemcode | Service code type
- Item line | custcol_sna_hul_dollar_disc | Dollar discount
- Item line | custcol_sna_hul_perc_disc | Percent discount
- Item line | custcol_sna_cpg_resource | Pricing group
- Item line | custcol_sna_hul_newunitcost | New unit cost
- Item line | custcol_sna_hul_lock_rate | Lock rate

**Saved Searches:**
- None (script uses ad hoc searches and lookups)

### Integration Points
- NextService asset and case records
- Pricing matrix library: FileCabinet/SuiteScripts/sna_hul_ue_pm_pricing_matrix

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- NextService asset and case fields
- Resource price table records

**Data Retention:**
- Updates persisted on transaction lines.

### Technical Constraints
- Revenue stream update is context-dependent and can be gated by custbody_sna_hul_update_rev_stream.
- Resource price lookup may fall back to parent revenue stream when no direct match.

### Dependencies
- **Libraries needed:** FileCabinet/SuiteScripts/sna_hul_ue_pm_pricing_matrix
- **External dependencies:** None
- **Other features:** Resource price table custom record

### Governance Considerations

- **Script governance:** Loads and saves the transaction; multiple lookups per line.
- **Search governance:** Multiple lookupFields and searches per transaction.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Resource lines match expected price table rates and quantities.
- Revenue stream is correctly sourced and applied to lines.

**How we'll measure:**
- Validate line rates and segments on sample orders.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_so_update_lines.js | User Event | Sync segments, revenue stream, and resource rates | Implemented |

### Development Approach

**Phase 1:** Asset and revenue stream sourcing
- [x] Source manufacturer, fleet, and revenue stream.

**Phase 2:** Pricing updates
- [x] Compute resource rates and update quantities.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create a sales order linked to NextService asset/case, verify segments and revenue stream set.
2. Save a resource line with discounts, verify rate and amount updated.

**Edge Cases:**
1. Revenue stream missing, verify parent revenue stream fallback for pricing.
2. Override rate flag set, verify rate is not updated.

**Error Handling:**
1. Missing asset data, verify script logs error but saves.

### Test Data Requirements
- NextService asset and case with revenue stream.
- Resource price table records with and without CPG/equipment matches.

### Sandbox Setup
- Deploy User Event and ensure pricing matrix library is available.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to sales orders, support cases, and custom records.

### Data Security
- Writes only to the current transaction.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Pricing matrix library deployed.
- [ ] Resource price table custom records populated.

### Deployment Steps
1. Deploy User Event on Sales Order and Estimate.
2. Configure script parameters in pricing matrix library as needed.

### Post-Deployment
- Validate a sales order created from NextService.

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
- Should revenue stream updates be restricted to specific execution contexts only?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing price table matches | Zero rate assigned | Validate price table coverage |

---

## 15. References & Resources

### Related PRDs
- None

### NetSuite Documentation
- User Event Script

### External Resources
- None

---

## Revision History (table)

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | Unknown | Jeremy Cady | Initial PRD |
