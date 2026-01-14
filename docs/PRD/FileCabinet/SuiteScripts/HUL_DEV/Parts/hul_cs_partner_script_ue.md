# PRD: Partner Role Line Column Hiding (User Event)

**PRD ID:** PRD-UNKNOWN-PartnerColumnHideUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_cs_partner_script_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that hides specific item sublist columns on transaction forms for a defined set of partner-related roles.

**What problem does it solve?**
Limits visibility of internal pricing/commission and operational fields for partner roles, reducing clutter and exposure.

**Primary Goal:**
Hide sensitive or irrelevant line fields for specific roles during view/edit/create.

---

## 2. Goals

1. Detect when a user with a partner role opens a record.
2. Hide a defined list of item sublist columns.
3. Apply consistently for view, edit, and create.

---

## 3. User Stories

1. **As a** partner user, **I want** fewer internal columns **so that** the form is clearer.
2. **As an** admin, **I want** sensitive fields hidden **so that** partners don’t see internal data.
3. **As a** support user, **I want** the behavior consistent across view/edit/create **so that** training is simple.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad`.
2. The system must execute for `VIEW`, `EDIT`, and `CREATE` contexts.
3. The system must check the current user role against:
   - 3, 1495, 1174, 1175, 1185, 1163, 1168, 1152
4. When the role matches, the system must hide the following item sublist fields:
   - `custcol_sna_hul_act_service_hours`
   - `custcol_ava_multitaxtypes`
   - `custcol_sn_hul_billingsched`
   - `custcol_sna_sales_rep`
   - `custcol_sna_hul_comm_rate`
   - `custcol_sna_hul_sales_rep_comm_type`
   - `custcol_sna_hul_eligible_for_comm`
   - `custcol_sna_commission_amount`
   - `custcol_sna_override_commission`
   - `custcol_sna_commission_plan`
   - `custcol_sna_sales_rep_matrix`
   - `custcol_sna_hul_sales_rep_csm`
   - `custcol_sna_cpg_resource`
   - `custcol_sna_hul_returns_handling`
   - `custcol_sna_hul_temp_item_uom`
   - `custcol_sna_linked_transaction`
   - `custcol_sna_hul_gen_prodpost_grp`
   - `custcol_sna_so_service_code_type`
   - `custcol_sna_po_fleet_code`
   - `custcol_sna_source_transaction`
   - `custcol_sna_service_itemcode`
   - `custcol_sna_default_rev_stream`
   - `custcol_sn_for_warranty_claim`
   - `custcol_sna_exc_notes`
   - `custcol_sna_used_qty_exc`
   - `custcol_nx_asset`
   - `custcol_nx_consumable`
   - `custcol_nx_task`
   - `custcol_nxc_case`
   - `custcol_nxc_equip_asset`
   - `commitmentfirm`
   - `custcol_ava_shiptousecode`
   - `cseg_sna_hul_eq_seg`
   - `cseg_hul_mfg`
   - `custcol_sna_hul_fleet_no`
   - `custcol_sna_hul_obj_model`
   - `custcol_sna_obj_serialno`
   - `custcol_sna_obj_fleetcode`
   - `custcol_sna_week_bestprice`
   - `custcol_sna_day_bestprice`
   - `orderpriority`
   - `expectedshipdate`
   - `excludefromraterequest`
   - `custcol_sna_extra_days`
   - `itemfulfillmentchoice`
   - `custcol_sna_group_code`
   - `custcol_sna_hul_item_category`
   - `custcol_sn_internal_billing_processed`
   - `custcol_sna_hul_newunitcost`
   - `custcolsna_hul_newunitcost_wodisc`
   - `custcol_sna_task_assigned_to`
   - `custcol_sna_taskcase`
   - `custcol_sna_task_company`
   - `custcol_sna_taskdate`
   - `custcol_sna_time_posted`
   - `custcol_sna_work_code`
   - `custcol_sna_repair_code`
5. The system must set display type to `HIDDEN` for each field found on the item sublist.
6. Missing columns must be logged but not block execution.

### Acceptance Criteria

- [ ] Partner roles listed above see hidden item columns on view/edit/create.
- [ ] Non-partner roles are unaffected.
- [ ] Missing fields do not throw errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Hide fields outside the item sublist.
- Enforce record-level permissions.
- Modify data values.

---

## 6. Design Considerations

### User Interface
- Hides specific columns on the item sublist.

### User Experience
- Cleaner line item view for partner roles.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions with `item` sublist (e.g., sales orders, invoices).

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Column hiding on load
- [ ] Client Script - Not used

**Custom Fields:**
- Multiple item sublist fields (see Functional Requirements).

**Saved Searches:**
- None.

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- N/A.

**Data Sources:**
- User role and form sublist fields.

**Data Retention:**
- None.

### Technical Constraints
- Only available in beforeLoad; does not affect server-side data.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Role IDs must remain accurate.

### Governance Considerations
- Field lookups per column on form load.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Partner roles no longer see specified columns.

**How we'll measure:**
- UI spot checks with partner roles.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_cs_partner_script_ue.js | User Event | Hide item sublist columns by role | Implemented |

### Development Approach

**Phase 1:** Role gating
- [x] Match current user role to allowed list

**Phase 2:** Column hiding
- [x] Hide specified item sublist fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Log in with a partner role and open a transaction; columns are hidden.
2. Log in with a non-partner role and verify columns remain visible.

**Edge Cases:**
1. Some fields are not present on the form (no error thrown).
2. Script runs on create with empty sublist.

**Error Handling:**
1. Missing sublist field logs a debug message.

### Test Data Requirements
- Any transaction with an item sublist.

### Sandbox Setup
- Ensure role IDs match target roles in sandbox.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Partner roles listed in the script.

**Permissions required:**
- Standard form access; no elevated permissions required.

### Data Security
- Hiding fields is a UI measure, not security enforcement.

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

1. Upload `hul_cs_partner_script_ue.js`.
2. Create User Event script record and deploy on target transaction types.
3. Verify role behavior in sandbox.

### Post-Deployment

- [ ] Confirm partner roles see hidden columns.
- [ ] Update PRD status to "Implemented".

### Rollback Plan

**If deployment fails:**
1. Disable the User Event deployment.

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

- [ ] Should role IDs be maintained in a configuration record?
- [ ] Are all columns still relevant for hiding?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Role IDs change | Med | Med | Validate role list per environment |
| Hidden fields assumed secure | Med | High | Use role permissions for security |

---

## 15. References & Resources

### Related PRDs
- None identified.

### NetSuite Documentation
- SuiteScript 2.x User Event
- serverWidget Field API

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
