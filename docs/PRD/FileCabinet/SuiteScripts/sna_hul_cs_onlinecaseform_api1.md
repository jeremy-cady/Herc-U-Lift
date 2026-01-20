# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-OnlineCaseFormApi1
title: Online Case Form Field Toggle (SuiteScript 1.0)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_onlinecaseform_api1.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Applied-to record type (not specified)

---

## 1. Overview
A SuiteScript 1.0 client script that enables or disables body and sublist fields based on job category and job type selections.

---

## 2. Business Goal
Limit user input to fields relevant to the selected certification/testing job types and categories.

---

## 3. User Story
As a user, when I select job category and job types, I want only the correct fields enabled, so that I do not enter irrelevant data.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | custbody_sna_ob_type, custevent_sna_hul_caseassetsite | job category/types selected | Enable/disable body and sublist fields |
| pageInit | category | category empty | Disable custevent_sna_hul_caseassetsite |

---

## 5. Functional Requirements
- When `custbody_sna_ob_type` or `custevent_sna_hul_caseassetsite` changes, read `custbody_sna_job_category` and the selected job types.
- For job categories 1, 2, or 4, enable or disable fields based on selected job types (FCC, ISED, CE, MiC).
- Toggle body fields such as model, assessment, IC, FCCID, and certification dates.
- Toggle line fields on sublists `recmachcustrecord_sna_product_so` and `recmachcustrecord_sna_online_customer`.
- On page init, if `category` is empty, disable `custevent_sna_hul_caseassetsite`.

---

## 6. Data Contract
### Record Types Involved
- Applied-to record type (not specified)

### Fields Referenced
- Body | custbody_sna_job_category
- Body | custbody_sna_ob_type
- Body | custbody_timco_modelno
- Body | custbody_sna_assessment_requested
- Body | custbody_timco_ic
- Body | custbody_timco_fccid
- Body | custbody_sna_target_certification_date
- Body | custbody_sna_certifcation_deferral_dat
- Body | custevent_sna_hul_caseassetsite
- Line (Product) | custrecord_sna_model_number
- Line (Product) | custrecord_sna_product_name
- Line (Product) | custrecord_sna_product_desc
- Line (Product) | custrecord_sna_technical_docu_id
- Line (Product) | custrecord_sna_trademark
- Line (Online Customer) | custrecord_sna_fcc_test_site
- Line (Online Customer) | custrecord_sna_ised_test_site

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Job category not in 1, 2, 4; related fields disabled.
- Category empty; case asset site disabled.
- Missing job type selection; dependent fields disabled.

---

## 8. Implementation Notes (Optional)
- Uses SuiteScript 1.0 APIs (`nlapiDisableField`, `nlapiDisableLineItemField`).

---

## 9. Acceptance Criteria
- Given matching job category and job type, when selected, then related fields are enabled and others disabled.
- Given category empty, when the form loads, then `custevent_sna_hul_caseassetsite` is disabled.

---

## 10. Testing Notes
- Select job category and FCC job type; verify FCC fields enabled.
- Select ISED job type; verify model and IC fields enabled.
- Category empty; verify case asset site disabled.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_onlinecaseform_api1.js`.
- Deploy to the applicable record.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- What specific record type is this script deployed on?
- Risk: Job type IDs change or expand.

---
