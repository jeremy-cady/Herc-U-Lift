# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-OnlineCaseForm
title: Online Case Form Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_onlinecaseform.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Online case form (case record context)
  - Customer
  - Custom Record (object asset, via Suitelet)

---

## 1. Overview
A client script for the online case form that controls field visibility and auto-populates customer and asset details.

---

## 2. Business Goal
Guide users to enter the right information based on case type and request type, and auto-fill related customer and asset data.

---

## 3. User Story
As a user, when I fill out the online case form, I want only relevant fields shown and customer/asset details auto-filled, so that data entry is minimized.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | category | no category selected | Hide parts, rental, complaint, and general field groups |
| fieldChanged | category, issue | values changed | Toggle field groups based on category/issue |
| fieldChanged | custevent_nxc_case_assets | single asset selected | Load asset details via Suitelet and show general fields |
| fieldChanged | custevent_sna_hul_customer | customer changed | Load customer details via Suitelet and populate fields |
| saveRecord | category, issue | category is Complaint/Question and issue empty | Alert and block save |

---

## 5. Functional Requirements
- On page init, if no category is selected, hide parts, rental, complaint, and general field groups.
- When category or issue changes, toggle field groups based on category and issue values.
- When a single asset is selected, show general fields and load asset details via Suitelet call.
- When customer fields change, call the Suitelet to retrieve customer details and populate company, email, and address fields.
- On save, if category is Complaint or Question and issue is empty, alert and block save.

---

## 6. Data Contract
### Record Types Involved
- Online case form (case record context)
- Customer
- Custom Record (object asset, via Suitelet)

### Fields Referenced
- Case | category
- Case | issue
- Case | custevent_sna_hul_casefleetcode
- Case | custevent_sna_hul_caseserialno
- Case | custevent_sna_hul_manufcode
- Case | custevent_sna_hul_eqptmodel
- Case | custevent_sna_hul_caseframenum
- Case | custevent_sna_hul_casepower
- Case | custevent_sna_hul_casecapacity
- Case | custevent_sna_hul_casetires
- Case | custevent_sna_hul_caseheight
- Case | custevent_sna_hul_casewarrantytype
- Case | custevent_sna_hul_caseassetsite
- Case | custevent_sna_hul_caseobjectasset
- Case | custevent_nx_case_asset
- Case | custevent_nxc_case_assets
- Case | custevent_sna_hul_service_type
- Case | custevent_sna_hul_customer
- Case | custevent_sna_customer_id
- Case | companyname
- Case | email
- Case | address1
- Case | address2
- Case | city
- Case | state
- Case | zipcode

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Multiple assets selected; equipment fields remain hidden.
- Customer lookup returns empty; fields cleared and default customer set.
- Suitelet response is empty or invalid JSON.

---

## 8. Implementation Notes (Optional)
- Uses Suitelet `customscript_sna_hul_sl_onlinecaseform` for customer and asset lookups.
- Uses external Suitelet URL calls from the client.

---

## 9. Acceptance Criteria
- Given category/issue selections, when updated, then field visibility changes accordingly.
- Given customer or asset selection, when updated, then related details populate.
- Given Complaint or Question without issue, when saving, then save is blocked.

---

## 10. Testing Notes
- Select a category and verify correct fields appear.
- Select a customer and confirm address/company fields populate.
- Select a single asset and confirm equipment fields populate.
- Complaint/Question without issue; verify save blocked.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_onlinecaseform.js`.
- Deploy to the online case form.
- Rollback: remove client script deployment from the online case form.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should the default customer ID (810) be parameterized?
- Risk: Suitelet response empty or slow.

---
