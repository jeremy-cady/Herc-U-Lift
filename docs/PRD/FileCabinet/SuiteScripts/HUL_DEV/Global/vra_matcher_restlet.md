# PRD: VRA Matcher RESTlet
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-VRAMatcherRestlet
title: VRA Matcher RESTlet
status: Implemented
owner: Unknown
created: Unknown
last_updated: Unknown

script:
  type: restlet
  file: FileCabinet/SuiteScripts/HUL_DEV/Global/vra_matcher_restlet.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Vendor Return Authorization
  - Vendor
  - Item

---

## 1. Overview
A RESTlet that matches vendor credits to Vendor Return Authorizations (VRAs) using a VRA number, PO number, or vendor + item matching logic.

---

## 2. Business Goal
Automate matching vendor credits to VRAs for downstream processing and reconciliation workflows.

---

## 3. User Story
- As an integration system, I want to match a credit to a VRA so that reconciliation is automated.
- As a buyer, I want PO or VRA matching so that I can review return data quickly.
- As an operator, I want fallback item matching so that I can still match when IDs are missing.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| RESTlet POST | vraNumber, poNumber, vendorId, vendorName, lineItems, processId, creditTotal | Match attempts in order (VRA number, PO number, vendor + items) | Return best VRA match and line items |

---

## 5. Functional Requirements
- The system must accept POST data with vraNumber, poNumber, vendorId, vendorName, lineItems, processId, creditTotal.
- The system must attempt matching in order: direct VRA number search, PO number to VRA search, vendor + line item matching.
- The system must return matchFound: true with VRA details when a match is found.
- The system must return matchFound: false with attempted search details when no match is found.
- Vendor line item matching must compare credit item part numbers to VRA item numbers, allow VRA item suffix removal (-JLG, -MIT, -MITSU, -CAT, -HYU), and compare vendor item name field custcol_sna_vendor_item_name.
- The system must choose the best VRA match based on match percentage and require >= 50% threshold.
- The system must return VRA line items for matched VRAs.
- Errors must return a response with matchFound: false and error details.

---

## 6. Data Contract
### Record Types Involved
- Vendor Return Authorization
- Vendor
- Item

### Fields Referenced
- vraNumber
- poNumber
- vendorId
- vendorName
- lineItems
- processId
- creditTotal
- custcol_sna_vendor_item_name

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Vendor name not found returns no match.
- Line items do not match any VRA lines.
- Multiple VRAs exist; best match selected by score.
- Search errors return matchFound: false with error text.

---

## 8. Implementation Notes (Optional)
- Matching threshold fixed at 50%.

---

## 9. Acceptance Criteria
- Given vraNumber, when posted, then a direct match is returned when available.
- Given poNumber, when posted, then a PO-based match is returned when available.
- Given vendor + line items, when posted, then the best match is returned when >= 50% of items match.
- Given no match, when posted, then matchFound: false is returned with attempted search details.

---

## 10. Testing Notes
- POST with valid vraNumber and confirm direct match.
- POST with poNumber and confirm PO match.
- POST with vendor + line items and confirm match above 50%.
- Verify vendor name not found returns no match.
- Verify search errors return matchFound: false.

---

## 11. Deployment Notes
- Upload vra_matcher_restlet.js.
- Create RESTlet script record and deploy.
- Assign integration role permissions.
- Rollback: disable RESTlet deployment.

---

## 12. Open Questions / TBDs
- Should the match threshold be configurable?
- Should creditTotal be used to validate matches?
- Low match accuracy with noisy item numbers.
- High latency with many line items.

---
