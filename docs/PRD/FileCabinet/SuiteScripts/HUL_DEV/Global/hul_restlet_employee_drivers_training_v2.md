# PRD: Employee Driver Inspection RESTlet v2
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-DriverInspectionRestletV2
title: Employee Driver Inspection RESTlet v2
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_restlet_employee_drivers_training_v2.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_hul_employee_drivers_inspec

---

## 1. Overview
A RESTlet that creates, reads, and updates Employee Driver Inspection records using updated field IDs.

---

## 2. Business Goal
Provide a programmatic interface for external systems or integrations to submit and update driver inspection data without UI entry.

---

## 3. User Story
- As an integration system, I want to POST inspection data so that inspections are created automatically.
- As a support analyst, I want to GET a record by ID so that I can verify saved values.
- As an integration system, I want to PUT updated inspection data so that records stay current.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet POST | field/value pairs | Request body provided | Create inspection record |
| RESTlet GET | id | id provided | Return sample fields from record |
| RESTlet PUT | id, field/value pairs | id provided | Update provided fields |

---

## 5. Functional Requirements
- The system must accept POST requests with inspection field/value pairs and create a new record.
- The system must accept GET requests with id and return sample fields from the record.
- The system must accept PUT requests containing id and update provided fields.
- The system must support request bodies wrapped in an array and use the first element.
- The system must parse integer fields: custrecord_hul_driveinp_mileage, custrecord_hul_driveinp_drivers_inp_loc.
- The system must skip null/undefined/empty POST values and skip null/undefined PUT values.
- The system must return a success response with recordId and basic verification data on create.
- Errors must return a structured error response and be logged.

---

## 6. Data Contract
### Record Types Involved
- customrecord_hul_employee_drivers_inspec

### Fields Referenced
- id
- custrecord_hul_driveinp_mileage
- custrecord_hul_driveinp_drivers_inp_loc
- custrecord_hul_driveinp_truckortractorno
- custrecord_hul_driveinp_cabdoorswindows
- custrecord_hul_driveinp_remarks

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- POST with array wrapper uses the first element.
- PUT without id returns an error.
- Integer fields provided as strings are parsed correctly.
- Invalid field IDs log errors and continue.

---

## 8. Implementation Notes (Optional)
- Uses ignoreMandatoryFields: false to enforce mandatory fields.

---

## 9. Acceptance Criteria
- Given POST data, when submitted, then a record is created and an internal ID is returned.
- Given a valid id, when GET is called, then sample fields are returned.
- Given PUT with id, when submitted, then fields are updated and success metadata is returned.
- Given integer fields, when provided, then they are coerced correctly.
- Given errors, when they occur, then a structured error response is returned and logged.

---

## 10. Testing Notes
- POST valid data and confirm success with recordId and verification fields.
- GET by ID and confirm sample fields are returned.
- PUT updates a field and confirm success.
- POST with array wrapper and confirm record created.
- PUT without id and confirm error response.

---

## 11. Deployment Notes
- Upload hul_restlet_employee_drivers_training_v2.js and create RESTlet script record.
- Configure and deploy with role access.
- Validate with POST/GET/PUT in sandbox.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- What authentication method is used by the calling system?
- Should required fields be validated before save?
- Are there additional fields that need type coercion?
- Invalid payload fields.
- Missing required fields.

---
