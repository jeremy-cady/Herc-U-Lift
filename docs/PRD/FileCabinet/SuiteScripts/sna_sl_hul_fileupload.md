# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FileUpload
title: CSV Upload Suitelet for Bin Transfers and Put-Away
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_sl_hul_fileupload.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - file
  - scriptdeployment

---

## 1. Overview
Suitelet that accepts CSV uploads and schedules Map/Reduce scripts to create bin transfers or bin put-away worksheets.

---

## 2. Business Goal
Provide a UI for uploading CSV files and initiating background processing without manual scheduling.

---

## 3. User Story
As a warehouse user, when I upload a CSV and choose the record type, I want the correct Map/Reduce job scheduled so that processing runs automatically.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | record type, CSV file | load form | Render select and file fields. |
| POST | file, record type | file provided | Save CSV to folder and schedule the matching MR script with file id parameter. |
| POST | deployment | active deployment available | Select NOTSCHEDULED deployment and show MR status link. |

---

## 5. Functional Requirements
- Render a form with record type selector and CSV upload field on GET.
- On POST, save the uploaded file to folder 10896 (Bin Transfer) or 11608 (Bin Put-Away Worksheet).
- Schedule `customscript_sna_mr_hul_create_bintransf` or `customscript_sna_hul_mr_create_bpw` based on selection.
- Pass the CSV file id via `custscript_sna_hul_bintransfer` or `custscript_sna_hul_bin_putaway_worksheet`.
- Choose an active deployment with status NOTSCHEDULED and display a link to the MR status page.

---

## 6. Data Contract
### Record Types Involved
- File
- Script Deployment

### Fields Referenced
- Folder id | 10896 | Bin Transfer uploads
- Folder id | 11608 | Bin Put-Away uploads
- Script parameter | custscript_sna_hul_bintransfer | Bin transfer file id
- Script parameter | custscript_sna_hul_bin_putaway_worksheet | Put-away file id

Schemas (if known):
- Map/Reduce | customscript_sna_mr_hul_create_bintransf | Bin transfer creator
- Map/Reduce | customscript_sna_hul_mr_create_bpw | Put-away worksheet creator

---

## 7. Validation & Edge Cases
- If no file is uploaded, do not schedule an MR task.
- If no active deployment is available, log error and show status info accordingly.

---

## 8. Implementation Notes (Optional)
- Deployment selection filters for NOTSCHEDULED status only.

---

## 9. Acceptance Criteria
- Given a valid CSV upload, when the form is submitted, then the file is saved and the correct MR is scheduled.
- Given a valid upload, when scheduling completes, then a link to MR status is displayed.
- Given no file upload, when the form is submitted, then no scheduling occurs.

---

## 10. Testing Notes
- Upload a bin transfer CSV and verify the correct MR is scheduled.
- Upload a put-away CSV and verify the correct MR is scheduled.
- Submit without a file and verify no MR scheduling.

---

## 11. Deployment Notes
- Ensure MR deployments are active for `customscript_sna_mr_hul_create_bintransf` and `customscript_sna_hul_mr_create_bpw`.
- Deploy the Suitelet and verify access.

---

## 12. Open Questions / TBDs
- Confirm script ID and deployment ID.
- Confirm created and last updated dates.
- Should folder ids be parameterized instead of hard-coded?

---
