# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-EndpointRESTlet
title: RESTlet Endpoint Dispatcher and Field Introspection
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/RESTlet Script/endpoint.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Any record type supplied as `module` to `getModuleFields`

---

## 1. Overview
A RESTlet endpoint dispatcher that invokes named methods and can return metadata for a record type's fields.

## 2. Business Goal
Provides a single entry point for invoking RESTlet helper methods or NetSuite API methods and for discovering record field metadata.

## 3. User Story
As an integration, when I need to call RESTlet helper methods by name, I want to call RESTlet helper methods by name, so that I can reuse a single endpoint.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | `method`, `params` | Request payload includes `method` | Dispatch to the requested method and return formatted reply |

## 5. Functional Requirements
- The system must accept `method` and optional `params` from the request payload.
- The system must require `params` to be an array; otherwise it records an exception.
- The system must invoke an Endpoint instance method when the requested `method` exists.
- The system must invoke a NetSuite API method (on `this`) when the requested `method` exists there.
- The system must return a formatted reply with result data and any exceptions.
- The `getModuleFields` method must require a `module` parameter.
- The `getModuleFields` method must search for at least one record of the module type.
- The `getModuleFields` method must load the first record returned.
- The `getModuleFields` method must return metadata for all fields on that record.
- Field metadata must include name, label, type, readOnly, mandatory, disabled, hidden, and popup.
- For select-like fields (`select`, `multiselect`, `radio`), the system must include option values.

## 6. Data Contract
### Record Types Involved
- Any record type supplied as `module` to `getModuleFields`

### Fields Referenced
- TBD

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- `params` is not an array.
- `method` does not exist on Endpoint or NetSuite API.
- `getModuleFields` is called with an empty module or a module with no records.
- Select field options throw an error; response still returns field data.
- Module parameter missing; required parameter error returned.

## 8. Implementation Notes (Optional)
- `getModuleFields` relies on at least one existing record of the module type.
- Reply generation uses `NetsuiteToolkit.formatReply` with `this.params`, which may be unset.

## 9. Acceptance Criteria
- Given a request with a valid method, when the RESTlet runs, then the method result is returned in the reply.
- Given a request with a non-array `params`, when the RESTlet runs, then a parameter error is returned.
- Given an unknown method, when the RESTlet runs, then a "Method not supported" error is returned.
- Given `getModuleFields` with a valid `module`, when the RESTlet runs, then formatted field metadata is returned.

## 10. Testing Notes
- Call a valid Endpoint method with params.
- Call a valid NetSuite API method exposed by the RESTlet context.
- Call `getModuleFields` with a valid module type.
- `params` is not an array.
- `method` does not exist on Endpoint or NetSuite API.
- `getModuleFields` is called with an empty module or a module with no records.
- Select field options throw an error; response still returns field data.
- Module parameter missing; required parameter error returned.

## 11. Deployment Notes
- Upload `endpoint.js`.
- Ensure the RESTlet deployment calls `endpointPostHandler`.
- Verify method dispatch and metadata responses in sandbox.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should method dispatch be limited to an allowlist?
- Should replies include the original request parameters?
- Risk: Method dispatch exposes unintended APIs (Mitigation: Add an allowlist of permitted methods)
- Risk: Module has no records, metadata returns empty (Mitigation: Document requirement or fall back to schema API)

---
