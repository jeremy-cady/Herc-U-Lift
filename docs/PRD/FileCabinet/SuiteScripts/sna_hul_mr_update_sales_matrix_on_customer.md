# PRD: Update Sales Matrix On Customer

**PRD ID:** PRD-UNKNOWN-UpdateSalesMatrixOnCustomer
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/sna_hul_mr_update_sales_matrix_on_customer.js (Map/Reduce)

**Script Deployment:** Not specified

---

## 1. Introduction / Overview

**What is this feature?**
Synchronizes Sales Rep Matrix records to Sales Rep Matrix Mapping records for a customer, including updates and inactivation.

**What problem does it solve?**
Keeps customer-specific sales rep mappings aligned with matrix definitions and supports global resync or targeted updates.

**Primary Goal:**
Ensure customer sales rep mappings reflect the current sales rep matrix rules and override behavior.

---

## 2. Goals

1. Create or update mapping records for a customer based on matrix data.
2. Respect override flags so manual mappings are not overwritten.
3. Support inactivation or refresh of mappings from a matrix record.

---

## 3. User Stories

1. **As a** sales ops admin, **I want to** resync a customer's sales rep mapping from the matrix **so that** assignments stay current.
2. **As a** sales ops admin, **I want to** inactivate mappings when needed **so that** stale assignments are removed.
3. **As a** sales ops admin, **I want to** preserve override mappings **so that** manual exceptions remain intact.

---

## 4. Functional Requirements

### Core Functionality

1. The system must read zip codes for the target customer when add/update mode is enabled.
2. The system must find Sales Rep Matrix records that match the customer's zip codes.
3. The system must create or update Sales Rep Matrix Mapping records for the customer and matrix.
4. When a mapping is marked override, the system must skip updates for that mapping.
5. When inactivation is requested, the system must set mapping records to inactive.
6. When updating from a matrix record, the system must refresh mapping fields from the matrix.

### Acceptance Criteria

- [ ] Mappings are created for all matching matrix records when add/update is enabled.
- [ ] Existing mappings with override are not changed.
- [ ] Inactivate mode sets `isinactive` to true on matching mappings.
- [ ] Mapping fields match the latest matrix values after an update.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Recalculate commission payouts.
- Modify sales rep matrix master records.
- Validate or normalize customer zip codes beyond existing library logic.

---

## 6. Design Considerations

### User Interface
- No UI; Map/Reduce runs via deployment or Suitelet trigger.

### User Experience
- Admins trigger resyncs without manual record edits.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- customrecord_sna_sales_rep_matrix
- customrecord_sna_salesrep_matrix_mapping
- customer

**Script Types:**
- [x] Map/Reduce - Update and inactivate mapping records
- [ ] Scheduled Script - N/A
- [ ] Suitelet - N/A
- [ ] RESTlet - N/A
- [ ] User Event - N/A
- [ ] Client Script - N/A

**Custom Fields:**
- customrecord_sna_sales_rep_matrix | custrecord_sna_state | Source matrix state
- customrecord_sna_sales_rep_matrix | custrecord_sna_county | Source matrix county
- customrecord_sna_sales_rep_matrix | custrecord_sna_zip_code | Source matrix zip
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_equipment_cat | Equipment category
- customrecord_sna_sales_rep_matrix | custrecord_sna_revenue_streams | Revenue stream
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_manufacturer_cs | Manufacturer
- customrecord_sna_sales_rep_matrix | custrecord_sna_rep_matrix_sales_reps | Sales reps list
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_sales_rep_comm_plan | Commission plan
- customrecord_sna_sales_rep_matrix | custrecord_sna_hul_comm_plan_end_date | Commission plan end date
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_customer | Customer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_state | State
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_county | County
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_zipcode | Zip code
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_equipment | Equipment category
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_rev_stream | Revenue stream
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_manufacturer | Manufacturer
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_sales_reps | Sales reps list
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_override | Override flag
- customrecord_sna_salesrep_matrix_mapping | custrecord_salesrep_mapping_sales_matrix | Sales matrix reference
- customrecord_sna_salesrep_matrix_mapping | custrecord_sna_hul_sales_rep_comm_plan_2 | Commission plan
- customrecord_sna_salesrep_matrix_mapping | custrecord_sna_hul_comm_plan_end_date_2 | Commission plan end date
- customrecord_sna_salesrep_matrix_mapping | isinactive | Active flag

