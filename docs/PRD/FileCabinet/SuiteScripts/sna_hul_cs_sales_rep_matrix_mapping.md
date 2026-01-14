# PRD: Sales Rep Matrix Mapping Client Script

**PRD ID:** PRD-UNKNOWN-SalesRepMatrixMapping
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_cs_sales_rep_matrix_mapping.js (Client Script)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A client script on the Sales Rep Matrix Customer Mapping record that forces the override flag when editing a Sales Rep mapping.

**What problem does it solve?**
It ensures override logic is preserved when editing mapping records via a special URL parameter.

**Primary Goal:**
Set the override checkbox automatically when edit mode is triggered with the `editSalesRep` parameter.

---

## 2. Goals

1. Auto-set the override flag during edit flow.
2. Reload the record with `editSalesRep=T` when override is enabled.

---

## 3. User Stories

1. **As an** admin, **I want** override mode preserved when editing **so that** mapping updates are intentional.

---

## 4. Functional Requirements

### Core Functionality

1. On page init, if URL parameter `editSalesRep` is `T`, the script must set `custrecord_salesrep_mapping_override` to true.
2. When `custrecord_salesrep_mapping_override` changes to true, the script must reload the record in edit mode with `editSalesRep=T` in the URL.

### Acceptance Criteria

- [ ] Override flag is set automatically when editing with `editSalesRep=T`.
- [ ] Enabling override refreshes the record in edit mode.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Validate sales rep mappings.
- Update any related transaction data.

---

## 6. Design Considerations

### User Interface
- Uses URL parameters to control override behavior.

### User Experience
- Users editing mapping records see override automatically enabled.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Custom Record | Sales Rep Matrix Customer Mapping

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [ ] User Event - Not used
- [x] Client Script - Mapping override control

**Custom Fields:**
- `custrecord_salesrep_mapping_override`

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- Single record update per edit.

**Data Sources:**
- URL parameter and record field value.

**Data Retention:**
- Updates the mapping record only.

### Technical Constraints
- Relies on browser URL parameter `editSalesRep`.

### Dependencies
- **Libraries needed:** N/url.
- **External dependencies:** None.
- **Other features:** Mapping record edit flow.

### Governance Considerations
- Client-side only.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Override mode persists during edits of mapping records.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_cs_sales_rep_matrix_mapping.js | Client Script | Enable override on mapping edit | Implemented |

### Development Approach (Phase 1/Phase 2)
- **Phase 1:** Add page init override behavior.
- **Phase 2:** Add edit-mode reload on override change.

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open mapping record with `editSalesRep=T` and verify override is checked.

**Edge Cases:**
1. Toggle override without URL parameter; record reloads with parameter.

**Error Handling:**
1. Missing record ID should prevent reload.

### Test Data Requirements
- Sales rep mapping record available for edit.

### Sandbox Setup
- Deploy client script to the mapping record.

---

## 11. Security & Permissions

### Roles & Permissions
**Roles that need access:**
- Admins managing sales rep mappings.

**Permissions required:**
- Edit mapping records.

### Data Security
- No sensitive data handled.

---

## 12. Deployment Plan

### Pre-Deployment Checklist
- Confirm mapping record deployment.

### Deployment Steps
1. Upload `sna_hul_cs_sales_rep_matrix_mapping.js`.
2. Deploy to the Sales Rep Matrix Customer Mapping record.

### Post-Deployment
- Verify override flag behavior on edit.

### Rollback Plan
- Remove client script deployment.

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
- [ ] Should override be set only when editing specific fields?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| URL param removed by navigation | Low | Low | Keep edit flow consistent |

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
