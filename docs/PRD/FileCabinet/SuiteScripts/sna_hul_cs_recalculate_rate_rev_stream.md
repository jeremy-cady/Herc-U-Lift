# PRD: Recalculate Rate and Revenue Stream Client Script

**PRD ID:** PRD-UNKNOWN-RecalculateRateRevStream
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_recalculate_rate_rev_stream.js (Client Script)
- FileCabinet/SuiteScripts/sna_hul_sl_recalc_rate_rev_stream.js (Suitelet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script that recalculates line rates and synchronizes revenue stream and tax settings across Sales Order lines.

**What problem does it solve?**
It removes locked rates, applies a selected revenue stream to all lines, and aligns tax codes based on fulfillment method.

**Primary Goal:**
Normalize line rates and tax configuration when revenue streams are updated.

---

## 2. Goals

1. Clear line-level rate locks to allow recalculation.
2. Apply a header revenue stream to all item lines.
3. Update line tax codes based on fulfillment method and internal tax rules.

---

## 3. User Stories

1. **As a** sales user, **I want** to recalculate rates and revenue streams **so that** pricing and tax are consistent.

---

## 4. Functional Requirements

### Core Functionality

1. When `recalculateRate` is invoked, the script must set `custcol_sna_hul_lock_rate` to false on all item lines.
2. When `updateRevStreamRecalcRate` is invoked, the script must apply header `cseg_sna_revenue_st` to all item lines.
3. The script must call `mod_tax.updateLines` and use its result to determine internal tax behavior.
4. If internal tax is enabled, the script must set line `taxcode` to `-7` and `custcol_ava_taxamount` to `0`.
5. If internal tax is not enabled, the script must set `taxcode` to AvaTax POS or AvaTax based on fulfillment method.
6. The script must set `custbody_ava_disable_tax_calculation` to false, and to true when internal tax is applied.
7. `refreshSuitelet` must redirect to the Suitelet with a refresh action parameter.

### Acceptance Criteria

- [ ] Line rate locks are cleared when recalculation is triggered.
- [ ] Revenue stream and tax codes update consistently across all lines.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Persist custom tax logic outside of line updates.
- Recalculate amounts beyond standard line rate recalculation.

---

## 6. Design Considerations

### User Interface
- No UI changes; actions are invoked by Suitelet buttons or client actions.

### User Experience
- Users see line updates applied consistently after action.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [x] Suitelet - Recalculate rate and revenue stream UI
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Line updates

**Custom Fields:**
- Header | `cseg_sna_revenue_st`
- Header | `custbody_sna_order_fulfillment_method`
- Header | `custbody_ava_disable_tax_calculation`
- Line | `custcol_sna_hul_lock_rate`
- Line | `cseg_sna_revenue_st`
- Line | `taxcode`
- Line | `custcol_ava_taxamount`

**Saved Searches:**
- None.

### Integration Points
- Uses `./sna_hul_mod_sales_tax.js` for tax logic.
- Suitelet `customscript_sna_hul_sl_recalc_rate_revs` for refresh.

### Data Requirements

**Data Volume:**
- Updates all item lines on the Sales Order.

**Data Sources:**
- Sales Order header and line fields.

**Data Retention:**
- Updates Sales Order line fields only.

### Technical Constraints
- Uses `currentRecord.get.promise()` for async line updates.

### Dependencies
- **Libraries needed:** N/search, N/currentRecord, N/url, N/runtime, `./sna_hul_mod_sales_tax.js`.
- **External dependencies:** None.
- **Other features:** AvaTax settings and fulfillment method parameters.

### Governance Considerations
- Client-side line iteration can be heavy for large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Revenue stream and tax codes are synchronized across lines after recalculation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_recalculate_rate_rev_stream.js | Client Script | Recalculate rates and update revenue streams | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Unlock rates and update revenue streams.
- **Phase 2:** Apply tax logic and refresh Suitelet.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Run update and verify revenue stream and tax codes on all lines.

**Edge Cases:**
1. No header revenue stream; lines unchanged.
2. Internal tax enabled; tax codes set to not taxable.

**Error Handling:**
1. Tax module errors should not block line updates.

### Test Data Requirements
- Sales Order with multiple lines and revenue stream set.

### Sandbox Setup
- Deploy client script with Suitelet and tax module available.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Sales users.

**Permissions required:**
- Edit Sales Orders.

### Data Security
- Uses internal Sales Order data only.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm AvaTax parameters and fulfillment method IDs.

### Deployment Steps
1. Upload `sna_hul_cs_recalculate_rate_rev_stream.js`.
2. Deploy to the recalculation Suitelet.

### Post-Deployment
- Validate line updates and tax behavior.

### Rollback Plan
- Remove client script deployment from Suitelet.

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
- [ ] Should the line tax code update occur only for taxable lines?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large line counts slow client updates | Med | Med | Consider server-side processing |

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
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
