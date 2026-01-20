# PRD_TEMPLATE.md
# NetSuite Customization Product Requirement Document

---
## Metadata
prd_id: TBD
title: TBD
status: TBD
owner: TBD
created: TBD
last_updated: TBD

script:
  type: TBD        # client | user_event | map_reduce | suitelet | workflow_action
  file: TBD
  script_id: TBD
  deployment_id: TBD

record_types:
  - TBD

---

## 1. Overview
Brief description of what this customization does and why it exists.

---

## 2. Business Goal
What business problem this solves. One or two sentences.

---

## 3. User Story
As a <user>, when <condition>, I want <behavior>, so that <outcome>.

---

## 4. Trigger Matrix
| Event | Field(s) | Condition | Action |
|------|----------|-----------|--------|
| TBD  | TBD      | TBD       | TBD    |

---

## 5. Functional Requirements
Bullet list of required behaviors. Use clear, testable language.

---

## 6. Data Contract
### Record Types Involved
- TBD

### Fields Referenced
- TBD

Schemas (if known):
- TBD

---

## 7. Validation & Edge Cases
Describe any validation rules, blocking behavior, or edge cases.

---

## 8. Implementation Notes (Optional)
Only include constraints if applicable.
- Script must reuse existing deployment: TBD
- Dispatcher required: TBD
- Performance/governance considerations: TBD

---

## 9. Acceptance Criteria
Use Given / When / Then format.
- Given TBD, when TBD, then TBD.

---

## 10. Testing Notes
How this should be tested (manual or automated).

---

## 11. Deployment Notes
Environment considerations, rollout notes, or dependencies.

---

## 12. Open Questions / TBDs
Explicit list of unresolved items.

---