**Saved Searches:**
- None (script builds searches at runtime).

### Integration Points
- Uses `./sna_hul_ue_sales_rep_matrix_config` to fetch customer zip codes.

### Data Requirements

**Data Volume:**
- Customer-specific and global resyncs; potentially large mapping counts.

**Data Sources:**
- Customer records
- Sales rep matrix records

**Data Retention:**
- Mapping records persist until inactivated or updated.

### Technical Constraints
- Map/Reduce runtime limits when resyncing large customer sets.

### Dependencies
- **Libraries needed:** ./sna_hul_ue_sales_rep_matrix_config
- **External dependencies:** None
- **Other features:** Sales rep matrix configuration

### Governance Considerations

- **Script governance:** Uses searches and record loads/saves per mapping.
- **Search governance:** Uses dynamic searches; batching built into Map/Reduce.
- **API limits:** Monitor usage during global resyncs.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Mapping records reflect current matrix values for a customer.
- Manual overrides are preserved.
- Inactivation is applied correctly when requested.

**How we'll measure:**
- Spot checks on mapping records after resync runs.
- Execution logs showing counts of updates vs. overrides.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| sna_hul_mr_update_sales_matrix_on_customer.js | Map/Reduce | Sync sales rep matrix to customer mappings | Implemented |

### Development Approach

**Phase 1:** Validate configuration and parameters
- [ ] Confirm script parameters are set for target process
- [ ] Verify dependency library is deployed

**Phase 2:** Operational checks
- [ ] Run targeted customer resync
- [ ] Confirm mapping updates/inactivation

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Add/update mode creates mappings for a customer with matching zip codes.
2. Update mode refreshes mapping fields from matrix values.

**Edge Cases:**
1. Customer has no zip codes; no mappings created.
2. Mapping exists with override set; mapping is skipped.
3. Inactivate mode sets `isinactive` without changing fields.

**Error Handling:**
1. Missing matrix or customer parameter logs error and skips.
2. Invalid zip code values are filtered out.

### Test Data Requirements
- Customer with multiple zip codes
- Matrix records for US and non-US logic
- Mapping record with override enabled

### Sandbox Setup
- Deploy Map/Reduce with parameters available
- Ensure dependency library exists

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Administrator or scripting role

**Permissions required:**
- Full access to custom record types and customer

### Data Security
- No PII beyond customer identifiers and locations.

---

## 12. Deployment Plan

### Pre-Deployment Checklist

- [ ] Script parameters configured
- [ ] Dependency library deployed
- [ ] Sandbox validation completed

### Deployment Steps

1. Deploy script and schedule or trigger via Suitelet.
2. Configure parameter values for target resync.
3. Run Map/Reduce and review logs.

### Post-Deployment

- [ ] Verify mapping records updated
- [ ] Confirm overrides remain unchanged

### Rollback Plan

**If deployment fails:**
1. Disable deployment.
2. Re-run after correcting configuration.

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

- [ ] Should the script resync be scheduled for recurring maintenance?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Large resyncs may hit governance limits | Med | Med | Use Map/Reduce batches and limit scope where possible |
| Incorrect zip codes drive wrong mappings | Med | Med | Validate zip sources and cleanse input |

---

## 15. References & Resources

### Related PRDs
- None.

### NetSuite Documentation
- SuiteScript 2.1 Map/Reduce
- N/search and N/record modules

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
