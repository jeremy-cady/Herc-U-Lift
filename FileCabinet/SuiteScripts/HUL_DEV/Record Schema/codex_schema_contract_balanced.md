# Codex Schema Contract — NetSuite (Balanced)

## Purpose

This document defines how Codex must reason about NetSuite schemas in this account.
It exists to prevent guessing, hallucination, and UI-based assumptions while still
allowing productive code generation.

This contract is **authoritative for AI behavior**, not for runtime execution.

---

## 1. Authority Hierarchy

1. The **Schema Registry JSON files** are the single source of truth for:
   - Record existence
   - Body fields
   - Sublists
   - Sublist fields

2. NetSuite **custom forms are NOT authoritative** for:
   - Field existence
   - Field availability
   - Required / mandatory status

3. Saved Searches, UI labels, and form layouts are **informational only**
   and must never be used as a source of script IDs.

If a field, sublist, or record is not present in the schema registry,
Codex must not reference it without clarification.

---

## 2. Allowed Assumptions (Balanced)

Codex MAY assume the following unless told otherwise:

- Fields in the schema registry exist at the record level
- Fields are optional unless explicitly stated as required
- Server-side scripts can access all schema-listed fields
- Metadata extraction scripts are read-only and safe

Codex should prefer safety checks but does not need to over-guard
in clearly server-side contexts unless ambiguity exists.

---

## 3. Prohibited Assumptions

Codex must NOT:

- Invent field IDs, sublist IDs, or custom segments
- Infer required fields from custom forms
- Assume sublists exist without checking the schema
- Infer joins or related records without explicit instruction
- Use Saved Search column labels as field IDs
- Optimize, refactor, or “improve” logic unless requested

---

## 4. Required Safety Checks

Before generating NetSuite code, Codex must:

1. Confirm the record type exists in the schema registry
2. Confirm all referenced fields exist in the registry
3. Guard sublist access when:
   - Script type is Client Script, or
   - Record context is ambiguous
4. Treat all fields as optional unless explicitly stated otherwise

If any required information is missing, Codex must ask a clarifying question
instead of guessing.

---

## 5. Script Context Awareness

Codex must adjust behavior based on script type:

### Server-side scripts (UE, MR, Suitelet, RESTlet)
- May reference any field in the schema registry
- May assume full metadata visibility
- Should include defensive checks only when appropriate

### Client Scripts
- Must assume fields may be hidden or absent
- Must guard sublist and field access
- Must not rely on form-level mandatory behavior

---

## 6. When Information Is Missing

If Codex cannot verify a required detail from the schema registry or this contract:

- Codex must pause
- Codex must ask a clarifying question
- Codex must not generate speculative code

Silence or ambiguity is not permission to guess.

---

## 7. Usage Instruction

When requesting code generation, the user should reference this contract explicitly.

Example:

“Using the schema registry and the Codex Schema Contract, generate a SuiteScript 2.x
User Event script for Sales Orders.”

This signals Codex to operate in compliant mode.

---

## 8. Contract Intent

This contract is intentionally **balanced**:

- Strict enough to prevent costly errors
- Permissive enough to remain productive
- Explicit enough to be enforceable

If behavior deviates from this contract, the contract should be updated
before correcting the code.
