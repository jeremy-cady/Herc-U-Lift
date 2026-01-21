# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-NXAsset
title: NX Asset Redirect to Case
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: user_event
  file: FileCabinet/SuiteScripts/sna_hul_ue_nxasset.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - supportcase

---

## 1. Overview
User Event that redirects to a support case and sets the case asset when a NextService asset is created via a "Save and Create" flow.

---

## 2. Business Goal
Link a newly created NextService asset back to its related case without manual navigation.

---

## 3. User Story
As a service user, when I create a NextService asset from a case, I want to return to the case with the asset linked, so that the case is updated quickly.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| afterSubmit | custrecord_sna_hul_from_save_and_create | non-delete; Save and Create flag set | Find related case and redirect with asset parameter |

---

## 5. Functional Requirements
- Run afterSubmit on NextService asset records (non-delete).
- If `custrecord_sna_related_case` and `custrecord_sna_hul_from_save_and_create` are present, find the related case.
- Redirect to the case in edit mode and pass `custevent_nx_case_asset` as a parameter.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- supportcase

### Fields Referenced
- customrecord_nx_asset | custrecord_sna_related_case | Case title
- customrecord_nx_asset | custrecord_nx_asset_customer | Customer
- customrecord_nx_asset | custrecord_sna_hul_from_save_and_create | Save and create flag
- supportcase | custevent_nx_case_asset | Case asset
- supportcase | custevent_nx_customer | Customer

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matching case results in no redirect.
- Search errors are logged.
- Only runs when Save and Create flag is set.

---

## 8. Implementation Notes (Optional)
- Case matching uses customer and case title.

---

## 9. Acceptance Criteria
- Given Save and Create asset creation, when afterSubmit runs, then the user is redirected to the related case with asset field populated.

---

## 10. Testing Notes
- Create asset via Save and Create and verify redirect to case.
- No matching case results in no redirect.
- Deploy User Event on NextService asset record.

---

## 11. Deployment Notes
- Confirm Save and Create flag field on NX asset.
- Deploy User Event on NextService asset and validate redirect behavior.
- Monitor logs for missing case matches; rollback by disabling deployment if needed.

---

## 12. Open Questions / TBDs
- Should case matching use case ID instead of title?

---
