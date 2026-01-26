# PRD Authoring and Strength Rules

## Purpose
This document defines how PRDs must be written and how Codex must evaluate the **strength, completeness, and authority** of PRD language.

It exists to prevent Codex from over-weighting examples, under-weighting terse constraints, or treating drafts as finalized specifications.

This document applies **in addition to**:
- `00_READ_THIS_FIRST.md`
- `10_PRD_INTERPRETATION_RULES.md`

---

## PRD Completeness Levels
Every PRD implicitly falls into one of the following completeness states. Codex must infer the *most conservative* applicable state.

### 1. Draft PRD
Characteristics:
- Missing sections
- Placeholder language
- Open questions embedded in text

Codex behavior:
- Treat missing information as **unknown**, not excluded
- Generate structural scaffolding only
- Surface all behavioral gaps as TODOs

---

### 2. Partial PRD
Characteristics:
- Core intent defined
- Some behaviors specified
- Other areas intentionally unspecified

Codex behavior:
- Implement **only** explicitly stated behaviors
- Do not infer behavior from examples or schema affordances
- Treat unspecified areas as out of scope unless explicitly labeled otherwise

---

### 3. Final PRD
Characteristics:
- Explicit behavioral statements
- Clear boundaries
- Minimal ambiguity

Codex behavior:
- Implement stated behavior literally
- Still surface ambiguity where present
- Do not optimize or extend beyond requirements

---

## Language Strength Hierarchy
Codex must interpret PRD language according to the following strength order:

1. **Must / Shall / Required** — mandatory behavior
2. **Must not / Shall not / Prohibited** — explicitly forbidden behavior
3. **May** — optional, requires explicit authorization to implement
4. **Should** — non-authoritative guidance; do not implement unless reinforced elsewhere
5. **Examples / Illustrations** — non-authoritative unless explicitly labeled as normative

If conflicting strength levels exist, Codex must surface the conflict.

---

## Examples Policy
Examples in PRDs:
- Are illustrative by default
- Do not authorize behavior
- Do not expand scope

Examples may only be treated as authoritative if explicitly labeled as:
- "Normative Example"
- "Required Example"

Absent such labeling, Codex must not implement example behavior.

---

## Omission Semantics
Codex must distinguish between:

- **Unknown**: information missing due to draft or ambiguity
- **Intentionally Omitted**: explicitly stated as deferred or out of scope

If omission intent is unclear, Codex must default to **unknown** and surface a TODO.

---

## Schema Interaction Rule
Record schemas define **capability**, not **permission**.

Codex must not:
- Use schema-available fields not authorized by the PRD
- Add joins, lookups, or enrichments solely because schema allows them
- Expand behavior based on schema affordances

Schema usage must always be justified by explicit PRD language.

---

## Question Surfacing Rule
When Codex encounters uncertainty, TODOs must be categorized as one of:
- **Blocking** — cannot proceed without resolution
- **Design** — requires human judgment
- **Deferred** — intentionally postponed

Codex must not silently resolve categorized uncertainties.

---

## Final Rule
PRDs constrain behavior. Schemas constrain possibility.

Codex must not allow either to expand the other implicitly.
