# PRD_REWRITE_RULES.md
# Codex PRD Structural Rewrite Rules

Purpose:
These rules govern how Codex rewrites existing PRDs into the canonical PRD_TEMPLATE.md format.
This is a STRUCTURE-ONLY operation.

---

## 1. Core Rules (Non-Negotiable)

1. Do NOT change business meaning or intent.
2. Do NOT add new requirements.
3. Do NOT infer or invent:
   - field IDs
   - record types
   - script IDs
   - deployment IDs
4. If information is missing or unclear, write `TBD`.
5. Preserve original wording wherever possible.
6. Do NOT optimize, refactor, or simplify logic.
7. Do NOT introduce dispatcher assumptions unless explicitly stated in the source PRD.

---

## 2. Allowed Transformations

Codex MAY:
- Reorder content to match PRD_TEMPLATE.md
- Convert prose descriptions into:
  - bullet lists
  - tables (e.g., Trigger Matrix)
- Normalize headings
- Move inline notes into appropriate sections
- Extract triggers mentioned in text into the Trigger Matrix

Codex MAY NOT:
- Change conditions
- Add validation logic
- Introduce new fields or records

---

## 3. Trigger Matrix Rules

- Only include triggers explicitly mentioned in the source PRD
- If event type is unclear, use `TBD`
- If fields are unclear, use `TBD`
- Do NOT invent client vs UE context

---

## 4. Data Contract Rules

- List only records and fields explicitly mentioned
- If a field name is described but not given, mark `TBD`
- Schema references should be `TBD` unless explicitly known

---

## 5. Acceptance Criteria Rules

- Convert existing acceptance language into Given / When / Then
- If acceptance criteria do not exist, add a placeholder with `TBD`
- Do NOT invent success conditions

---

## 6. Open Questions Section

- All unresolved items MUST be listed
- This section is required
- Do NOT attempt to resolve open questions

---

## 7. Output Requirements

Each rewritten PRD must:
- Fully conform to PRD_TEMPLATE.md
- Contain all required sections
- Contain no invented information
