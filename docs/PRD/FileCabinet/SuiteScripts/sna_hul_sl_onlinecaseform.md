# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-OnlineCaseForm
title: Online Case Form Data
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_onlinecaseform.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_nx_asset
  - customrecord_sna_objects
  - customer

---

## 1. Overview
Suitelet that returns object or customer data as JSON for an online case form.

---

## 2. Business Goal
Provides lookup data for case forms based on asset or customer input.

---

## 3. User Story
- As a case form user, when I auto-fill object data, I want to submit cases faster, so that intake is efficient.
- As a support user, when I look up customer billing details, I want contact info to be accurate, so that follow-up is correct.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | assetobj, cust | `assetobj` or `cust` provided | Return JSON for object or customer fields |

---

## 5. Functional Requirements
- Accept `assetobj` and/or `cust` request parameters.
- When `assetobj` is provided, lookup `customrecord_nx_asset` to find the related object ID.
- Return object fields from `customrecord_sna_objects`.
- When `cust` is provided, lookup customer data by `entityid`.
- Return JSON responses for object or customer requests.

---

## 6. Data Contract
### Record Types Involved
- customrecord_nx_asset
- customrecord_sna_objects
- customer

### Fields Referenced
- customrecord_nx_asset.custrecord_sna_hul_nxcassetobject
- customrecord_sna_objects.custrecord_sna_fleet_code
- customrecord_sna_objects.custrecord_sna_serial_no
- customrecord_sna_objects.custrecord_sna_man_code
- customrecord_sna_objects.custrecord_sna_equipment_model
- customrecord_sna_objects.custrecord_sna_frame_no
- customrecord_sna_objects.custrecord_sna_power_new
- customrecord_sna_objects.custrecord_sna_capacity_new
- customrecord_sna_objects.custrecord_sna_tires_new
- customrecord_sna_objects.custrecord_sna_work_height
- customrecord_sna_objects.custrecord_sna_warranty_type
- customer.billaddress1
- customer.billaddress2
- customer.billcity
- customer.billzipcode
- customer.statedisplayname
- customer.companyname
- customer.email

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Unknown asset returns empty object.
- Unknown customer returns empty response.
- Missing parameters returns no data.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Two lookups at most per request.

---

## 9. Acceptance Criteria
- Given `assetobj` is passed, when the Suitelet runs, then the JSON response includes object fields.
- Given `cust` is passed, when the Suitelet runs, then the JSON response includes customer billing fields.

---

## 10. Testing Notes
Manual tests:
- Asset ID returns object values.
- Customer entity ID returns billing details.
- Unknown asset returns empty object.
- Unknown customer returns empty response.
- Missing parameters returns no data.

---

## 11. Deployment Notes
- Confirm field IDs for asset-object relationship.
- Deploy Suitelet.
- Update case form to request data.

---

## 12. Open Questions / TBDs
- Should customer lookup support internal ID as well as entity ID?

---
