# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SavedSearchAPI
title: Saved Search API RESTlet
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: restlet
  file: FileCabinet/SuiteScripts/saved-search-api.restlet.js
  script_id: _saved_search_api
  deployment_id: TBD

record_types:
  - Saved Searches (any types supported by search)

---

## 1. Overview
A RESTlet that returns results from a specified NetSuite saved search.

---

## 2. Business Goal
Provide an API endpoint to retrieve saved search results for integrations or reporting.

---

## 3. User Story
As an integration developer, when I call the RESTlet with a saved search ID, I want the saved search results returned, so that I can consume NetSuite data externally.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| POST request | searchID | searchID present | Load saved search by ID and return results |

---

## 5. Functional Requirements
- Accept a `searchID` parameter in the POST request.
- If `searchID` is missing, return an error.
- Load the saved search by ID.
- Return all results in batches of 1000.

---

## 6. Data Contract
### Record Types Involved
- Saved Searches (any types supported by search)

### Fields Referenced
- searchID (request parameter)

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing `searchID` returns an error object.
- Saved search returns more than 1000 rows; results are concatenated in 1000-row batches.

---

## 8. Implementation Notes (Optional)
- RESTlet is `NModuleScope Public`.
- Performance/governance considerations: search runs and getRange calls may consume usage for large datasets.

---

## 9. Acceptance Criteria
- Given a valid `searchID`, when the RESTlet processes the request, then it returns results.
- Given a missing `searchID`, when the RESTlet processes the request, then it returns an error object.

---

## 10. Testing Notes
- POST with valid `searchID`; expect results.
- POST with missing `searchID`; expect error object.
- Saved search with more than 1000 rows; expect results concatenated across batches.

---

## 11. Deployment Notes
- Upload `saved-search-api.restlet.js`.
- Deploy RESTlet and set appropriate role permissions.
- Test with a known saved search ID.
- Rollback: disable the RESTlet deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Deployment ID is TBD.
- Should the RESTlet support paging parameters or filters?
- Risk: Large searches return very large responses.
- Risk: Public scope increases exposure risk.

---
