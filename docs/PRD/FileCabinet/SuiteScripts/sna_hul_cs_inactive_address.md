# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-InactiveAddress
title: Inactive Address Warning Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_inactive_address.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Transaction (invoice, sales order, etc.)
  - Support Case
  - Customer
  - Custom Record (customrecord_nx_asset)
  - Address

---

## 1. Overview
A client script that warns users when selected billing, shipping, or job site addresses are marked inactive.

---

## 2. Business Goal
Reduce the risk of sending documents or services to inactive addresses.

---

## 3. User Story
As a coordinator, when I select an address on a transaction or case, I want an alert if the address is inactive, so that I can choose a valid location.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | billingaddress_key, shippingaddress_key | address selected | Warn if address inactive |
| fieldChanged | billingaddress_key, shippingaddress_key | address changed | Warn if address inactive |
| pageInit (case) | custevent_nx_case_asset | asset selected | Warn if job site address inactive |

---

## 5. Functional Requirements
- On page init, check billing and shipping addresses for inactive flags.
- On field change for billing or shipping address, re-check and warn if inactive.
- On support cases, check the related asset job site address for inactivity.
- Display warning messages using alerts and UI message notifications.

---

## 6. Data Contract
### Record Types Involved
- Transaction (invoice, sales order, etc.)
- Support Case
- Customer
- Custom Record (customrecord_nx_asset)
- Address

### Fields Referenced
- Address | custrecord_sn_inactive_address
- Case | custevent_nx_case_asset
- Asset | custrecord_nx_asset_customer
- Asset | custrecord_nx_asset_address
- Transaction | billingaddress_key
- Transaction | shippingaddress_key

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No address selected.
- Customer addressbook does not contain asset address ID.
- Address lookup fails; warning should not crash the form.

---

## 8. Implementation Notes (Optional)
- Requires address internal IDs via `billingaddress_key` and `shippingaddress_key`.
- Client-side record load for customer addressbook on cases.

---

## 9. Acceptance Criteria
- Given an inactive billing or shipping address, when selected, then a warning is shown.
- Given an inactive job site address on a case, when selected, then a warning is shown.

---

## 10. Testing Notes
- Select inactive billing and shipping addresses; confirm warnings.
- Select case asset linked to inactive address; confirm warning.
- No address selected; confirm no warning.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_inactive_address.js`.
- Deploy to transaction and case forms.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should inactive address selection block save instead of warning?
- Risk: Customer addressbook lookup is slow.

---
