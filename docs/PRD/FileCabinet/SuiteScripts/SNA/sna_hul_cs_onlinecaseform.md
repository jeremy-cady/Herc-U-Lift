# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-OnlineCaseFormCS
title: Online Case Form Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/SNA/sna_hul_cs_onlinecaseform.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Support Case
  - Customer
  - Asset/Object

---

## 1. Overview
A client script that manages field visibility and auto-populates customer and asset fields on the online case form.

## 2. Business Goal
Ensures only relevant fields are shown based on case category/issue and automates population of customer and asset details from Suitelet lookups.

## 3. User Story
As a customer, when I fill out the online case form, I want only relevant fields shown, so that the form is easier to complete.

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| fieldChanged | `category`, `issue` | Online case form | Show/hide fields based on category and issue |
| fieldChanged | `custevent_sna_hul_customer`, `custevent_sna_customer_id` | Customer changes | Call Suitelet and populate customer fields |
| fieldChanged | Asset fields | Asset changes | Call Suitelet and populate equipment details |
| saveRecord | `issue` | Complaint or Question category | Require issue before save |

## 5. Functional Requirements
- The system must hide or show groups of fields based on `category` and `issue` selections.
- The system must hide all related fields when category is empty.
- For Parts Request categories, the system must show asset site/object fields.
- For Rental/Delivery/Service categories, the system must show rental asset fields and service type fields (for Service Request).
- For Complaint/Question categories, the system must show fields based on issue type (rentals/deliveries/maintenance/installations/repair vs equipment/parts sales).
- When `custevent_sna_hul_customer` or `custevent_sna_customer_id` changes, the system must call a Suitelet and populate company name, email, and billing address fields.
- When asset fields change, the system must call a Suitelet and populate equipment details.
- On save, the system must require `issue` when category is Complaint or Question.

## 6. Data Contract
### Record Types Involved
- Support Case
- Customer
- Asset/Object

### Fields Referenced
- Case fields referenced in show/hide logic (e.g., `custevent_sna_hul_casefleetcode`, `custevent_nx_case_asset`, `custevent_sna_hul_service_type`).
- Customer fields: `custevent_sna_hul_customer`, `custevent_sna_customer_id`.

Schemas (if known):
- TBD

## 7. Validation & Edge Cases
- Suitelet returns empty response; fields clear and default customer set.
- Multiple assets selected; general fields hidden.
- Suitelet call fails; user sees missing data and logs in console.

## 8. Implementation Notes (Optional)
- Uses `https.get` to call Suitelet.
- Defaults customer to internal ID 810 when lookup returns empty.

## 9. Acceptance Criteria
- Given category/issue selections, when fields change, then field visibility updates correctly.
- Given customer lookup, when the Suitelet returns data, then customer fields populate.
- Given asset lookup, when the Suitelet returns data, then equipment fields populate.
- Given Complaint or Question category without issue, when saving, then save is blocked.

## 10. Testing Notes
- Select category and issue combinations; fields show/hide correctly.
- Enter customer ID; fields populate with customer data.
- Select an asset; equipment fields populate.
- Suitelet returns empty response; fields clear and default customer set.
- Multiple assets selected; general fields hidden.
- Suitelet call fails; user sees missing data and logs in console.

## 11. Deployment Notes
- Upload `sna_hul_cs_onlinecaseform.js`.
- Deploy to the online case form.
- Validate lookups and field visibility.

## 12. Open Questions / TBDs
- Script ID: TBD
- Deployment ID: TBD
- Created date: TBD
- Last updated date: TBD
- Should the Suitelet responses be cached to reduce calls?
- Should the default customer ID be configurable?
- Risk: Suitelet unavailable (Mitigation: Add error messaging or fallback behavior)
- Risk: Excessive Suitelet calls degrade UI (Mitigation: Throttle fieldChanged calls)

---
