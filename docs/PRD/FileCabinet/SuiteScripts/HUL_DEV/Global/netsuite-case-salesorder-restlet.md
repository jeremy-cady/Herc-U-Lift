# PRD: Case Sales Order RESTlet (Filtered)

**PRD ID:** PRD-UNKNOWN-CaseSalesOrderRestlet
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/netsuite-case-salesorder-restlet.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that returns support case details and related sales order line items, filtering lines to specific inventory posting groups.

**What problem does it solve?**
Provides API access to case-linked sales orders while excluding items that do not meet inventory posting group criteria.

**Primary Goal:**
Return case metadata plus filtered sales order lines, or return sales order lines directly by ID.

---

## 2. Goals

1. Fetch a support case and its related sales order.
2. Filter sales order lines by inventory posting group.
3. Support sales-order-only lookup by ID.

---

## 3. User Stories

1. **As an** integration system, **I want to** pull case + relevant sales order lines **so that** downstream processes only process eligible items.
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
5. The system must filter line items based on item field `custitem_sna_inv_posting_grp`:
   - Include when value is `1` or `2` (single or multi-select).
6. The system must return line data that includes:
   - Item, description, quantity, quantity fulfilled
   - Location and `isclosed`
   - Custom columns `custcol_sna_linked_po` (value/text) and `custcol3`
7. The system must skip lines when the item cannot be evaluated.
8. The system must support sales order lookup via `salesOrderId`.
9. GET and POST must return the same response structure.
10. Errors must return an `{ error: true, message }` response.

### Acceptance Criteria

- [ ] Case lookup by case number returns case + filtered sales order lines.
- [ ] Sales order lookup by ID returns filtered lines.
- [ ] Lines are excluded when posting group does not match 1 or 2.
- [ ] Errors returned for missing parameters or not-found cases.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Return unfiltered line items.
- Update any records.
- Provide UI views.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- Single endpoint supports case or sales order lookups with filtered lines.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Support Case
- Sales Order
- Item

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
- Item | `custitem_sna_inv_posting_grp`
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
- Support case search, sales order record load, item lookup fields.

**Data Retention:**
- None; read-only.

### Technical Constraints
- Assumes case number is unique.
- Per-line item lookup may add latency.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Case field `custevent_nx_case_transaction` must contain sales order ID.

### Governance Considerations
- Each line triggers a lookupFields call for item posting group.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Integrations receive only eligible line items.

**How we'll measure:**
- RESTlet logs and integration validation.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| netsuite-case-salesorder-restlet.js | RESTlet | Return case and filtered sales order lines | Implemented |

### Development Approach

**Phase 1:** Case lookup
- [x] Search by case number and return custom fields
- [x] Resolve sales order ID

**Phase 2:** Filtered lines
- [x] Lookup item posting group and include only groups 1 or 2
- [x] Return line-level data for included items

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. GET with `casenumber` returns case + filtered sales order lines.
2. GET with `salesOrderId` returns filtered lines.

**Edge Cases:**
1. Case number not found returns error.
2. Items with posting group not 1 or 2 are excluded.

**Error Handling:**
1. Missing parameters returns guidance message.
2. Item lookup failure logs an error and skips the line.

### Test Data Requirements
- Case with `custevent_nx_case_transaction` set.
- Sales order with mixed posting group items.

### Sandbox Setup
- Ensure item posting group field is populated.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles with RESTlet access.

**Permissions required:**
- View access to support cases, sales orders, and items.

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

1. Upload `netsuite-case-salesorder-restlet.js`.
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

- [ ] Should posting group values be configurable?
- [ ] Should item lookup be optimized (bulk or cached)?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large orders slow response due to per-line lookup | Med | Med | Consider caching or search joins |
| Missing posting group field | Low | Med | Skip line and log error |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Global/netsuite-case-salesorder-restlet-non-filtered version.md

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
