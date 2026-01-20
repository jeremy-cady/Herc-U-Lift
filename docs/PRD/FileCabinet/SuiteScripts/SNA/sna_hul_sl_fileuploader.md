# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FileUploaderSL
title: File Uploader Suitelet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/SNA/sna_hul_sl_fileuploader.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - File

---

## 1. Overview
A Suitelet that presents a simple file upload form and saves the uploaded file to a fixed File Cabinet folder.

## 2. Business Goal
Provides a lightweight UI to upload files into NetSuite without navigating the File Cabinet.

## 3. User Story
As a user, when I need to upload a file, I want a simple upload form, so that I can add documents quickly.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| GET | TBD | Suitelet request | Render file upload form |
| POST | File field | File uploaded | Save file to folder `2436` |

## 5. Functional Requirements
- The system must display a form with a file field on GET requests.
- The system must accept an uploaded file on POST requests.
- The system must save uploaded files to folder ID `2436`.
- The system must log errors if upload fails.

## 6. Data Contract
### Record Types Involved
- File

### Fields Referenced
- Folder ID `2436`

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Submit without a file; no save should occur.
- File save fails; error logged.

## 8. Implementation Notes (Optional)
- Folder ID is hard-coded in the script.

## 9. Acceptance Criteria
- Given a GET request, when the Suitelet runs, then the upload form renders.
- Given a POST request with a file, when the Suitelet runs, then the file saves to the configured folder.
- Given a save failure, when the Suitelet runs, then the error is logged.

## 10. Testing Notes
- Upload a file and verify it appears in folder 2436.
- Submit without a file; no save should occur.
- File save fails; error logged.

## 11. Deployment Notes
- Upload `sna_hul_sl_fileuploader.js`.
- Deploy the Suitelet with appropriate access.
- Validate file upload and save behavior.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the target folder be configurable via script parameter?
- Should the Suitelet display a success message after upload?
- Risk: Hard-coded folder ID changes (Mitigation: Move folder ID to script parameter)
- Risk: Users upload invalid files (Mitigation: Add validation if needed)

---
