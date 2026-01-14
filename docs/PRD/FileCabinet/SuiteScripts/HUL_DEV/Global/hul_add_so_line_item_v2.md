# PRD: Add Sales Order Line Item RESTlet (v2)

**PRD ID:** PRD-UNKNOWN-AddSOLineItemV2
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Unknown
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Global/hul_add_so_line_item_v2.js (RESTlet)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A RESTlet that adds a line item to a Sales Order and links it to a Purchase Order via a custom line field.

**What problem does it solve?**
Provides a simple API for external systems to append items to Sales Orders without manual UI edits.

**Primary Goal:**
Insert a Sales Order line with item, quantity, and linked PO reference.

---

## 2. Goals

1. Validate required inputs (salesOrderId, poId, itemId).
2. Add a new item line to the Sales Order.
3. Set `custcol_sna_linked_po` on the line.

---

## 3. User Stories

1. **As an** integration developer, **I want to** add SO lines via REST **so that** I can automate order updates.
2. **As a** purchasing user, **I want to** link a PO to the SO line **so that** procurement is traceable.
3. **As an** admin, **I want to** keep the API lightweight **so that** it’s easy to maintain.

---

## 4. Functional Requirements

### Core Functionality

1. The system must accept POST requests with:
   - `salesOrderId`
   - `poId`
   - `itemId`
   - `quantity` (optional, default 1)
2. The system must load the Sales Order in dynamic mode.
3. The system must add a new line in the `item` sublist and set:
   - `item`
   - `quantity`
   - `custcol_sna_linked_po`
4. The system must save the Sales Order and return the saved ID.
5. The system must return error messages on failure.

### Acceptance Criteria

- [ ] Missing required fields returns `success: false`.
- [ ] New line is appended with item, quantity, and linked PO.
- [ ] Response returns `success: true` and saved ID.
- [ ] Errors return `success: false` with message.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Update existing lines.
- Validate item availability or pricing.
- Handle multiple lines in a single request.

---

## 6. Design Considerations

### User Interface
- None (REST API).

### User Experience
- Simple JSON request/response contract.

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
- [ ] Suitelet - Not used
- [x] RESTlet - Add SO line
- [ ] User Event - Not used
- [ ] Client Script - Not used

**Custom Fields:**
- Sales Order Line | `custcol_sna_linked_po` | Linked Purchase Order

**Saved Searches:**
- None.

### Integration Points
- External systems can call the RESTlet to add lines.

### Data Requirements

**Data Volume:**
- One line per request.

**Data Sources:**
- Sales Order record.

**Data Retention:**
- N/A.

### Technical Constraints
- Uses dynamic mode to add lines.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** `custcol_sna_linked_po` must exist on SO line.

### Governance Considerations
- Single record load and save per request.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- SO lines are added reliably through the RESTlet.
- PO link is present on the new line.

**How we'll measure:**
- Spot checks of updated Sales Orders and integration logs.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_add_so_line_item_v2.js | RESTlet | Add SO line and link PO | Implemented |

### Development Approach

**Phase 1:** RESTlet endpoint
- [x] Validate required inputs
- [x] Add line and save record

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. POST with valid IDs adds a line and returns success.

**Edge Cases:**
1. Missing itemId → error response.
2. Invalid salesOrderId → error response.

**Error Handling:**
1. Record load/save failures return error messages.

### Test Data Requirements
- Test Sales Orders, items, and PO IDs.

### Sandbox Setup
- Deploy RESTlet and test with RESTlet tester.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Integration roles calling the RESTlet.

**Permissions required:**
- Edit Sales Orders.
- Access to item and custom line fields.

### Data Security
- Restrict RESTlet role to trusted integrations.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Tests passing in sandbox
- [ ] Documentation updated

### Deployment Steps

1. Deploy RESTlet and assign integration role.
2. Validate line creation on sample orders.

### Post-Deployment

- [ ] Monitor for integration errors.

### Rollback Plan

**If deployment fails:**
1. Disable RESTlet deployment.

---

## 13. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Development Complete | | | |
| Deployment | | | |

---

## 14. Open Questions & Risks

### Open Questions

- [ ] Should this support multiple lines per request?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Invalid IDs cause repeated errors | Medium | Low | Add pre-validation upstream |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.x RESTlet docs.
- record.load/save references.

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Unknown | 1.0 | Initial implementation |
