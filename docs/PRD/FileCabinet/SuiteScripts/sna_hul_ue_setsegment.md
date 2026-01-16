# PRD: Set Equipment Segments and Tax Codes

**PRD ID:** PRD-UNKNOWN-SetSegment
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_ue_setsegment.js (User Event)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
User Event that assigns equipment segments, manufacturer segments, and responsibility centers on transaction lines, and sets tax codes based on fulfillment method.

**What problem does it solve?**
Ensures transactions carry correct segment values and tax codes without manual entry.

**Primary Goal:**
Automatically populate segment and tax fields on sales orders, estimates, and invoices.

---

## 2. Goals

1. Set equipment, manufacturer, and responsibility center segments based on header or line objects.
2. Apply tax codes based on fulfillment method and internal revenue stream rules.
3. Mark tax processing as complete when tax code is applied.

---

## 3. User Stories

1. **As an** accountant, **I want to** auto-assign segments **so that** reporting stays accurate.

---

## 4. Functional Requirements

### Core Functionality

1. On beforeSubmit (excluding delete), the script must determine the final tax code from fulfillment method parameters.
2. On invoices, the script must call the tax module to update internal revenue stream lines.
3. The script must apply shipping tax code and mark `custbody_sna_tax_processed` when applicable.
4. The script must set line segments from the header object when available.
5. If no header object, the script must set line segments from each line object.
6. The script must set line tax code when applicable and not internal.

### Acceptance Criteria

- [ ] Line segments populate from header or line objects.
- [ ] Tax code and shipping tax code reflect fulfillment method.
- [ ] Internal revenue stream lines are handled via the tax module.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Calculate tax amounts; it only sets tax codes and segments.

---

## 6. Design Considerations

### User Interface
- No UI changes.

### User Experience
- Users see correct segments and tax codes on save.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- salesorder
- estimate
- invoice
- customrecord_sna_objects

**Script Types:**
- [ ] Map/Reduce - N/A
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [x] User Event - Segment and tax assignment
- [ ] Client Script - N/A

**Custom Fields:**
- transaction | custbody_sna_order_fulfillment_method | Fulfillment method
- transaction | custbody_sna_tax_processed | Tax processed flag
- transaction | custbody_sna_equipment_object | Header object
- transaction | shippingtaxcode | Shipping tax code
- transaction line | custcol_sna_hul_fleet_no | Fleet number
- transaction line | custcol_sna_object | Line object
- transaction line | cseg_sna_hul_eq_seg | Equipment segment
- transaction line | cseg_hul_mfg | Manufacturer segment
- transaction line | custcol_sna_resource_res_center | Responsibility center
- customrecord_sna_objects | cseg_sna_hul_eq_seg | Equipment segment
- customrecord_sna_objects | cseg_hul_mfg | Manufacturer segment
- customrecord_sna_objects | custrecord_sna_responsibility_center | Responsibility center

**Saved Searches:**
- Object lookup for line objects.

### Integration Points
- Module: sna_hul_mod_sales_tax.js

### Data Requirements

**Data Volume:**
- Per-line segment assignment on targeted transactions.

**Data Sources:**
- Header object and line object fields.

**Data Retention:**
- Segment and tax code fields saved on transactions.

### Technical Constraints
- Tax code selection depends on script parameter values.

### Dependencies
- **Libraries needed:** sna_hul_mod_sales_tax
- **External dependencies:** None
- **Other features:** Fulfillment method parameters

### Governance Considerations

- **Script governance:** Moderate due to line processing and lookups.
- **Search governance:** Object lookup per transaction.
- **API limits:** Moderate on large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Segment fields are populated correctly on all lines.

**How we'll measure:**
- Validate segment values and tax codes on sample transactions.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_ue_setsegment.js | User Event | Set segments and tax codes | Implemented |

### Development Approach

**Phase 1:** Tax and header object logic
- [ ] Validate fulfillment method tax codes

**Phase 2:** Line segment assignment
- [ ] Validate segment assignment with and without header objects

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Create sales order with header object and verify line segments.
2. Create invoice with ship fulfillment method and verify tax codes.

**Edge Cases:**
1. No header object and missing line objects should leave segments blank.

**Error Handling:**
1. Missing parameter values should log errors without breaking save.

### Test Data Requirements
- Transactions with header objects and line objects.

### Sandbox Setup
- Deploy User Event on sales order, estimate, and invoice.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Accounting and sales roles

**Permissions required:**
- Edit transactions
- View object records

### Data Security
- Segment updates limited to authorized roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Confirm fulfillment method and tax parameter values

### Deployment Steps

1. Deploy User Event on sales order, estimate, and invoice.
2. Validate segment and tax updates.

### Post-Deployment

- [ ] Monitor logs for missing object references

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.
2. Set segments manually as needed.

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

- [ ] Should tax codes be applied for web services contexts?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Incorrect object linkage leads to wrong segments | Med | Med | Validate object references before submit |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 User Event

### External Resources
- None.
