# PRD: File Cabinet API RESTlet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-20200826-FileCabinetAPI
title: File Cabinet API RESTlet
status: Implemented
owner: Tim Dietrich
created: August 26, 2020
last_updated: August 26, 2020

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/file-cabinet-api.restlet.js
  script_id: _file_cabinet_api
  deployment_id: TBD

record_types:
  - File
  - Folder

---

## 1. Overview
A RESTlet that exposes File Cabinet operations (create files, read files, create/delete folders) and SuiteQL execution via an RPC-style POST interface.

---

## 2. Business Goal
Provide programmatic access to File Cabinet operations and SuiteQL queries without direct UI interaction.

---

## 3. User Story
- As an integration developer, I want to create files via REST so that I can automate document generation.
- As an admin, I want to retrieve file contents so that I can support integrations.
- As a developer, I want to run SuiteQL via REST so that I can query data remotely.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet POST | function | function in fileCreate, fileEnumerationsGet, fileGet, folderCreate, folderDelete, requestEcho, suiteQLRun | Execute the requested File Cabinet or SuiteQL operation |

---

## 5. Functional Requirements
- The system must accept POST requests with a function parameter.
- Supported functions: fileCreate, fileEnumerationsGet, fileGet, folderCreate, folderDelete, requestEcho, suiteQLRun.
- fileCreate must require name, fileType, contents, description, encoding, folderID, and isOnline.
- fileGet must require fileID and return file info and contents.
- folderCreate must require a name and optionally a parent folder.
- folderDelete must require folderID and return deleted folder info.
- suiteQLRun must accept sql and return mapped results.
- POST with unsupported function returns an error.

---

## 6. Data Contract
### Record Types Involved
- File
- Folder

### Fields Referenced
- function
- name
- fileType
- contents
- description
- encoding
- folderID
- isOnline
- fileID
- sql

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing required fields return an error response.
- Invalid file or folder IDs return an error response.
- Exceptions return { error } objects.

---

## 8. Implementation Notes (Optional)
- RPC-style function switch; only POST supported.

---

## 9. Acceptance Criteria
- Given an unsupported function, when posted, then an error is returned.
- Given fileCreate, when required fields are provided, then file info and contents are returned.
- Given fileGet, when fileID is provided, then file info and contents are returned.
- Given folderCreate or folderDelete, when called, then expected records are returned.
- Given suiteQLRun, when sql is provided, then mapped results or errors are returned.

---

## 10. Testing Notes
- POST fileCreate with required fields and confirm file saved and returned.
- POST fileGet and confirm contents returned.
- POST suiteQLRun and confirm records returned.
- Verify missing required fields and invalid IDs return errors.

---

## 11. Deployment Notes
- Deploy RESTlet and configure role/permissions.
- Validate file and folder operations.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should this RESTlet be restricted to internal roles only?
- Public RESTlet exposes file access.

---
