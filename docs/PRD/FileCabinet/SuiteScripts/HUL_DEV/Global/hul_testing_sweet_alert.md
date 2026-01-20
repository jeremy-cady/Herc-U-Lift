# PRD: SweetAlert2 Loader Test (Client Script)
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-TestingSweetAlert
title: SweetAlert2 Loader Test (Client Script)
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: client
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/hul_testing_sweet_alert.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - None

---

## 1. Overview
A test client script that validates dynamic SweetAlert2 loading and displays toast notifications on page load.

---

## 2. Business Goal
Provide a quick verification tool to confirm SweetAlert2 can be loaded from the File Cabinet/media URL in NetSuite.

---

## 3. User Story
- As a developer, I want to confirm SweetAlert2 can be loaded so that I can use it in client scripts.
- As a tester, I want to see a visible success toast so that I know the loader works.
- As an admin, I want logs of attempts so that failures are diagnosable.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | hul-swal2-js | Client script load | Attempt to load SweetAlert2 and show success toast |
| window.load | hul-swal2-js | Window load | Attempt to show a toast |

---

## 5. Functional Requirements
- The system must attempt to load SweetAlert2 from multiple URLs (media URL and File Cabinet path).
- The system must avoid duplicate script injection by using a shared tag ID (hul-swal2-js).
- The system must log loader attempts and outcomes.
- On pageInit, the system must attempt to load SweetAlert2 and show a success toast.
- The system must also attempt to show a toast on window.load.
- If all URLs fail, the loader must throw a descriptive error.

---

## 6. Data Contract
### Record Types Involved
- None

### Fields Referenced
- hul-swal2-js

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- SweetAlert2 file missing: loader throws after all attempts.
- Existing tag already loaded: no duplicate injection.

---

## 8. Implementation Notes (Optional)
- Logs show each attempt and outcome.

---

## 9. Acceptance Criteria
- Given pageInit, when SweetAlert2 loads, then a toast appears.
- Given multiple candidate URLs, when loading, then each is tried until success.
- Given logs, when loading, then each attempt and outcome is logged.
- Given existing script tag, when loading, then no duplicate injection occurs.

---

## 10. Testing Notes
- Verify pageInit triggers SweetAlert2 load and toast.
- Verify window.load triggers a second toast.
- Verify missing file throws a descriptive error.

---

## 11. Deployment Notes
- Upload hul_testing_sweet_alert.js.
- Deploy to a test record or form as a client script.
- Rollback: remove the client script deployment.

---

## 12. Open Questions / TBDs
- Should this test script be removed after validation?
- Do we need environment-specific media URLs?
- Media URL changes.
- Test script left active in production.

---
