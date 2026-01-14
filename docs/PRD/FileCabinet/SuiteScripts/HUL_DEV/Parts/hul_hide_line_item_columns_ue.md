# PRD: Hide Line Item Columns by Form and Role (User Event)

**PRD ID:** PRD-UNKNOWN-HideLineItemColumnsUE
**Created:** Unknown
**Last Updated:** Unknown
**Author:** Jeremy Cady
**Status:** Implemented
**Related Scripts:**
- FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_hide_line_item_columns_ue.js (User Event)

**Script Deployment (if applicable):**
- Script ID: Not specified
- Deployment ID: Not specified

---

## 1. Introduction / Overview

**What is this feature?**
A User Event script that hides a large set of item sublist columns on a specific transaction form for designated roles.

**What problem does it solve?**
Reduces UI clutter and limits visibility of internal fields when users with partner roles view or edit records on a specific custom form.

**Primary Goal:**
Hide sensitive or irrelevant item sublist columns for specific roles when the record uses form ID 106.

---

## 2. Goals

1. Run only on view/edit.
2. Check the record’s form ID before applying changes.
3. Hide a defined list of item sublist columns for specific roles.

---

## 3. User Stories

1. **As a** partner user, **I want** internal columns hidden **so that** forms are easier to use.
2. **As an** admin, **I want** the rule limited to a specific form **so that** other forms remain unchanged.
3. **As a** support user, **I want** the behavior consistent on view/edit **so that** partners see the same layout.

---

## 4. Functional Requirements

### Core Functionality

1. The system must run on `beforeLoad` for `VIEW` and `EDIT`.
2. The system must query the transaction’s `customform` and only proceed if it equals `106`.
3. The system must check the current user role against:
   - 1495, 1175, 1174, 1185, 1163, 1168, 1152
4. When role and form match, the system must hide the following item sublist fields:
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
5. Missing fields must be logged but not block execution.

### Acceptance Criteria

- [ ] Columns are hidden on form 106 for listed roles in view/edit.
- [ ] Non-matching roles or forms are unaffected.
- [ ] Missing columns do not throw errors.

---

## 5. Non-Goals (Out of Scope)

**This feature will NOT:**

- Hide fields on other forms.
- Run on create/copy.
- Enforce security beyond UI visibility.

---

## 6. Design Considerations

### User Interface
- Hides item sublist columns on form 106.

### User Experience
- Cleaner line item view for partner roles.

### Design References
- None.

---

## 7. Technical Considerations

### NetSuite Components Required

**Record Types:**
- Transactions with item sublist.

**Script Types:**
- [ ] Map/Reduce - Not used
- [ ] Scheduled Script - Not used
- [ ] Suitelet - Not used
- [ ] RESTlet - Not used
- [x] User Event - Hide columns on load
- [ ] Client Script - Not used

**Custom Fields:**
- Item sublist fields listed in Functional Requirements.

**Saved Searches:**
- None (SuiteQL used to fetch `customform`).

### Integration Points
- None.

### Data Requirements

**Data Volume:**
- N/A.

**Data Sources:**
- Transaction record and current user role.

**Data Retention:**
- None.

### Technical Constraints
- Only form 106 triggers the behavior.

### Dependencies
- **Libraries needed:** None.
- **External dependencies:** None.
- **Other features:** Role IDs and form ID must remain accurate.

### Governance Considerations
- SuiteQL call per view/edit for form lookup.

---

## 8. Success Metrics

**We will consider this feature successful when:**

- Columns are hidden for partner roles on the targeted form.

**How we'll measure:**
- UI checks in view/edit for partner roles.

---

## 9. Implementation Plan

### Script Implementations

| Script Name | Type | Purpose | Status |
|-------------|------|---------|--------|
| hul_hide_line_item_columns_ue.js | User Event | Hide item sublist columns on form 106 | Implemented |

### Development Approach

**Phase 1:** Form and role gate
- [x] Confirm `customform` is 106
- [x] Match role list

**Phase 2:** Column hiding
- [x] Hide specified item sublist fields

---

## 10. Testing Requirements

### Test Scenarios

**Happy Path:**
1. Open a record on form 106 as a listed role; columns are hidden.
2. Open a record on a different form; columns are visible.

**Edge Cases:**
1. SuiteQL fails; columns remain visible.
2. Sublist field missing; no error thrown.

**Error Handling:**
1. Errors are logged to debug and do not block load.

### Test Data Requirements
- Transactions using form ID 106.

### Sandbox Setup
- Ensure form 106 exists and includes target columns.

---

## 11. Security & Permissions

### Roles & Permissions

**Roles that need access:**
- Roles listed in the script.

**Permissions required:**
- Standard view/edit permissions.

### Data Security
- UI-only; not a security control.

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

1. Upload `hul_hide_line_item_columns_ue.js`.
2. Deploy as a User Event on target transaction record types.
3. Verify form 106 behavior with partner roles.

### Post-Deployment

- [ ] Confirm column hiding in view/edit.
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

- [ ] Should the form ID be configurable?
- [ ] Should the role list be centralized in a config record?

### Known Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Form ID changes | Med | Med | Validate per environment |
| Role IDs change | Med | Med | Maintain role list |

---

## 15. References & Resources

### Related PRDs
- docs/PRD/FileCabinet/SuiteScripts/HUL_DEV/Parts/hul_cs_partner_script_ue.md

### NetSuite Documentation
- SuiteScript 2.x User Event
- SuiteQL documentation

### External Resources
- None.

---

## Revision History

| Date | Author | Version | Changes |
|------|--------|---------|
| Unknown | Jeremy Cady | 1.0 | Initial draft |
