# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SalesRepMatrixMapping
title: Sales Rep Matrix Mapping Client Script
status: Implemented
owner: Jeremy Cady
created: TBD
last_updated: TBD

script:
  type: client
  file: FileCabinet/SuiteScripts/sna_hul_cs_sales_rep_matrix_mapping.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - Custom Record (Sales Rep Matrix Customer Mapping)

---

## 1. Overview
A client script on the Sales Rep Matrix Customer Mapping record that forces the override flag when editing a Sales Rep mapping.

---

## 2. Business Goal
Ensure override logic is preserved when editing mapping records via a special URL parameter.

---

## 3. User Story
As an admin, when I edit sales rep mappings, I want override mode preserved, so that mapping updates are intentional.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| pageInit | editSalesRep | URL parameter is T | Set custrecord_salesrep_mapping_override to true |
| fieldChanged | custrecord_salesrep_mapping_override | value set to true | Reload record with editSalesRep=T |

---

## 5. Functional Requirements
- On page init, if URL parameter `editSalesRep` is `T`, set `custrecord_salesrep_mapping_override` to true.
- When `custrecord_salesrep_mapping_override` changes to true, reload the record in edit mode with `editSalesRep=T` in the URL.

---

## 6. Data Contract
### Record Types Involved
- Custom Record (Sales Rep Matrix Customer Mapping)

### Fields Referenced
- custrecord_salesrep_mapping_override

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- Missing record ID should prevent reload.
- URL param removed by navigation.

---

## 8. Implementation Notes (Optional)
- Relies on browser URL parameter `editSalesRep`.

---

## 9. Acceptance Criteria
- Given `editSalesRep=T`, when the record loads, then override flag is set automatically.
- Given override set to true, when changed, then the record reloads with the parameter.

---

## 10. Testing Notes
- Open mapping record with `editSalesRep=T`; verify override checked.
- Toggle override without URL parameter; verify record reloads with parameter.

---

## 11. Deployment Notes
- Upload `sna_hul_cs_sales_rep_matrix_mapping.js`.
- Deploy to the Sales Rep Matrix Customer Mapping record.
- Rollback: remove client script deployment.

---

## 12. Open Questions / TBDs
- Created date is TBD.
- Last updated date is TBD.
- Script ID is TBD.
- Deployment ID is TBD.
- Should override be set only when editing specific fields?
- Risk: URL param removed by navigation.

---
