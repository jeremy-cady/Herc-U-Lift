# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-LinkSiteAsset
title: Link Site Asset Address Select (Customer Trigger)
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: map_reduce
  file: FileCabinet/SuiteScripts/sna_hul_mr_linksiteasset.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Customer (search.Type.CUSTOMER)

---

## 1. Overview
A Map/Reduce script that loads customers from a saved search and saves each record to trigger a User Event script.

---

## 2. Business Goal
It ensures customer site asset address selection logic runs for records missing address data.

---

## 3. User Story
As a data admin, when customer site assets are missing addresses, I want customer site assets updated, so that data stays consistent.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD | TBD | TBD | TBD |

---

## 5. Functional Requirements
- The script must load the saved search `customsearch_sna_no_address_site_asset`.
- For each result, the script must load the customer record and save it.
- The script must log the customer ID after save.

---

## 6. Data Contract
### Record Types Involved
- Customer (`search.Type.CUSTOMER`)

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Customer record fails to load; script logs error.
- Search errors should appear in summarize stage logs.

---

## 8. Implementation Notes (Optional)
- Performance/governance considerations: One customer record load/save per result.
- Integration point: User Event script runs on save.
- Risk: Large customer volumes.

---

## 9. Acceptance Criteria
- Given customers returned by the saved search, when the script runs, then customer records are saved.
- Given a saved customer record, when the script saves it, then the related User Event runs on save.

---

## 10. Testing Notes
- Happy path: Customer returned by search is saved and UE updates address data.
- Edge case: Customer record fails to load; script logs error.
- Error handling: Search errors should appear in summarize stage logs.
- Test data: Saved search `customsearch_sna_no_address_site_asset` with sample customers.
- Sandbox setup: Ensure User Event deployment is active for customer records.

---

## 11. Deployment Notes
- Confirm `customsearch_sna_no_address_site_asset` exists and is correct.
- Upload `sna_hul_mr_linksiteasset.js`.
- Deploy Map/Reduce with search access.
- Post-deployment: Confirm address updates on sample customers.
- Rollback plan: Disable script deployment.

---

## 12. Open Questions / TBDs
- Created date is not specified.
- Last updated date is not specified.
- Script ID is not specified.
- Deployment ID is not specified.
- Trigger event details are not specified.
- Fields referenced are not specified.
- Schema details are not specified.
- Should this script be scheduled or ad-hoc only?
- Timeline milestone dates are not specified.
- Revision history date is not specified.

---
