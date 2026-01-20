# PRD: File Attach RESTlet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-FileAttachRESTlet
title: File Attach RESTlet
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/file_attach_restlet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - File
  - supportcase

---

## 1. Overview
A RESTlet that attaches a File Cabinet file to a target NetSuite record, defaulting to Support Case for legacy callers.

---

## 2. Business Goal
Allow external systems or workflows to attach uploaded files to NetSuite records via a simple REST call.

---

## 3. User Story
- As an integration developer, I want to attach files to NetSuite records via REST so that uploads can be automated.
- As a legacy caller, I want to keep using caseId so that existing integrations do not break.
- As an admin, I want to attach files to different record types so that the endpoint is reusable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet POST | fileId, recordId, caseId, recordType | recordType defaults to supportcase; recordId or caseId provided | Attach file to target record via record.attach |

---

## 5. Functional Requirements
- The system must accept POST requests with fileId.
- The system must accept either recordId (preferred) or caseId (legacy).
- The system must accept recordType (defaults to supportcase).
- The system must attach the file to the target record using record.attach.
- The system must return success or error payloads.

---

## 6. Data Contract
### Record Types Involved
- File
- supportcase

### Fields Referenced
- fileId
- recordId
- caseId
- recordType

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing fileId returns a clear error.
- Calls with only caseId succeed using record type supportcase.
- Invalid record ID returns success: false with a message.

---

## 8. Implementation Notes (Optional)
- Backward compatibility for legacy caseId callers.

---

## 9. Acceptance Criteria
- Given fileId and recordId, when POSTed, then the file attaches successfully.
- Given only caseId, when POSTed, then the file attaches to supportcase.
- Given missing parameters, when POSTed, then a clear error is returned.
- Given an error, when it occurs, then success: false is returned with a message.

---

## 10. Testing Notes
- POST with recordId, recordType, fileId and confirm attachment.
- POST with caseId only and confirm attachment to supportcase.
- POST missing fileId and confirm error response.
- POST invalid record ID and confirm success: false.

---

## 11. Deployment Notes
- Deploy RESTlet.
- Configure access role and test requests.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should we validate recordType against an allowlist?
- Misuse attaches files to unintended records.

---
