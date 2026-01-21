# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-MetovaIntegration
title: Metova Integration
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/sna_hul_rl_metova_integration.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_objects
  - customrecord_sna_hul_hour_meter

---

## 1. Overview
RESTlet integration for Metova to create, update, fetch, and delete equipment objects and hour meter readings.

---

## 2. Business Goal
Provides a programmatic API for external systems to sync object records and hour meter data into NetSuite.

---

## 3. User Story
- As an integration system, when I create or update object records, I want equipment to stay in sync, so that records match external systems.
- As an integration system, when I send hour meter readings, I want usage tracked, so that meter history is current.
- As an admin, when I query by GPS serial, I want object data and meter history, so that I can retrieve object details.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet request | type | `type=object` or `type=hourMeter` | Create/update objects or hour meters, or retrieve/delete records |

---

## 5. Functional Requirements
- Accept `type=object` or `type=hourMeter` in RESTlet requests.
- Create or update `customrecord_sna_objects` for object POST/PUT.
- Create or update `customrecord_sna_hul_hour_meter` for hour meter POST/PUT.
- Return objects filtered by GPS serial on GET.
- Return hour meter records associated with returned objects.
- Delete objects or hour meter records by ID on DELETE.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_objects
- customrecord_sna_hul_hour_meter

### Fields Referenced
- customrecord_sna_objects.name
- customrecord_sna_objects.custrecord_sna_fleet_code
- customrecord_sna_objects.custrecord_sna_serial_no
- customrecord_sna_objects.cseg_sna_hul_eq_seg
- customrecord_sna_objects.cseg_hul_mfg
- customrecord_sna_objects.custrecord_sna_equipment_model
- customrecord_sna_objects.custrecord_sna_year
- customrecord_sna_objects.custrecord_hul_meter_key_static
- customrecord_sna_objects.custrecordcustrecord_hul_gps_serial
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_object_ref
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_external_id
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_date
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_time
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_hour_meter_reading
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_ignore_in_calculation
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_hr_meter_source
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_source_record
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_actual_reading
- customrecord_sna_hul_hour_meter.custrecord_sna_hul_meter_used

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- RESTlet payload validation is minimal.
- GET with unknown GPS serial returns empty array.
- Delete with invalid ID returns error message.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: GET builds large column lists; may be heavy.

---

## 9. Acceptance Criteria
- Given POST/PUT requests with `type`, when the RESTlet runs, then the correct record type is created or updated.
- Given a GET request with `gpsSerial`, when the RESTlet runs, then objects are returned filtered by GPS serial and include related hour meters.
- Given a DELETE request by ID, when the RESTlet runs, then the specified record is removed.

---

## 10. Testing Notes
Manual tests:
- POST object creates a new object record.
- POST hour meter creates an hour meter record linked to an object.
- GET object with GPS serial returns object plus hour meters.
- PUT updates an existing record with partial fields.
- GET with unknown GPS serial returns empty array.
- Delete with invalid ID returns error message.

---

## 11. Deployment Notes
- Confirm RESTlet deployment and integration role.
- Validate custom record fields.
- Deploy RESTlet.
- Configure integration to call RESTlet endpoints.

---

## 12. Open Questions / TBDs
- Should the GET API support additional filters beyond GPS serial?

---
