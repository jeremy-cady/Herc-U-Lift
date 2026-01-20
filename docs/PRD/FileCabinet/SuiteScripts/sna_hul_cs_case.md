# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-CaseClientScript
title: Case Record Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_case.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Custom Record (customrecord_nx_asset)
  - Custom Record (customrecord_sna_objects)

---

## 1. Overview
A client script for case records that auto-populates related fields from selected equipment assets and can launch a new site asset creation flow.

---

## 2. Business Goal
Reduce manual data entry and ensure case metadata is synced to the related equipment asset and case object.

---

## 3. User Story
As a support agent, when I select an equipment asset on a case, I want related fields auto-populated and the option to create a site asset, so that I can keep the case complete with minimal manual entry.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | custevent_nx_case_asset | URL param present | Set case asset field |
| fieldChanged | custevent_nxc_case_assets | value changed | Lookup asset and populate case fields |
| client action | showPrompt | user invokes | Redirect to new site asset with parameters |

---

## 5. Functional Requirements
- On page init, if `custevent_nx_case_asset` is present in the URL, set the case asset field.
- When `custevent_nxc_case_assets` changes, look up the related case object on the selected asset.
- Populate `custevent_sna_hul_case_object` from the asset lookup.
- Look up owner status, posting status, and warranty expiration from the case object and set corresponding case fields.
- Provide a `showPrompt` action to open a new site asset in edit mode with context parameters.

---

## 6. Data Contract
### Record Types Involved
- Support Case
- Custom Record (customrecord_nx_asset)
- Custom Record (customrecord_sna_objects)

### Fields Referenced
- Case | custevent_nx_case_asset
- Case | custevent_nxc_case_assets
- Case | custevent_sna_hul_case_object
- Case | custevent_sna_hul_owner_status
- Case | custevent_sna_hul_posting_status
- Case | custevent_sna_hul_warranty_expiration
- Case | custevent_nx_customer
- Asset | custrecord_sna_hul_nxcassetobject
- Asset | custrecord_nxc_na_asset_type
- Asset | custrecord_nx_asset_customer
- Asset | custrecord_sna_related_case
- Asset | custrecord_sna_hul_from_save_and_create
- Case Object | custrecord_sna_owner_status
- Case Object | custrecord_sna_posting_status
- Case Object | custrecord_sna_warranty_expiration_date

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Asset selection is empty or first value is blank.
- Case object lacks owner or posting status.
- Invalid asset ID should not break field updates.

---

## 8. Implementation Notes (Optional)
- Uses `search.lookupFields` and `url.resolveRecord`.
- Client-side redirects can lose unsaved case changes.

---

## 9. Acceptance Criteria
- Given an equipment asset selection, when the field changes, then case object, owner status, posting status, and warranty expiration populate.
- Given `showPrompt` is invoked, when selected, then a new site asset record opens with prefilled parameters.

---

## 10. Testing Notes
- Select an equipment asset; verify case fields update.
- Use `showPrompt` to create a new site asset; verify redirect.
- Asset selection empty; verify no errors.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_case.js`.
- Deploy to the case record.
- Rollback: remove the client script deployment from the case form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the script support multiple asset selections beyond the first value?
- Risk: Asset lookup returns empty case object.
- Risk: Redirect on showPrompt loses unsaved case changes.

---
