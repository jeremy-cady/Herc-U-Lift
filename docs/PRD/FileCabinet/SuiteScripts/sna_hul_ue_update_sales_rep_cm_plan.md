# PRD: Update Sales Rep Commission Plan on SO Lines

**PRD ID:** PRD-UNKNOWN-UpdateSalesRepCmPlan
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_update_sales_rep_cm_plan.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Assigns sales rep, sales rep matrix, and commission details on sales order lines based on customer matrix mappings.

**What problem does it solve?**
Ensures line-level commission fields reflect customer, item, and revenue stream criteria at save time.

**Primary Goal:**
Populate commission-related line fields using customer sales rep matrix mapping rules.

---

## 2. Goals

1. Match customer matrix entries by zip, equipment category, revenue stream, and manufacturer.
2. Set line sales rep and commission plan fields.
3. Calculate commission amount using revenue or gross margin rules.

---

## 3. User Stories

1. **As a** sales manager, **I want to** auto-assign sales reps by matrix rules **so that** commissions are accurate.
2. **As a** finance user, **I want to** calculate commission amounts **so that** payouts are consistent.
3. **As an** admin, **I want to** use line-level eligibility flags **so that** commissions apply only where allowed.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit (non-delete), the system must load customer matrix records for the transaction customer.
2. The system must determine the ship-to zip code (from shipaddresslist) and item details (equipment category, revenue stream, manufacturer, eligibility).
3. The system must select a matrix entry matching zip, equipment category, and revenue stream, and prefer manufacturer match when available.
4. The system must set custcol_sna_sales_rep and custcol_sna_sales_rep_matrix for matching lines.
5. When item is eligible for commission, the system must set commission plan, rate, and type fields.
6. The system must calculate commission amount as gross margin or revenue based on commission type.

### Acceptance Criteria

- [ ] Sales rep and matrix id are set on matching lines.
- [ ] Commission fields are populated for eligible items.
- [ ] Commission amount is calculated according to commission type.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Create or update customer matrix records.
- Handle commission calculations outside line amount and cost estimate.
- Validate sales rep eligibility beyond matrix selection.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Commission fields are set during save.

### Design References
- Custom record: customrecord_sna_salesrep_matrix_mapping

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Sales Order
- Customer
- Item
- Employee
- Custom record: customrecord_sna_salesrep_matrix_mapping

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Commission field updates
- [ ] Client Script - N/A

**Custom Fields:**
- Transaction header | shipaddresslist | Shipping address id
- Item line | custcol_sna_sales_rep | Sales rep
- Item line | custcol_sna_sales_rep_matrix | Matrix record id
- Item line | custcol_sna_hul_eligible_for_comm | Eligible for commission
- Item line | custcol_sna_hul_comm_rate | Commission rate
- Item line | custcol_sna_hul_sales_rep_comm_type | Commission type
- Item line | custcol_sna_commission_plan | Commission plan
- Item line | custcol_sna_commission_amount | Commission amount
- Item | cseg_sna_hul_eq_seg | Equipment category
- Item | cseg_sna_revenue_st | Revenue stream
- Item | cseg_hul_mfg | Manufacturer
- Item | custitem_sna_hul_eligible_for_comm | Eligible for commission
- Employee | custentity_sna_sales_rep_tran_assignedon | Assignment date

**Saved Searches:**
- None (ad hoc search for matrix entries)

### Integration Points
- Customer matrix custom record

### Data Requirements

**Data Volume:**
- Per transaction, all item lines.

**Data Sources:**
- Customer matrix mappings, item segments, shipping address zip.

**Data Retention:**
- Commission fields persisted on line.

### Technical Constraints
- Zip matching uses exact value from address record.
- Sales rep selection uses earliest assigned-on date.

### Dependencies
- **Libraries needed:** None
- **External dependencies:** None
- **Other features:** Customer sales rep matrix setup

### Governance Considerations

- **Script governance:** Multiple searches per transaction.
- **Search governance:** Matrix and customer address searches.
- **API limits:** None.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Commission fields are correctly populated on qualifying lines.
- Commission amounts match configured rates and types.

**How we'll measure:**
- Compare line commission values against matrix configuration.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_update_sales_rep_cm_plan.js | User Event | Populate sales rep and commission fields | Implemented |

### Development Approach

**Phase 1:** Matrix matching
- [x] Match by zip, equipment category, revenue stream, and manufacturer.

**Phase 2:** Commission calculation
- [x] Set fields and calculate commission amount.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Save a sales order with matching matrix entry, verify rep and commission fields.

**Edge Cases:**
1. No matching matrix entry, verify no changes.
2. Item not eligible for commission, verify commission fields not set.

**Error Handling:**
1. Missing address zip, verify script logs error and skips.

### Test Data Requirements
- Customer matrix records with varying zip, equipment, and rev stream.
- Items with eligibility flags.

### Sandbox Setup
- Deploy User Event on sales order.

---

## 11. Security & Permissions

### Roles & Permissions
- Users need access to sales orders, customer addresses, items, and matrix records.

### Data Security
- Only line-level commission fields are updated.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- [ ] Customer matrix records populated with commission plan data.

### Deployment Steps
1. Deploy User Event to sales order.

### Post-Deployment
- Validate commission fields on a sample order.

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
- Should zip matching use 5-digit prefix as in customer matrix maintenance?

### Known Risks (table)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Matrix mismatch | No commission assigned | Validate matrix data quality |

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
