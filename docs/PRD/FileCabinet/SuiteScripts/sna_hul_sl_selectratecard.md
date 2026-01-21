# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: PRD-UNKNOWN-SelectRateCard
title: Select Rental Rate Card
status: Implemented
owner: Jeremy Cady
created: Unknown
last_updated: Unknown

script:
  type: suitelet
  file: FileCabinet/SuiteScripts/sna_hul_sl_selectratecard.js
  script_id: TBD
  deployment_id: TBD

record_types:
  - customrecord_sna_hul_rental_rate_card
  - customrecord_sna_objects

---

## 1. Overview
Suitelet that lists rental rate cards and allows users to select the best match for a rental object.

---

## 2. Business Goal
Provides a filtered, prioritized list of rate cards so rental pricing can be determined consistently.

---

## 3. User Story
- As a rental user, when I select the best rate card, I want pricing to be accurate, so that rental pricing is correct.
- As a rental user, when I filter by object attributes, I want rate card matches to be relevant, so that selection is efficient.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| Suitelet request | object, customer, price group, location, line context | Parameters provided | Display ranked rate cards and redirect on selection |

---

## 5. Functional Requirements
- Accept parameters for object, customer, price group, location, and line context.
- Search `customsearch_sna_hul_ratecard` and apply filter expressions based on object attributes.
- Calculate a counter of matched parameters for ranking.
- Display a paged list of rate cards with match counters and details.
- Redirect to `sna_hul_sl_costingpage` with the selected rate card and context.

---

## 6. Data Contract
### Record Types Involved
- customrecord_sna_hul_rental_rate_card
- customrecord_sna_objects

### Fields Referenced
- Rate Card | custrecord_sna_hul_ratecard_custpricegrp | Customer price group
- Rate Card | custrecord_sna_hul_ratecard_object | Object
- Rate Card | custrecord_sna_hul_ratecard_customer | Customer
- Rate Card | custrecord_sna_hul_ratecard_eqmodel | Equipment model
- Rate Card | cseg_sna_hul_eq_seg | Equipment segment
- Rate Card | cseg_hul_mfg | Manufacturer
- Rate Card | custrecord_sna_hul_ratecard_respcenter | Responsibility center
- Rate Card | custrecord_sna_hul_ratecard_height | Height
- Rate Card | custrecord_sna_hul_ratecard_min_cap | Min capacity
- Rate Card | custrecord_sna_hul_ratecard_max_cap | Max capacity

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
- No matches shows empty list.
- Show All overrides filters.
- Invalid object ID defaults to broader search.

---

## 8. Implementation Notes (Optional)
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: Search paging and object lookups.

---

## 9. Acceptance Criteria
- Given rate cards exist, when the Suitelet runs, then rate cards are ranked by match counters.
- Given a rate card is selected, when the Suitelet runs, then the selected rate card is passed to the rental costing flow.

---

## 10. Testing Notes
Manual tests:
- Rate cards display and selection redirects.
- No matches shows empty list.
- Show All overrides filters.
- Invalid object ID defaults to broader search.

---

## 11. Deployment Notes
- Rate card search exists and is up to date.
- Deploy Suitelet.
- Link from rental flow.

---

## 12. Open Questions / TBDs
- Should match weighting prioritize customer-specific cards over object-specific cards?

---
