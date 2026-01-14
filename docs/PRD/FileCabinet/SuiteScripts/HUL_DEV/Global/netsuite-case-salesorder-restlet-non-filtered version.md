# PRD: Case Sales Order RESTlet (Non-Filtered)

**PRD ID:** PRD-UNKNOWN-CaseSalesOrderRestletNF
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/netsuite-case-salesorder-restlet-non-filtered version.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that returns support case details and associated sales order line items, without additional filtering on lines.

**What problem does it solve?**
Provides API access to case-linked sales order data for downstream integrations or reporting.

**Primary Goal:**
Return case metadata plus related sales order header and line details, or return sales order lines directly by ID.

---

## 2. Goals

1. Fetch a support case and its related sales order.
2. Return full sales order line data.
3. Support sales-order-only lookup by ID.

---

## 3. User Stories

1. **As an** integration system, **I want to** pull case + sales order details **so that** downstream processes can be updated.
2. **As a** support analyst, **I want** case asset/location fields **so that** I can reconcile service information.
3. **As an** integration system, **I want** sales order lines by order ID **so that** I can sync line-level data.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept `casenumber` or `case` to look up a support case.
2. The system must return case fields:
   - `internalid`
   - `casenumber`
   - `custevent_nxc_case_assets`
   - `custevent_sna_hul_caselocation`
   - `custevent_nx_case_transaction`
3. The system must load the related sales order when `custevent_nx_case_transaction` is present.
4. The system must return sales order header fields:
   - `tranid`
   - `entity` / `entity` text
   - `trandate`
   - `status` / status text
5. The system must return all line items from the sales order item sublist.
6. Line data must include:
   - Item, description, quantity, quantity fulfilled
   - Location and `isclosed`
   - Custom columns `custcol_sna_linked_po` (value/text) and `custcol3`
7. The system must support sales order lookup via `salesOrderId`.
8. GET and POST must return the same response structure.
9. Errors must return an `{ error: true, message }` response.

### Acceptance Criteria

- [ ] Case lookup by case number returns case and sales order data when present.
- [ ] Sales order lookup by ID returns header and line details.
- [ ] Line items include custom PO link fields.
- [ ] Errors returned for missing parameters or not-found cases.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Filter out closed or fulfilled sales order lines.
- Update any records.
- Provide UI views.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- Single endpoint supporting case or sales order lookups.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Sales Order

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [x] RESTlet - Case and sales order data retrieval
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Case | `custevent_nxc_case_assets`
- Case | `custevent_sna_hul_caselocation`
- Case | `custevent_nx_case_transaction`
- Sales Order Line | `custcol_sna_linked_po`
- Sales Order Line | `custcol3`

**Saved Searches:**
- None (search/load used).

### Integration Points
- External systems requesting case/order data via REST.

### Data Requirements

**Data Volume:**
- Single case or sales order per request.

**Data Sources:**
- Support case search and sales order record load.

**Data Retention:**
- None; read-only.

### Technical Constraints
- Assumes case number is unique.
- Loads full sales order and all lines (no filtering).

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case field `custevent_nx_case_transaction` must contain sales order ID.

### Governance Considerations
- Record loads per request; potential impact for large orders.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Integrations receive accurate case and sales order details.

**How we'll measure:**
- RESTlet logs and integration validation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| netsuite-case-salesorder-restlet-non-filtered version.js | RESTlet | Return case and sales order lines | Implemented |

### Development Approach

**Phase 1:** Case lookup
- [x] Search by case number and return custom fields
- [x] Resolve sales order ID

**Phase 2:** Sales order lines
- [x] Load sales order and return line-level fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. GET with `casenumber` returns case + sales order lines.
2. GET with `salesOrderId` returns order lines only.

**Edge Cases:**
1. Case number not found returns error.
2. Case without a sales order returns case data and empty lines.

**Error Handling:**
1. Missing parameters returns guidance message.
2. Sales order load failure returns error object.

### Test Data Requirements
- Case with `custevent_nx_case_transaction` set.
- Sales order with line items and custom columns.

### Sandbox Setup
- Ensure case and sales order test records exist.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles with RESTlet access.

**Permissions required:**
- View access to support cases and sales orders.

### Data Security
- Limit RESTlet deployment to trusted roles.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] All tests passing in sandbox
- [ ] Documentation updated (scripts commented, README updated)
- [ ] PRD_SCRIPT_INDEX.md updated
- [ ] Stakeholder approval obtained
- [ ] User training materials prepared (if needed)

### Deployment Steps

1. Upload `netsuite-case-salesorder-restlet-non-filtered version.js`.
2. Create RESTlet script record and deploy.
3. Assign role permissions for integrations.

### Post-Deployment

- [ ] Monitor RESTlet usage and error logs.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the RESTlet deployment.

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

- [ ] Should line filtering (open/closed) be added for performance?
- [ ] Should the RESTlet return additional case fields?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large sales orders increase response time | Med | Med | Consider pagination or filtering |
| Missing sales order link on case | Med | Low | Return case data only |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.1 RESTlet
- Record and Search APIs

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Unknown | 1.0 | Initial draft |
