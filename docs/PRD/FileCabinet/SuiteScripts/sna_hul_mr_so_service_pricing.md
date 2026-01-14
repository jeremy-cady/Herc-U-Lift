# PRD: Sales Order Service Pricing

**PRD ID:** PRD-UNKNOWN-SoServicePricing
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_so_service_pricing.js (Map/Reduce)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A Map/Reduce script that adds service resource lines to Sales Orders based on time tracking and pricing rules.

**What problem does it solve?**
Ensures Sales Orders include service resource charges calculated from time tracking, asset data, and pricing tables.

**Primary Goal:**
Append service lines to Sales Orders with correct quantity, unit price, and resource metadata.

---

## 2. Goals

1. Load Sales Orders from a configured search.
2. Pull time tracking details for related tasks.
3. Add service resource lines with computed pricing.

---

## 3. User Stories

1. **As a** service billing user, **I want** service labor lines added automatically **so that** invoicing reflects actual time.

---

## 4. Functional Requirements

### Core Functionality

1. The script must load a Sales Order search from parameter `custscript_sna_so_list_srch`.
2. The script must read task, asset, case, and zip data from each Sales Order result.
3. The script must load a time tracking search from parameter `custscript_sna_time_srch` filtered by task.
4. The script must derive pricing group from Sales Zone by zip code.
5. The script must calculate unit price from the Resource Price Table by pricing group, manufacturer, and responsibility center.
6. The script must add new item lines with service details and calculated amounts.

### Acceptance Criteria

- [ ] Sales Orders receive new service resource lines.
- [ ] Quantities reflect time tracking hours converted to decimal.
- [ ] Unit price and amount reflect the resource price table.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Adjust existing Sales Order lines.
- Validate time tracking data beyond task linkage.

---

## 6. Design Considerations

### User Interface
- None; backend Sales Order updates.

### User Experience
- Service charges appear automatically on Sales Orders.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order (`salesorder`)
- Time Tracking (search results)
- Custom Record | `customrecord_sna_objects`
- Custom Record | `customrecord_sna_sales_zone`
- Custom Record | `customrecord_sna_hul_resrcpricetable`

**Script Types:**
- [x] Map/Reduce - Service line creation
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order | `custbody_nx_task`
- Sales Order | `custbody_nx_case`
- Sales Order | `custbody_nx_asset`
- Sales Order | `shipzip`
- Sales Order Item | `custcol_sna_cpg_resource`
- Sales Order Item | `custcol_nxc_case`
- Sales Order Item | `custcol_nx_asset`
- Sales Order Item | `custcol_nx_task`
- Sales Order Item | `custcol_sna_so_service_code_type`
- Sales Order Item | `custcol_sna_object`
- Sales Order Item | `custcol_sna_resource_res_center`
- Sales Order Item | `custcol_sna_resource_manuf`
- Sales Order Item | `custcol_sna_hul_newunitcost`

**Saved Searches:**
- Search from parameter `custscript_sna_so_list_srch`.
- Search from parameter `custscript_sna_time_srch`.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Processes Sales Orders returned by search; adds lines per time tracking results.

**Data Sources:**
- Sales Orders, time tracking search, asset objects, pricing tables.

**Data Retention:**
- No data retention beyond Sales Order updates.

### Technical Constraints
- Requires valid asset object and time tracking data.

### Dependencies

**Libraries needed:**
- None.

**External dependencies:**
- None.

**Other features:**
- Pricing configuration in `customrecord_sna_hul_resrcpricetable`.

### Governance Considerations
- Adds lines dynamically; each Sales Order save consumes usage.

---

## 8. Success Metrics

- Service resource lines are added with correct pricing for each task.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_so_service_pricing.js | Map/Reduce | Add service pricing lines to Sales Orders | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Resolve task, asset, and pricing group inputs.
- **Phase 2:** Add item lines and save Sales Orders.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Sales Order with valid task/time tracking creates service lines with correct amounts.

**Edge Cases:**
1. No time tracking results results in no added lines.

**Error Handling:**
1. Missing asset object or pricing data logs errors without crashing the run.

### Test Data Requirements
- Sales Orders tied to tasks with time tracking data.

### Sandbox Setup
- Ensure Sales Zone and Resource Price Table records are configured.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admin or service billing roles.

**Permissions required:**
- Edit Sales Orders and access custom records.

### Data Security
- Internal service pricing data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Configure search parameters for Sales Orders and time tracking.

### Deployment Steps
1. Upload `sna_hul_mr_so_service_pricing.js`.
2. Deploy Map/Reduce with parameters.

### Post-Deployment
- Verify service lines on a sample Sales Order.

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
- [ ] Should non-resource service code types be excluded from pricing logic?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Pricing table mismatch by zip or manufacturer | Med | High | Validate pricing table coverage |

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
